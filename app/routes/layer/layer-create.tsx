import { ActionFunction, redirect } from "@remix-run/node";
import { getUserSession, commitSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  const { features, name, field, surveyId } = Object.fromEntries(
    await request.formData()
  );

  console.log("features", features);

  await prisma.layer.create({
    data: {
      name: String(name),
      labelField:
        field === "" ? null : String(field).toLowerCase().split(" ").join("_"),
      dispatcher: { connect: { id: userId } },
      features: {
        createMany: {
          data: JSON.parse(String(features)),
        },
      },
      defaultSurveyId: surveyId === "" ? null : String(surveyId),
    },
  });

  session.set("task", name);
  return redirect(`/admin/tasks/${name}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
