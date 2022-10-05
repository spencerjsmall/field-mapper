import { prisma } from "~/utils/db.server";
import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, Form, Link } from "@remix-run/react";
import {
  getUserSession,
  commitSession,
  requireUserId,
} from "~/utils/auth.server";
import { getUserLayers } from "~/utils/geo.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const { taskId } = Object.fromEntries(await request.formData());
  session.set("task", taskId);
  return redirect(`/tasks/${taskId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userLayers = await getUserLayers(userId);
  return userLayers;
};

export default function HomePage() {
  const userLayers = useLoaderData();
  const submit = useSubmit();

  const setTask = (layerName: string) => {
    submit({ taskId: layerName }, { method: "post" });
  };

  return (
    <div className="w-full h-full justify-center items-center flex flex-col">
      <h1 className="text-white">Welcome!</h1>
      <h3 className="pb-5">Choose a layer to begin field collection</h3>
      <ul className="justify-center items-center flex flex-col space-y-2">
        {userLayers.map((layer) => (
          <li key={layer.id}>
            <button
              onClick={() => setTask(layer.name)}
              className="btn btn-lg btn-secondary"
            >
              <label>{layer.name}</label>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
