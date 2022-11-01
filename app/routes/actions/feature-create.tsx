import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {  
  const { layerId, coordinates, userId } = Object.fromEntries(
    await request.formData()
  );

  const lId = parseInt(layerId);
  const uId = parseInt(userId);
  const coords = JSON.parse(coordinates);

  const newFeat = await prisma.feature.create({
    data: {
      layer: { connect: { id: lId } },
      creator: { connect: { id: uId } },
      geojson: {
        type: "Feature",
        geometry: { type: "Point", coordinates: [coords.lng, coords.lat] },
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
  if (
    newFeat.layer.defaultSurvey &&
    newFeat.creator &&
    newFeat.creator.surveyor
  ) {
    await prisma.assignment.create({
      data: {
        feature: { connect: { id: newFeat.id } },
        assignee: { connect: { id: newFeat.creator.id } },
        survey: { connect: { id: newFeat.layer.defaultSurveyId } },
      },
    });
  }
  return json(newFeat);
};
