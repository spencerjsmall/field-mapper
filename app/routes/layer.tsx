// app/routes/avatar.tsx
import { ActionFunction, json } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { uploadLayer } from "~/utils/s3.server";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const layerUrl = await uploadLayer(request);
  const extension = layerUrl.split(".").pop();

  if (
    extension == "dbf" ||
    extension == "shx" ||
    extension == "prj" ||
    extension == "cpg"
  ) {
    console.log("PASS");
    return null;
  }

  const newLayer = await prisma.layer.create({
    data: { url: layerUrl, dispatcher: { connect: { id: userId } } },
  });

  // 4
  return json(newLayer.id);
};
