import { prisma } from "~/utils/db.server";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  getUserSession,
  commitSession,
  requireUserId,
} from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const { taskId } = Object.fromEntries(await request.formData());
  session.set("task", taskId);
  session.unset("viewState");
  return redirect(`/tasks/${taskId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const userLayers = await prisma.layer.findMany({
    where: {
      features: {
        some: {
          assignment: {
            is: {
              assigneeId: userId,
            },
          },
        },
      },
    },
  });
  return { user, userLayers };
};

export default function HomePage() {
  const { user, userLayers } = useLoaderData();
  const submit = useSubmit();

  const setTask = (layerName: string) => {
    submit({ taskId: layerName }, { method: "post" });
  };

  return (
    <div className="w-full h-full justify-center bg-ob bg-top bg-no-repeat bg-cover bg-fixed">
      <div className="flex flex-col group bg-black bg-opacity-70 justify-center h-full w-full">      
        <ul className="justify-center items-center flex flex-col space-y-2">
          {userLayers.map((layer) => (
            <li key={layer.id}>
              <button
                onClick={() => setTask(layer.name)}
                className="btn no-underline btn-lg text-white btn-ghost"
              >
                {layer.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
