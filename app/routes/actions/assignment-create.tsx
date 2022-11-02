import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function action({ request }) {
  let { featureIds, assigneeId, surveyId, actionId } = Object.fromEntries(
    await request.formData()
  );
  assigneeId = parseInt(assigneeId);
  surveyId = parseInt(surveyId);
  const featIds = JSON.parse("[" + featureIds + "]");

  switch (actionId) {
    case "create": {
      await prisma.assignment.create({
        data: {
          feature: { connect: { id: featIds[0] } },
          survey: { connect: { id: surveyId } },
          assignee: { connect: { id: assigneeId } },
        },
      });
    }
    case "update": {
      await prisma.assignment.update({
        where: {
          featureId: featIds[0],
        },
        data: {
          survey: { connect: { id: surveyId } },
          assignee: { connect: { id: assigneeId } },
        },
      });
    }
    case "upsert": {
      for (const fid of featIds) {
        await prisma.assignment.upsert({
          where: { featureId: fid },
          update: {
            survey: { connect: { id: surveyId } },
            assignee: { connect: { id: assigneeId } },
          },
          create: {
            feature: { connect: { id: fid } },
            survey: { connect: { id: surveyId } },
            assignee: { connect: { id: assigneeId } },
          },
        });
      }
      return json({
        ok: true,
        ids: featIds,
        assigneeId: assigneeId,
        surveyId: surveyId,
        actionId: actionId,
      });
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
}
