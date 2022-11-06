import { prisma } from "~/utils/db.server";

export async function loader({ request, params }) {
  const layerId = parseInt(params.layerId);
  const rawFeatures = await prisma.feature.findMany({
    where: {
      layerId: layerId,
    },
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
                  firstName: true,
                  lastName: true,
                },
              },
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
    survey: f.assignment?.survey.name,
    assignee: f.assignment?.assignee?.user.email,
    ...f.assignment?.results,
  }));

  return features;
}
