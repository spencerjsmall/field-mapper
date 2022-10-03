import { prisma } from "~/utils/db.server";
import { LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { LayerUploader } from "~/components/layer-uploader";
import { requireUserId } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const { layerId, name, field } = Object.fromEntries(await request.formData());
  await prisma.layer.update({
    where: {
      id: parseInt(layerId),
    },
    data: {
      name: name,
      titleField: field,
    },
  });
  return redirect(`/admin/tasks/${layerId}`);
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userLayers = await prisma.layer.findMany({
    where: {
      dispatcherId: userId,
    },
  });
  return userLayers;
};

export default function HomePage() {
  const userLayers = useLoaderData();

  return (
    <div className="w-full h-full justify-center items-center flex flex-row">
      <div className="justify-center items-center flex flex-col">
        <h1 className="text-white">Welcome!</h1>
        <h3 className="pb-5">Choose a layer to begin field collection</h3>
        <ul className="justify-center items-center flex flex-col space-y-2">
          {userLayers.map((layer, i) => (
            <li key={i}>
              <Link to={`/admin/tasks/${layer.id}`}>
                <button className="btn btn-lg btn-secondary">
                  <label>{layer.name}</label>
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h3 className="pb-5">Or upload your own below</h3>
        <LayerUploader />
      </div>
    </div>
  );
}
