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
  const { layerId } = Object.fromEntries(await request.formData());
  session.set("layerId", layerId);
  session.unset("viewState");
  return redirect(`/layers/${layerId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const surveyor = await prisma.surveyor.findUniqueOrThrow({
    where: {
      userId: userId,
    },
  });
  const userLayers = await prisma.layer.findMany({
    where: {
      features: {
        some: {
          assignment: {
            is: {
              assigneeId: surveyor.id,
            },
          },
        },
      },
    },
  });
  return { userLayers };
};

export default function HomePage() {
  const { userLayers } = useLoaderData();  
  const submit = useSubmit();

  const setLayer = (layerId: number) => {
    submit({ layerId: String(layerId) }, { method: "post" });
  };

  return (
    <div className="w-full h-full justify-center bg-ob bg-top bg-no-repeat bg-cover bg-fixed">
      <div className="flex flex-col group bg-black bg-opacity-70 justify-center h-full w-full">
        <ul className="justify-center items-center flex flex-col space-y-2">
          {userLayers.map((layer) => (
            <li key={layer.id}>
              <button
                onClick={() => setLayer(layer.id)}
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
