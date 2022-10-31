import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { getUserSession, commitSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import type { Prisma } from "@prisma/client";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  const { features, name, field, surveyId } = Object.fromEntries(
    await request.formData()
  );

  const parsedFeatures = JSON.parse(String(features), (key, value) =>
    typeof value == "string" &&
    value.length == 254 &&
    [...new Set(Array.from(value))].length == 1
      ? ""
      : value
  );

  let layer: Prisma.LayerCreateInput;
  if (features == "") {
    layer = {
      name: String(name),
      labelField: String(field),
      admins: { connect: { id: userId } },
      defaultSurvey: surveyId
        ? { connect: { id: parseInt(surveyId) } }
        : undefined,
    };
  } else {
    layer = {
      name: String(name),
      labelField: String(field),
      admins: { connect: { id: userId } },
      features: {
        createMany: {
          data: parsedFeatures,
        },
      },
      defaultSurvey: surveyId
        ? { connect: { id: parseInt(surveyId) } }
        : undefined,
    };
  }

  const newLayer = await prisma.layer.create({ data: layer });

  session.set("layer", newLayer.id);
  return redirect(`/admin/layers`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
