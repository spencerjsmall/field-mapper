import bcrypt from "bcryptjs";
import type { AdminRegisterForm, RegisterForm } from "./types.server";
import { prisma } from "./db.server";
import { Role } from "@prisma/client";

export const createUser = async (user: RegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      admin: {
        create: user.role == "ADMIN" ? {} : undefined,
      },
      surveyor: {
        create: user.role == "SURVEYOR" ? {} : undefined,
      },
    },
    include: { admin: true },
  });
  return newUser;
};

export const createSurveyor = async (user: AdminRegisterForm) => {
  const passwordHash = await bcrypt.hash(user.password, 10);
  const newUser = await prisma.user.create({
    data: {
      email: user.email,
      password: passwordHash,
      firstName: user.firstName,
      lastName: user.lastName,
      surveyor: {
        create: { admins: { connect: { id: user.adminId } } },
      },
    },
  });
  return newUser;
};

export const getUserById = async (userId: number) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

export const deleteUser = async (id: number) => {
  await prisma.user.delete({ where: { id } });
};
