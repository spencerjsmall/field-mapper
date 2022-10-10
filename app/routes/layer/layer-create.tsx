import { ActionFunction, redirect } from "@remix-run/node";
import { getUserSession, commitSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  const { layerUrl, name, field } = Object.fromEntries(
    await request.formData()
  );

  await prisma.layer.create({
    data: {
      url: layerUrl,
      name: String(name),
      labelField: String(field).toLowerCase().split(" ").join("_"),
      dispatcher: { connect: { id: userId } },
    },
  });
  session.set("task", name);
  return redirect(`/admin/tasks/${name}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
