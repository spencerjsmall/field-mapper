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
      creator: true, // Include all posts in the returned object
      layer: true,
    },
  });
  if (
    newFeat.layer.defaultSurveyId &&
    newFeat.creator &&
    newFeat.creator.role == "USER"
  ) {
    await prisma.assignment.create({
      data: {
        feature: { connect: { id: newFeat.id } },
        assignee: { connect: { id: newFeat.creator.id } },
        surveyId: newFeat.layer.defaultSurveyId,
      },
    });
  }
  return json(newFeat);
};
