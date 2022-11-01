import { prisma } from "~/utils/db.server";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LayerUploader } from "~/components/modals/layer-uploader";
import { LayerTable } from "~/components/tables/layer-table";
import { requireUserId } from "~/utils/auth.server";

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

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userLayers = await prisma.layer.findMany({
    where: {
      admins: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      admins: {
        include: {
          user: true,
        },
      },
      defaultSurvey: true,
      features: {
        include: {
          assignment: true,
        },
      },
      _count: {
        select: { features: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const userSurveys = await prisma.survey.findMany({
    where: {
      admins: {
        some: {
          userId: userId,
        },
      },
    },
  });

  const allAdmins = await prisma.admin.findMany({
    include: { user: true },
  });
  const adminData = allAdmins.map((a) => ({
    key: a.id,
    value: `${a.user.firstName} ${a.user.lastName}`,
  }));

  return { userLayers, userSurveys, adminData };
};

export default function Layers() {
  const { userLayers, userSurveys, adminData } = useLoaderData();

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
      <input type="checkbox" id="new-layer-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative p-8 bg-black">
          <LayerUploader surveys={userSurveys} />
        </div>
      </div>
    </div>
  );
}
