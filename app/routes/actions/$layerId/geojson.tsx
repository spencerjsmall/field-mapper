import { prisma } from "~/utils/db.server";

export async function loader({ request, params }) {
  const layerId = parseInt(params.layerId);
  const rawFeatures = await prisma.feature.findMany({
    where: { layerId: layerId },
    select: {
      geojson: true,
      assignment: {
        select: {
          completedAt: true,
          results: true,
          survey: {
            select: {
              name: true,
            },
          },
          assignee: {
            select: {
              user: {
                select: {
                  email: true,
                },
              },
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
        surveyId: f.assignment?.survey?.name,
        surveyor: f.assignment?.assignee?.user.email,
        completedAt: f.assignment?.completedAt,
        ...f.assignment?.results,
      },
    })),
  };

  return fc;
}
