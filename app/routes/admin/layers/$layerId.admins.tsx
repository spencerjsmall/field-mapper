import { redirect } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { AiOutlineClose } from "react-icons/ai";
import ReactSearchBox from "react-search-box";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { adminId, layerId } = Object.fromEntries(await request.formData());
  await prisma.layer.update({
    where: { id: parseInt(layerId) },
    data: { admins: { connect: { id: parseInt(adminId) } } },
  });
  return redirect(`/admin/layers`);
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const layerId = parseInt(params.layerId);
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { id: layerId },
    include: {
      admins: {
        include: {
          user: true,
        },
      },
    },
  });
  return { layer };
};

export default function LayerAdmins() {
  const { layer } = useLoaderData();
  const { adminData } = useOutletContext();
  const submit = useSubmit();
  return (
    <>
      <input
        type="checkbox"
        id={`layer-${layer.id}-admins`}
        className="modal-toggle"
        checked
      />
      <div className="modal">
        <div className="modal-box flex flex-col items-center relative space-y-6">
          <Link to="/admin/layers" className="text-xl absolute top-5 right-5">
            <AiOutlineClose />
          </Link>
          <h1 className="text-semibold text-white">{layer.name} Managers</h1>
          <div className="flex flex-row space-x-4 items-center">
            {layer.admins &&
              layer.admins.map((a, i) => (
                <div
                  key={i}
                  className="w-fit h-fit py-1 px-3 rounded-2xl bg-black text-white hover:bg-slate-600"
                >
                  {a.user.firstName} {a.user.lastName}
                </div>
              ))}
          </div>
          <ReactSearchBox
            placeholder="Add new manager"
            data={adminData.filter(
              (a) => !layer.admins.map((a) => a.id).includes(a.key)
            )}
            onSelect={(record: any) =>
              submit(
                { adminId: record.item.key, layerId: layer.id },
                { method: "post" }
              )
            }
            autoFocus
          />
        </div>
      </div>
    </>
  );
}
