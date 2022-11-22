import { useLoaderData, useOutletContext, useSubmit } from "@remix-run/react";
import { AiFillCloseCircle } from "react-icons/ai";
import ReactSearchBox from "react-search-box";
import { Modal } from "~/components/modal";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { adminId, layerId, action } = Object.fromEntries(
    await request.formData()
  );
  await prisma.layer.update({
    where: { id: parseInt(layerId) },
    data: {
      admins:
        String(action) == "add"
          ? { connect: { id: parseInt(adminId) } }
          : { disconnect: { id: parseInt(adminId) } },
    },
  });
  return null;
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
    <Modal title={layer.name}>
      <div className="flex flex-row justify-center space-x-2 items-center flex-wrap">
        {layer.admins &&
          layer.admins.map((a, i) => (
            <div
              key={i}
              className="w-fit h-fit py-1 my-1 px-3 flex flex-row items-center space-x-2 flex-no-wrap rounded-2xl bg-black text-slate-300 hover:bg-slate-900"
            >
              <span>
                {a.user.firstName} {a.user.lastName}
              </span>
              <div
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  submit(
                    { adminId: a.id, layerId: layer.id, action: "remove" },
                    { method: "post" }
                  )
                }
              >
                <AiFillCloseCircle />
              </div>
            </div>
          ))}
      </div>
      <div className="py-4">
        <ReactSearchBox
          placeholder="Add new admin"
          data={adminData.filter(
            (a) => !layer.admins.map((a) => a.id).includes(a.key)
          )}
          onSelect={(record: any) =>
            submit(
              { adminId: record.item.key, layerId: layer.id, action: "add" },
              { method: "post" }
            )
          }
          clearOnSelect
          autoFocus
        />
      </div>
    </Modal>
  );
}
