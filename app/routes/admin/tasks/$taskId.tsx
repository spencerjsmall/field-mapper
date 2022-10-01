import { useState, useMemo, useRef } from "react";
import { prisma } from "~/utils/db.server";
import { LoaderArgs, redirect } from "@remix-run/node";
import { useLoaderData, Outlet, useFetcher, useSubmit } from "@remix-run/react";

import "@loaders.gl/polyfills";
import { KMLLoader } from "@loaders.gl/kml";
import { GeoJSONLoader } from "@loaders.gl/json/dist/geojson-loader";
import { ShapefileLoader } from "@loaders.gl/shapefile";
import { load, selectLoader } from "@loaders.gl/core";

import Map, { Source, Layer, useMap, Popup } from "react-map-gl";
import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import m_styles from "../../../styles/mapbox.css";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

import clsx from "clsx";

export function links() {
  return [
    { rel: "stylesheet", href: mb_styles },
    {
      rel: "stylesheet",
      href: m_styles,
    },
  ];
}

export const loader = async ({ request, params }: LoaderArgs) => {
  const taskId = parseInt(params.taskId);
  const layer = await prisma.layer.findUnique({ where: { id: taskId } });
  const loader = await selectLoader(layer.url, [
    KMLLoader,
    GeoJSONLoader,
    ShapefileLoader,
  ]);
  const data = await load(layer.url, loader);
  const points =
    loader == ShapefileLoader
      ? {
          type: "FeatureCollection",
          features: data.data,
        }
      : data;
  const pointKeys = [];
  for (let key of points.features.keys()) {
    pointKeys.push(key);
    points.features[key]["id"] = key;
  }
  const assignments = await prisma.assignment.findMany({
    where: {
      recordId: { in: pointKeys },
      layerId: taskId,
    },
    select: {
      surveyId: true,
      recordId: true,
      assignee: {
        select: {
          email: true,
        },
      },
    },
  });
  const pathname = params["*"];
  const selectIds = pathname ? pathname.split("/").map((i) => parseInt(i)) : [];
  return { points, assignments, selectIds };
};

export async function action({ request, params }) {
  const taskId = params.taskId;
  const form = await request.formData();
  const ids = form.get("ids");
  const path =
    ids == "" ? "" : JSON.parse(ids).reduce((a, b) => a + "/" + b, "");
  return redirect(`admin/tasks/${taskId}${path}`);
}

const todoLayer = {
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#0000FF",
  },
};

const assignedLayer = {
  type: "circle",
  paint: {
    "circle-radius": 5,
    "circle-color": "#00FF00",
  },
};

const highlightLayer = {
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#FF0000",
  },
};

export default function AdminTaskMap() {
  const { points, assignments, selectIds } = useLoaderData();
  console.log(points);
  const mapRef = useRef();
  const submit = useSubmit();

  const [basemap, setBasemap] = useState("streets-v11");
  const [addPoint, setAddPoint] = useState(false);
  const [start, setStart] = useState<Number[]>();
  const [filterIds, setFilterIds] = useState<Number[]>(selectIds);

  const onFeatureClick = (e) => {
    console.log(e.lngLat);
    if (e.features.length > 0) {
      console.log(e.features);
      setFilterIds([e.features[0].id]);
      submit(
        {
          ids: JSON.stringify([e.features[0].id]),
        },
        { method: "post" }
      );
    } else {
      setFilterIds([]);
      submit(
        {
          ids: "",
        },
        { method: "post" }
      );
    }
  };

  const getQueried = (end: Array<Number>) => {
    const queried = mapRef.current.queryRenderedFeatures([start, end], {
      layers: ["todo"],
    });
    const ids = queried.map((record) => record.id);
    setFilterIds(ids);
    submit(
      {
        ids: JSON.stringify(ids),
      },
      { method: "post" }
    );
  };

  const filter = useMemo(
    () => ["in", ["id"], ["literal", filterIds]],
    [filterIds]
  );

  const assigned = useMemo(
    () => ["in", ["id"], ["literal", assignments.map((a) => a.recordId)]],
    [assignments]
  );

  return (
    <div className="flex h-full">
      <Map
        initialViewState={{
          longitude: -122.44,
          latitude: 37.75,
          zoom: 12,
        }}
        mapStyle={
          basemap == "custom"
            ? "mapbox://styles/mapbox/satellite-v9"
            : `mapbox://styles/mapbox/${basemap}`
        }
        mapboxAccessToken={
          "pk.eyJ1Ijoic3BlbmNlcmpzbWFsbCIsImEiOiJjbDdmNGY5d2YwNnJuM3hsZ2IyN2thc2QyIn0.hLfNqU8faCraSSKrXbtnHQ"
        }
        interactiveLayerIds={["todo"]}
        onClick={onFeatureClick}
        ref={mapRef}
        className="basis-2/3 relative"
        onBoxZoomStart={(e) =>
          setStart([e.originalEvent.layerX, e.originalEvent.layerY])
        }
        onBoxZoomEnd={(e) =>
          getQueried([e.originalEvent.layerX, e.originalEvent.layerY])
        }
      >
        {basemap == "custom" ? (
          <>
            <Source
              id="tiles"
              type="raster"
              tiles={[
                "https://til.3dg.is/api/tiles/p2021_rgb8cm/{z}/{x}/{y}.png",
              ]}
              tileSize={256}
            >
              <Layer type="raster" />
            </Source>
            <Source id="todo" type="geojson" data={points}>
              <Layer id="todo" {...todoLayer} />
            </Source>
            <Source id="todo" type="geojson" data={points}>
              <Layer id="highlight" {...highlightLayer} />
            </Source>
          </>
        ) : (
          <>
            <Source id="pg1" type="geojson" data={points}>
              <Layer id="todo" {...todoLayer} />
            </Source>
            <Source id="pg1" type="geojson" data={points}>
              <Layer id="assigned" {...assignedLayer} filter={assigned} />
            </Source>
            <Source id="pg1" type="geojson" data={points}>
              <Layer id="highlighted" {...highlightLayer} filter={filter} />
            </Source>
          </>
        )}
        <ul className="menu menu-horizontal bg-base-100 w-auto absolute top-1 left-1 text-xs p-1 rounded-box">
          <li>
            <div
              onClick={() => setBasemap("streets-v11")}
              className={clsx("p2", { active: basemap == "streets-v11" })}
            >
              Traffic
            </div>
          </li>
          <li>
            <div
              onClick={() => setBasemap("dark-v10")}
              className={clsx("p2", { active: basemap == "dark-v10" })}
            >
              Dark
            </div>
          </li>
          <li>
            <div
              onClick={() => setBasemap("satellite-v9")} //FIX CUSTOM
              className={clsx("p2", { active: basemap == "satellite-v9" })}
            >
              Custom
            </div>
          </li>
        </ul>

        <button
          onClick={() => setAddPoint(!addPoint)}
          className="btn btn-sm absolute top-2 right-2.5 btn-square bg-white text-black"
        >
          {!addPoint ? <AiOutlinePlus /> : <AiOutlineClose />}
        </button>
      </Map>
      <div className="basis-1/3 max-h-full overflow-y-scroll bg-black">
        <Outlet context={assignments} />
      </div>
    </div>
  );
}
