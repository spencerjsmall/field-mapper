import { prisma } from "~/utils/db.server";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSubmit, Form, Link } from "@remix-run/react";
import { LayerUploader } from "~/components/layer-uploader";
import {
  requireUserId,
} from "~/utils/auth.server";

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
    <div className="w-full h-full justify-center items-center flex flex-col">
      <h1 className="text-white">Welcome!</h1>
      <h3 className="pb-5">Choose a layer to begin field collection</h3>
      <ul className="justify-center items-center flex flex-col space-y-2">
        {userLayers.map((layer, i) => (
          <li key={i}>
            <Link to={`/admin/tasks/${layer.id}`}>
            <button              
              className="btn btn-lg btn-secondary"
            >
              <label>{layer.name}</label>
            </button>
            </Link>
          </li>
        ))}
      </ul>
      <h3 className="pb-5">Or upload your own below</h3>
      <LayerUploader />
    </div>
  );
}
