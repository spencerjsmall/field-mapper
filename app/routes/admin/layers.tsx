import { prisma } from "~/utils/db.server";
import { ActionFunction } from "@remix-run/node";
import { useOutletContext } from "@remix-run/react";
import { LayerUploader } from "~/components/modals/layer-uploader";
import { LayerTable } from "~/components/tables/layer-table";
import { Paginate } from "~/components/tables/paginate";
import { useEffect, useMemo, useState } from "react";

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
  const maxPages = Paginate({ perPage: 5, items: userLayers }).totalPages;
  const [page, setPage] = useState(1);
  const layers = useMemo(
    () => Paginate({ page: page, perPage: 5, items: userLayers }).items,
    [page, userLayers]
  );

  return (
    <div className="flex mx-auto flex-col items-center pt-24 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Layers</h1>{" "}
        {maxPages && maxPages > 1 && (
          <div className="btn-group">
            {[...Array(maxPages).keys()].map((i) => (
              <button
                onClick={() => setPage(i + 1)}
                key={i + 1}
                className={`btn ${
                  page == i + 1
                    ? "btn-active bg-slate-600 border-slate-600"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        <label htmlFor="new-layer-modal" className="btn w-36 modal-button">
          New Layer
        </label>
      </div>
      {userLayers && userLayers.length > 0 ? (
        <LayerTable
          layers={layers}
          surveys={userSurveys}
          adminData={adminData}
        />
      ) : (
        <h2>No layers</h2>
      )}
    </div>
  );
}
