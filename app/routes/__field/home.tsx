import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  getUserSession,
  commitSession,
  requireUserId,
} from "~/utils/auth.server";
import { getSurveyorLayers } from "~/utils/user.server";

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
  const userLayers = await getSurveyorLayers(userId)
  return { userLayers };
};

export default function HomePage() {
  const { userLayers } = useLoaderData();
  const submit = useSubmit();

  const setLayer = (layerId: number) => {
    submit({ layerId: String(layerId) }, { method: "post" });
  };

  return (
    <div className="w-full grow bg-ob bg-blend-multiply bg-slate-800 bg-top bg-no-repeat bg-cover bg-fixed">
      {userLayers && userLayers.length > 0 ? (
        <ul className="justify-start py-8 h-full w-5/6 mx-auto items-center flex flex-col space-y-6">
          {userLayers.map((layer, i) => (
            <li
              key={i}
              className="stack w-full"
              onClick={() => setLayer(layer.id)}
            >
              <div
                key={0}
                className="text-center w-full shadow-md card border-slate-600 border hover:bg-slate-600 bg-slate-700"
              >
                <div className="card-body">
                  <h2 className="text-white"> {layer.name} </h2>
                  <p className="text-lg">
                    <span className="font-semibold">
                      {layer._count.features}{" "}
                    </span>
                    todo
                  </p>
                </div>
              </div>
              {[...Array(layer._count.features).keys()].map((a) => (
                <div
                  key={a}
                  className="text-center w-full shadow-md card border border-slate-600 bg-slate-800"
                >
                  <div className="card-body">{a}</div>
                </div>
              ))}
            </li>
          ))}
        </ul>
      ) : (
        <h2 className="text-center pt-14">No Assignments</h2>
      )}
    </div>
  );
}
