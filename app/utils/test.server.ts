import { prisma } from "./db.server";
export type { G84_bike_net_pt } from "@prisma/client";
import {
  GeoJsonObject,
  GeoJsonProperties,
  GeoJsonGeometryTypes,
} from "geojson";

type QueryResult = {
  id: number;
  location: string;
  type: string;
  name: string;
};

type ReturnedResult = {
  geometry: GeoJsonObject & GeoJsonProperties & GeoJsonGeometryTypes;
  type: string;
  //name: string;
};

export async function getFirstPt() {
  const results = await prisma.$queryRaw<
    QueryResult[]
  >`SELECT ST_AsGeoJSON(geom) as location, id, objectid as name
  FROM "G84_bike_net_pt"`;

  //console.log(results)

  const parsedResults: ReturnedResult[] = results.map((item) => {    
    return {
      // Parse GeoJSON
      geometry: JSON.parse(item.location),
      // name: item.name,
      // id: item.id,
      type: "Feature",
    };
  });

  const geoJsonResult = {
    type: "FeatureCollection",
    crs: {
      type: "name",
      properties: {
        name: "EPSG:3857",
      },
    },
    features: parsedResults
  };

  return(geoJsonResult)
}

// async function getFirstRawPt() {
//   const pt = await prisma.g84_bike_net_pt.findUnique({
//     where: {
//       id: 1,
//     },
//   });
//   console.log(pt);
//   if (pt) {
//     const rawPt =
//       await prisma.$queryRaw`SELECT geom::json FROM "G84_bike_net_pt" WHERE id = ${pt.id}`;
//     console.log(rawPt);
//   }
// }

// getFirstPt();
