import { prisma } from "~/utils/db.server";
import { ActionFunction } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { LayerUploader } from "~/components/modals/layer-uploader";
import { LayerTable } from "~/components/tables/layer-table";

export const action: ActionFunction = async ({ request }) => {
  const { surveyId, layerId } = Object.fromEntries(await request.formData());
  await prisma.layer.update({
    where: {
      id: parseInt(layerId),
    },
    data: {
      defaultSurvey:
        surveyId == "None"
          ? { disconnect: true }
          : {
              connect: { id: parseInt(surveyId) },
            },
    },
  });
  return null;
};

export default function Layers() {
  const { userLayers, userSurveys, allAdmins } = useOutletContext();
  const adminData = allAdmins.map((a) => ({
    key: a.id,
    value: `${a.user.firstName} ${a.user.lastName}`,
  }));

  return (
    <div className="flex mx-auto flex-col items-center pt-32 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Layers</h1>{" "}
        <label htmlFor="new-layer-modal" className="btn w-36 modal-button">
          New Layer
        </label>
      </div>
      {userLayers && userLayers.length > 0 ? (
        <LayerTable
          layers={userLayers}
          surveys={userSurveys}
          adminData={adminData}
        />
      ) : (
        <h2>No layers</h2>
      )}
    </div>
  );
}
