import { prisma } from "~/utils/db.server";
import { ActionFunction, redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const { surveyorId, adminId } = Object.fromEntries(await request.formData());
  await prisma.admin.update({
    where: { id: parseInt(adminId) },
    data: { surveyors: { connect: { id: parseInt(surveyorId) } } },
  });
  return redirect(`/admin/surveyors`);
};
