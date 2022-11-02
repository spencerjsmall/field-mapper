import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  let { layerId, coordinates, userId } = Object.fromEntries(
    await request.formData()
  );

  layerId = parseInt(layerId);
  userId = parseInt(userId);
  coordinates = JSON.parse(coordinates);

  const newFeat = await prisma.feature.create({
    data: {
      layer: { connect: { id: layerId } },
      creator: { connect: { id: userId } },
      geojson: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [coordinates.lng, coordinates.lat],
        },
        properties: {},
      },
    },
    include: {
      creator: {
        include: {
          surveyor: true,
        },
      },
      layer: {
        include: {
          defaultSurvey: true,
        },
      },
    },
  });
  if (newFeat.layer.defaultSurvey && newFeat.creator.surveyor) {
    await prisma.assignment.create({
      data: {
        feature: { connect: { id: newFeat.id } },
        assignee: { connect: { id: newFeat.creator.surveyor.id } },
        survey: { connect: { id: newFeat.layer.defaultSurveyId } },
      },
    });
  }
  return json(newFeat);
};
