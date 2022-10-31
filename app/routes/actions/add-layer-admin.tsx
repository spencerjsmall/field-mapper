import { prisma } from "~/utils/db.server";
import { ActionFunction, redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const { adminId, layerId } = Object.fromEntries(await request.formData());
  await prisma.layer.update({
    where: { id: parseInt(layerId) },
    data: { admins: { connect: { id: parseInt(adminId) } } },
  });
  return redirect(`/admin/layers`);
};
