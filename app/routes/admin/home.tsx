import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, Form } from "@remix-run/react";
import { LayerUploader } from "~/components/layer-uploader";
import {
  requireUserId,
  getUserSession,
  commitSession,
} from "~/utils/auth.server";
import { getUserLayers } from "~/utils/geo.server";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userLayers = await getUserLayers(userId);
  return userLayers;
};

export async function action({ request }) {
  const session = await getUserSession(request);
  const form = await request.formData();
  const taskId = form.get("taskId");
  session.set("taskId", taskId);
  return redirect(`/admin/tasks/${taskId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function HomePage() {
  const userLayers = useLoaderData();
  const submit = useSubmit();

  const handleSubmit = (taskId: string) => {
    submit({ taskId: taskId }, { method: "post" });
  };

  const handleFileUpload = async (file: File) => {
    const inputFormData = new FormData();
    inputFormData.append("layer", file);
    console.log(inputFormData.get("layer"))
    console.log('body', inputFormData)
    console.log('file', file)
    const response = await fetch("/layer", {
      method: "POST",
      body: inputFormData,
    });
    const { layerUrl } = await response.json();
    console.log("layerUrl", layerUrl);
  };

  return (
    <div className="w-full h-full justify-center items-center flex flex-col">
      <h1 className="text-white">Welcome!</h1>
      <h3 className="pb-5">Choose a layer to begin field collection</h3>
      <ul className="justify-center items-center flex flex-col space-y-2">
        {userLayers.map((taskId: string, i) => (
          <li key={i}>
            <button
              onClick={() => handleSubmit(taskId)}
              className="btn btn-lg btn-secondary"
            >
              <label>{taskId.split(/(?=[A-Z])/).join(" ")}</label>
            </button>
          </li>
        ))}
      </ul>
      <h3 className="pb-5">Or upload your own below</h3>
      <LayerUploader onChange={handleFileUpload} />
    </div>
  );
}
