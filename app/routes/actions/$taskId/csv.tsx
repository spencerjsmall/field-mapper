import { prisma } from "~/utils/db.server";

export async function loader({ request, params }) {
  const taskId = parseInt(params.taskId);
  const rawFeatures = await prisma.feature.findMany({
    where: {
      layerId: taskId,
    },
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

  const features = rawFeatures.map((f) => ({
    ...f.geojson?.geometry,
    ...f.geojson?.properties,
    completedAt: f.assignment?.completedAt,
    surveyId: f.assignment?.surveyId,
    assignee: f.assignment?.assignee?.email,
    ...f.assignment?.results,
  }));

  return features;
}
