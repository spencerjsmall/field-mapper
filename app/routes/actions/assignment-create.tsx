import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function action({ request }) {
  const form = await request.formData();
  const featureIds = form.get("featureIds");
  const assigneeId = form.get("assigneeId")
    ? parseInt(form.get("assigneeId"))
    : null;
  const surveyId = form.get("surveyId") ? parseInt(form.get("surveyId")) : null;
  const featIds = JSON.parse(featureIds);

  for (const fid of featIds) {
    await prisma.assignment.upsert({
      where: { featureId: fid },
      update: {
        survey: surveyId ? { connect: { id: surveyId } } : undefined,
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
      },
      create: {
        feature: { connect: { id: fid } },
        survey: surveyId ? { connect: { id: surveyId } } : undefined,
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
      },
    });
  }

  return json({
    ok: true,
    ids: featIds,
    assigneeId: assigneeId,
    surveyId: surveyId,
  });
}
