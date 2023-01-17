import { prisma } from "~/utils/db.server";
import * as Survey from "survey-core";

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

  const headerFeat = await prisma.feature.findFirst({
    where: {
      AND: {
        layerId: layerId,
        creatorId: null,
      },
    },
  });

  const rawFeatures = await prisma.feature.findMany({
    where: {
      layerId: layerId,
    },
    select: {
      label: true,
      geojson: true,
      assignment: {
        select: {
          completedAt: true,
          results: true,
          notes: true,
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

  let headers = [
    "label",
    "assignee",
    "survey",
    "completedAt",
    "type",
    "coordinates",
    "notes",
  ];

  if (headerFeat && headerFeat.geojson.properties) {
    const props = Object.keys(headerFeat.geojson.properties);
    headers = headers.concat(props);
  }

  if (layer.survey) {
    var survey = new Survey.Model(layer.survey.json);
    const qs = survey.getAllQuestions().map((q) => q.name);
    headers = headers.concat(qs);
  }

  const JSONfeatures = rawFeatures.map((f) => ({
    label: f.label,
    assignee: f.assignment?.assignee?.user.email,
    survey: layer?.survey?.name,
    completedAt: f.assignment?.completedAt,
    ...f.geojson?.geometry,
    ...f.geojson?.properties,
    notes: f.assignment?.notes,
    ...f.assignment?.results,
  }));

  const cleanJSON = JSONfeatures.map((f) =>
    Object.fromEntries(
      Object.entries(f).map(([key, val]) => [
        key,
        typeof val === "object" ? JSON.stringify(val) : val,
      ])
    )
  );

  return { cleanJSON, headers };
}
