import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { surveyorId, adminId } = Object.fromEntries(await request.formData());
  await prisma.admin.update({
    where: { id: parseInt(adminId) },
    data: { surveyors: { disconnect: [{ id: parseInt(surveyorId) }] } },
  });
  return redirect("/admin/surveyors");
};