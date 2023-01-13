import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";
import { emailNewAssignment } from "~/utils/email.server";

export async function action({ request }) {
  const form = await request.formData();
  const featureIds = form.get("featureIds");
  const assigneeId =
    form.get("assigneeId") !== "" ? parseInt(form.get("assigneeId")) : null;
  const label = form.get("label") !== "" ? form.get("label") : null;
  const featIds = JSON.parse(featureIds);
  const mandatory =
    form.get("mandatory") === "Mixed"
      ? undefined
      : form.get("mandatory") === "True";

  for (const fid of featIds) {
    if (label) {
      await prisma.feature.update({
        where: { id: fid },
        data: {
          label: label,
        },
      });
    }
    const assn = await prisma.assignment.upsert({
      where: { featureId: fid },
      update: {
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
        mandatory: mandatory,
      },
      create: {
        feature: { connect: { id: fid } },
        assignee: assigneeId ? { connect: { id: assigneeId } } : undefined,
        mandatory: mandatory,
      },
      include: {
        assignee: {
          include: {
            user: true,
          },
        },
        feature: true,
      },
    });
    if (assigneeId) {
      emailNewAssignment(assn);
    }
  }

  return json({
    ok: true,
    ids: featIds,
    assigneeId: assigneeId,
    label: label,
    mandatory: mandatory,
  });
}
