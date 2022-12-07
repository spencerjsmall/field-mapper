import { redirect, json, createCookieSessionStorage } from "@remix-run/node";
import type {
  AdminRegisterForm,
  RegisterForm,
  LoginForm,
  UpdateForm,
} from "./types.server";
import { prisma } from "./db.server";
import { createSurveyor, createUser, updateUser } from "./user.server";
import bcrypt from "bcryptjs";
import { SMTPClient } from "emailjs";
import type { User } from "@prisma/client";

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const emailClient = new SMTPClient({
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  host: process.env.SMTP_HOST,
  ssl: process.env.SMTP_REQUIRES_SSL == "true",
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
});

export const { getSession, commitSession, destroySession } =
  createCookieSessionStorage({
    cookie: {
      name: "field-session",
      secure: process.env.NODE_ENV === "production",
      secrets: [sessionSecret],
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    },
  });

export async function update(user: UpdateForm) {
  const updatedUser = await updateUser(user);
  if (!updatedUser) {
    return json(
      {
        error: `Something went wrong trying to update the user.`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 }
    );
  }
  return redirect("/");
}

export async function register(user: RegisterForm) {
  const exists = await prisma.user.count({ where: { email: user.email } });
  if (exists) {
    return json(
      { error: `User already exists with that email` },
      { status: 400 }
    );
  }

  const newUser = await createUser(user);
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user.`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 }
    );
  }
  return createUserSession(newUser, "/");
}

export async function adminRegister(user: AdminRegisterForm) {
  const exists = await prisma.user.count({ where: { email: user.email } });
  if (exists) {
    return json(
      { error: `User already exists with that email` },
      { status: 400 }
    );
  }

  const newUser = await createSurveyor(user);
  if (!newUser) {
    return json(
      {
        error: `Something went wrong trying to create a new user.`,
        fields: { email: user.email, password: user.password },
      },
      { status: 400 }
    );
  }
  return redirect("/admin/surveyors");
}

// Validate the user on email & password
export async function login({ email, password }: LoginForm) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { admin: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password)))
    return json({ error: `Incorrect login` }, { status: 400 });

  return createUserSession(user, "/");
}

export async function forgot({ email }) {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user)
    return json(
      { error: `No account exists with this email` },
      { status: 400 }
    );

  var chars =
    "0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var passwordLength = 8;
  var temp = "";

  for (var i = 0; i <= passwordLength; i++) {
    var randomNumber = Math.floor(Math.random() * chars.length);
    temp += chars.substring(randomNumber, randomNumber + 1);
  }

  emailClient.send(
    {
      text: `Your temporary password is: ${temp}`,
      from: "Field Mapper <sfgis.fieldmapper@gmail.com>",
      to: `${user.firstName} ${user.lastName} <${user.email}>`,
      subject: "Reset Password",
    },
    (err, message) => {
      console.log(err || message);
    }
  );

  return await updateUser({ id: String(user.id), password: temp });
}

export async function createUserSession(user: User, redirectTo: string) {
  const session = await getSession();
  session.set("userId", user.id);
  session.set("role", user.admin ? "admin" : "field");
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function requireSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }
  return session;
}

export async function requireFieldSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await requireSession(request);
  const role = session.get("role");
  if (role === "admin") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/admin/home?${searchParams}`);
  }
  return session;
}

export async function requireAdminSession(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await requireSession(request);
  const role = session.get("role");
  if (!role || role !== "admin") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/home?${searchParams}`);
  }
  return session;
}

export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/auth/login?${searchParams}`);
  }
  return userId;
}

export async function getUserSession(request: Request) {
  return getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  if (!userId || typeof userId !== "number") return null;
  return userId;
}

export async function getUser(request: Request) {
  const userId = await getUserId(request);
  if (typeof userId !== "number") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    return user;
  } catch {
    throw logout(request);
  }
}

export async function logout(request: Request) {
  const session = await getUserSession(request);
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
