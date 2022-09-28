// app/routes/avatar.tsx
import { ActionFunction, json } from "@remix-run/node";
import { requireUserId } from "~/utils/auth.server";
import { uploadLayer } from "~/utils/s3.server";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  // 1
  const userId = await requireUserId(request);
  // 2
  const layerUrl = await uploadLayer(request);

  // 3
  await prisma.user.update({
    data: {
      layerUploads: { push: layerUrl },
    },
    where: {
      id: userId,
    },
  });

  // 4
  return json({ layerUrl });
};
