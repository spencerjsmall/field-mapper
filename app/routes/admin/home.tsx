import { prisma } from "~/utils/db.server";
import { Prisma } from "@prisma/client";
import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { LayerUploader } from "~/components/layer-uploader";
import {
  requireUserId,
  getUserSession,
  commitSession,
} from "~/utils/auth.server";
import { CSVLink } from "react-csv";
import { useRef, useState } from "react";

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
  const [csv, setCSV] = useState({ data: null, fileName: "" });
  const csvLink = useRef(null);

  const setTask = (layerName: string) => {
    submit({ taskId: layerName }, { method: "post" });
  };

  const downloadFile = (data, fileName, fileType) => {
    const file = new Blob([data], {
      type: fileType,
    });

    // anchor link
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = fileName;

    // simulate link click
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const exportToJson = async (layer) => {
    const response = await fetch(`/actions/${layer.id}/geojson`, {
      method: "GET",
    });
    const fc = await response.json();
    const fileName = layer.name.replace(/\s/g, "") + Date.now() + ".geojson";
    downloadFile(JSON.stringify(fc, null, 2), fileName, "application/json");
  };

  const exportToCsv = async (layer) => {
    const response = await fetch(`/actions/${layer.id}/csv`, {
      method: "GET",
    });
    const data = await response.json();
    const fileName = layer.name.replace(/\s/g, "") + Date.now() + ".csv";
    setCSV({ data: data, fileName: fileName });
    csvLink.current.link.click();
  };

  return (
    <div className="flex flex-col bg-ggp bg-top bg-no-repeat bg-cover bg-fixed items-center justify-center h-full w-full">
      <div className="flex flex-col group bg-black bg-opacity-70 hover:p-16 hover:transition-all ease-out duration-200 drop-shadow-2xl border border-gray-50 p-14 rounded-xl justify-center h-fit w-fit">
        <h1 className="text-white text-4xl mb-3 text-start italic">
          Welcome, {user.firstName}
        </h1>
        <h1 className="text-gray-400 text-xl mb-14">
          Select a layer to make assignments
        </h1>
        <div className="justify-center space-x-24 w-full items-start flex flex-row">
          {userLayers && userLayers.length > 0 && (
            <ul className="justify-center items-center flex flex-col">
              <h2 className="pb-5 text-red-500 text-2xl">Your Layers</h2>
              {userLayers.map((layer, i) => (
                <li key={i}>
                  <button
                    onClick={() => setTask(layer.name)}
                    className="btn no-underline font-sans btn-lg text-white btn-ghost"
                  >
                    {layer.name}
                  </button>
                  <button
                    onClick={() => exportToJson(layer)}
                    className="btn font-sans btn-xs text-white btn-ghost"
                    id="jsonDownload"
                    value="download"
                  >
                    JSON
                  </button>
                  <button
                    onClick={() => exportToCsv(layer)}
                    className="btn font-sans btn-xs text-white btn-ghost"
                    id="csvDownload"
                    value="download"
                  >
                    CSV
                  </button>
                  {csv.data && (
                    <CSVLink
                      ref={csvLink}
                      data={csv.data}
                      filename={csv.fileName}
                      target="_blank"
                    />
                  )}
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
    </div>
  );
}
