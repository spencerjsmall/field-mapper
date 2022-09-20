import { prisma } from "./db.server";

export type { SFMTA_Bikeway_Network_Point_Features } from "@prisma/client";

type QueryResult = {
  id: number;
  location: string;
};

type ReturnedResult = {
  geometry: any;
  type: string;
  properties: any;
};

export async function getAllPoints(layer: string) {
  const results = await prisma.$queryRawUnsafe<
    QueryResult[]
  >(`SELECT ST_AsGeoJSON(geom) as location, id
  FROM "${layer}"`);

  const parsedResults: ReturnedResult[] = results.map((item) => {
    return {
      type: "Feature",
      geometry: {
        coordinates: JSON.parse(item.location).coordinates,
        type: JSON.parse(item.location).type,
      },
      properties: {
        title: item.id,
      },
    };
  });

  const geoJsonResult = {
    type: "FeatureCollection",
    features: parsedResults,
  };

  return geoJsonResult;
}

async function getGeomFromId(layer: string, recordId: number) {
  const queryResult = await prisma.$queryRawUnsafe<QueryResult[]>(
    `SELECT ST_AsGeoJSON(geom) as location
  FROM "${layer}" WHERE id = $1`,
    recordId
  );
  const result = JSON.parse(queryResult[0].location);
  return result;
}

export async function getAssignedPoints(userId: number, layer: string) {
  const assnArr = await prisma.assignment.findMany({
    where: {
      layer: layer,
      OR: [{ assigneeId: userId }, { assigneeId: null }],
    },
    select: {
      recordId: true,
      surveyId: true,
      completed: true,
    },
  });

  const featureArr = await Promise.all(
    assnArr.map(async (assn) => {
      return {
        type: "Feature",
        id: assn.recordId,
        geometry: await getGeomFromId(layer, assn.recordId),
        properties: {
          surveyId: assn.surveyId,
          completed: assn.completed,
        },
      };
    })
  );

  const geoJsonResult = {
    type: "FeatureCollection",
    features: featureArr,
  };

  return geoJsonResult;
}

export async function getUserLayers(userId: number) {
  const assnArr = await prisma.assignment.groupBy({
    by: ["layer"],
    where: {
      assigneeId: userId,
    },
  });
  const layerArr = assnArr.map(assn => assn.layer)
  return layerArr
}
