import { ActionFunction, json, redirect } from "@remix-run/node";
import { adminRegister } from "~/utils/auth.server";

import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/utils/validators.server";

export const action: ActionFunction = async ({ request }) => {
  let { email, password, firstName, lastName, adminId } = Object.fromEntries(
    await request.formData()
  );

  // If not all data was passed, error
  if (typeof email !== "string" || typeof password !== "string") {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  // If not all data was passed, error
  if (typeof firstName !== "string" || typeof lastName !== "string") {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  // Validate email & password
  const errors = {
    email: validateEmail(email),
    password: validatePassword(password),
    firstName: validateName((firstName as string) || ""),
    lastName: validateName((lastName as string) || ""),
  };

  //  If there were any errors, return them
  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
      },
      { status: 400 }
    );

  firstName = firstName as string;
  lastName = lastName as string;
  adminId = parseInt(adminId);

  return await adminRegister({
    email,
    password,
    firstName,
    lastName,
    adminId,
  });
};
