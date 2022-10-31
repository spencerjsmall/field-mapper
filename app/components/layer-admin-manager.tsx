import { useSubmit } from "@remix-run/react";
import ReactSearchBox from "react-search-box";

export function LayerAdminManager({ admins, layer }) {
  const submit = useSubmit();
  return (
    <div className="flex flex-col items-center space-y-6">
      <h1>{layer.name} Managers</h1>
      <div className="flex flex-row space-x-4 items-center">
        {layer.admins &&
          layer.admins.map((a, i) => (
            <div
              key={i}
              className="w-fit h-fit py-1 px-3 rounded-2xl bg-black text-white hover:bg-gray-600"
            >
              {a.user.firstName} {a.user.lastName}
            </div>
          ))}
      </div>
      <ReactSearchBox
        placeholder="Add new manager"
        data={admins.filter(
          (a) => !layer.admins.map((a) => a.id).includes(a.key)
        )}
        onSelect={(record: any) =>
          submit(
            { adminId: record.item.key, layerId: layer.id },
            { method: "post", action: "/actions/add-layer-admin" }
          )
        }
        autoFocus
      />
    </div>
  );
}
