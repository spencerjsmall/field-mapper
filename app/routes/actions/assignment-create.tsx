import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export async function action({ request }) {
  const { featureIds, assigneeEmail, surveyId, actionId } = Object.fromEntries(
    await request.formData()
  );
  const featIds = JSON.parse("[" + featureIds + "]");
  const assignee = await prisma.user.findUnique({
    where: { email: assigneeEmail },
  });

  if (assignee == null) {
    return json(
      { error: `User with that email does not yet exist` },
      { status: 400 }
    );
  }

  switch (actionId) {
    case "create": {
      await prisma.assignment.create({
        data: {
          feature: { connect: { id: parseInt(featIds[0]) } },
          surveyId: surveyId,
          assignee: { connect: { id: assignee.id } },
        },
      });
    }
    case "update": {
      let assignment = await prisma.assignment.findFirstOrThrow({
        where: { featureId: parseInt(featIds[0]) },
      });
      await prisma.assignment.update({
        where: {
          id: assignment.id,
        },
        data: {
          surveyId: surveyId,
          assignee: { connect: { id: assignee.id } },
        },
      });
    }
    case "upsert": {
      for (const id of featIds) {
        let assignment = await prisma.assignment.findFirst({
          where: { featureId: parseInt(id) },
        });
        await prisma.assignment.upsert({
          where: { id: assignment?.id ? assignment.id : -1 },
          update: {
            surveyId: surveyId,
            assignee: { connect: { id: assignee.id } },
          },
          create: {
            feature: { connect: { id: parseInt(id) } },
            surveyId: surveyId,
            assignee: { connect: { id: assignee.id } },
          },
        });
      }      
      return json({
        ok: true,
        ids: featIds,
        assigneeEmail: assigneeEmail,
        surveyId: surveyId,
        actionId: actionId,
      });
    }
    default:
      return json({ error: `Invalid Form Data` }, { status: 400 });
  }
}
