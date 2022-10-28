import { prisma } from "~/utils/db.server";
import { LoaderFunction, ActionFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { LayerUploader } from "~/components/layer-uploader";
import { LayerTable } from "~/components/layer-table";
import { requireUserId } from "~/utils/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const { surveyId, layerId } = Object.fromEntries(await request.formData());
  console.log("surveyId", surveyId == "None");
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
      dispatcherId: userId,
    },
    include: {
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
      creatorId: userId,
    },
  });

  return { userLayers, userSurveys };
};

export default function Table() {
  const { userLayers, userSurveys } = useLoaderData();

  return (
    <div className="flex mx-auto flex-col items-center pt-32 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Layers</h1>{" "}
        <label htmlFor="my-modal" className="btn w-36 modal-button">
          New Layer
        </label>
      </div>
      {userLayers && userLayers.length > 0 ? (
        <LayerTable layers={userLayers} surveys={userSurveys} />
      ) : (
        <h2>No layers</h2>
      )}
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box relative p-8 bg-black">
          <LayerUploader surveys={userSurveys} />
        </div>
      </div>
    </div>
  );
}
