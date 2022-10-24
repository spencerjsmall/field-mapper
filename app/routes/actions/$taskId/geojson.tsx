import { prisma } from "~/utils/db.server";

export async function loader({ request, params }) {
  const taskId = parseInt(params.taskId);
  const rawFeatures = await prisma.feature.findMany({
    where: { layerId: taskId },
    select: {
      geojson: true,
      assignment: {
        select: {
          completedAt: true,
          results: true,
          surveyId: true,
          assignee: {
            select: {
              email: true,
            },
          },
        },
      },
    },
  });

  const fc = {
    type: "FeatureCollection",
    features: rawFeatures.map((f) => ({
      type: f.geojson.type,
      geometry: f.geojson.geometry,
      properties: {
        ...f.geojson.properties,
        surveyId: f.assignment?.surveyId,
        surveyor: f.assignment?.assignee?.email,
        completedAt: f.assignment?.completedAt,
        ...f.assignment?.results,
      },
    })),
  };

  return fc;
}
