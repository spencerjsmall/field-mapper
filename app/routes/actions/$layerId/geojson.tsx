import { prisma } from "~/utils/db.server";

export async function loader({ request, params }) {
  const layerId = parseInt(params.layerId);
  const layer = await prisma.layer.findUnique({
    where: {
      id: layerId,
    },
    include: {
      survey: true,
    },
  });

  const rawFeatures = await prisma.feature.findMany({
    where: { layerId: layerId },
    select: {
      label: true,
      geojson: true,
      assignment: {
        select: {
          completedAt: true,
          results: true,
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
        label: f.label,
        assignee: f.assignment?.assignee?.user.email,
        survey: layer?.survey?.name,
        completedAt: f.assignment?.completedAt,
        ...f.geojson.properties,
        ...f.assignment?.results,
      },
    })),
  };

  return fc;
}
