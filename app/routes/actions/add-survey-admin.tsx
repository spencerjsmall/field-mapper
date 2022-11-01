import { prisma } from "~/utils/db.server";
import { ActionFunction, redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const { adminId, surveyId } = Object.fromEntries(await request.formData());
  await prisma.survey.update({
    where: { id: parseInt(surveyId) },
    data: { admins: { connect: { id: parseInt(adminId) } } },
  });
  return redirect(`/admin/surveys`);
};