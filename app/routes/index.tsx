import { LoaderFunction, redirect } from "@remix-run/node";
import { requireSession } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireSession(request);
  const role = session.get("role");
  return role === "ADMIN" ? redirect("/admin/home") : redirect("/home");
};
