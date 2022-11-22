import { Form, Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request, params }) => {
  const layerId = parseInt(params.layerId);
  await prisma.layer.delete({ where: { id: parseInt(layerId) } });
  return redirect("/admin/layers");
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const layerId = parseInt(params.layerId);
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { id: layerId },
  });
  return { layer };
};

export default function ConfirmDeleteLayer() {
  const { layer } = useLoaderData();
  return (
    <>
      <input type="checkbox" checked className="modal-toggle" />
      <div className="modal">
        <Form
          className="modal-box bg-slate-700 border border-slate-500 relative"
          method="post"
        >
          <h3 className="font-bold text-xl text-center">
            Are you sure you want to delete {layer.name}?
          </h3>
          <p className="py-4 text-center">
            This action will delete all assignments and collected data.
          </p>

          <div className="py-1 flex flex-row items-center justify-evenly">
            <Link to="/admin/layers">
              <button className="btn btn-ghost">Cancel</button>
            </Link>
            <button className="btn" type="submit">
              Confirm
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
