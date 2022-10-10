import { prisma } from "~/utils/db.server";
import {
  LoaderFunction,
  json,
  ActionFunction,
  redirect,
} from "@remix-run/node";
import { useLoaderData, Link, useSubmit } from "@remix-run/react";
import { LayerUploader } from "~/components/layer-uploader";
import {
  requireUserId,
  getUserSession,
  commitSession,
} from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const { taskId } = Object.fromEntries(await request.formData());
  session.set("task", taskId);
  return redirect(`/admin/tasks/${taskId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  // const res = await fetch(
  //   "https://rec4gis.sfgov.org/recgs/rest/workspaces/sfgis_in/layers"
  // );
  // console.log(res);

  const userId = await requireUserId(request);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const userLayers = await prisma.layer.findMany({
    where: {
      dispatcherId: userId,
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
    <div className="flex flex-col bg-[#2A2D5C] items-center justify-center h-full w-full">
      <h1 className="text-white text-5xl mb-3">Welcome, {user.firstName}!</h1>
      <h1 className="text-gray-500 text-3xl mb-14">
        Select a layer to make assignments
      </h1>
      <div className="justify-center space-x-24 w-full items-start flex flex-row">
        {userLayers && (
          <ul className="justify-center items-center flex flex-col">
            <h2 className="pb-5 text-red-500 text-2xl">Your Layers</h2>
            {userLayers.map((layer, i) => (
              <li key={i}>
                <button
                  onClick={() => setTask(layer.name)}
                  className="btn no-underline font-mono btn-lg text-white btn-ghost"
                >
                  {layer.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col items-center justify-center">
          <h2 className="pb-7 text-red-500 text-2xl">Upload a Layer</h2>
          <LayerUploader />
        </div>
      </div>
    </div>
  );
}
