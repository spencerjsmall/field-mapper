import { json } from "@remix-run/node";
import { Form, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import { FormField } from "~/components/form-field";
import { update } from "~/utils/auth.server";
import {
  validateEmail,
  validateName,
  validatePassword,
} from "~/utils/validators.server";

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const id = form.get("adminId");
  const email = form.get("email");
  const password = form.get("password");
  let firstName = form.get("firstName");
  let lastName = form.get("lastName");

  // If not all data was passed, error
  if (
    typeof firstName !== "string" ||
    typeof lastName !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    return json({ error: `Invalid Form Data`, form: action }, { status: 400 });
  }

  // Validate email & password
  const errors = {
    email: validateEmail(email),
    password: password == "" ? false : validatePassword(password),
    firstName: validateName((firstName as string) || ""),
    lastName: validateName((lastName as string) || ""),
  };

  //  If there were any errors, return them
  if (Object.values(errors).some(Boolean))
    return json(
      {
        errors,
        fields: { email, password, firstName, lastName },
        form: action,
      },
      { status: 400 }
    );

  firstName = firstName as string;
  lastName = lastName as string;
  return await update({ id, email, password, firstName, lastName });
};

export default function AccountSettings() {
  const { userAdmin } = useOutletContext();

  const [formData, setFormData] = useState({
    email: userAdmin.user.email,
    password: "",
    firstName: userAdmin.user.firstName,
    lastName: userAdmin.user.lastName,
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center">
      <div className="h-fit py-12 px-20 rounded-xl flex items-center justify-center flex-col mx-auto w-fit bg-slate-700 border border-slate-500">
        <h1 className="text-white mb-8">Account Settings</h1>
        <Form method="post">
          <input
            type="text"
            name="adminId"
            value={String(userAdmin.id)}
            className="hidden"
            readOnly
          />
          <FormField
            htmlFor="firstName"
            label="First Name"
            onChange={(e) => handleInputChange(e, "firstName")}
            value={formData.firstName}
          />
          <FormField
            htmlFor="lastName"
            label="Last Name"
            onChange={(e) => handleInputChange(e, "lastName")}
            value={formData.lastName}
          />
          <FormField
            htmlFor="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange(e, "email")}
          />
          <FormField
            htmlFor="password"
            type="password"
            label="New Password"
            value={formData.password}
            onChange={(e) => handleInputChange(e, "password")}
          />

          <button
            type="submit"
            className="rounded-lg mt-6 bg-black w-full border-slate-600 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-red-500 hover:-translate-y-1"
          >
            Update
          </button>
        </Form>
      </div>
    </div>
  );
}
