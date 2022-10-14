import { useState, useMemo, useRef } from "react";
import { prisma } from "~/utils/db.server";
import { LoaderArgs, redirect } from "@remix-run/node";
import {
  useLoaderData,
  Outlet,
  useSubmit,
  useOutletContext,
  useFetcher,
} from "@remix-run/react";

import Map, { Source, Layer, Popup } from "react-map-gl";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import clsx from "clsx";

import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import m_styles from "../../../styles/mapbox.css";
import { assignedStyle, highlightedStyle, todoStyle } from "~/styles/features";

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
  const taskId = params.taskId;
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { name: taskId },
  });
  const features = await prisma.feature.findMany({
    where: { layerId: layer.id },
    include: {
      assignment: {
        include: {
          assignee: true,
        },
      },
    },
  });
  const pathname = params["*"];
  const selectIds = pathname ? pathname.split("/").map((i) => parseInt(i)) : [];
  return { features, selectIds, layer };
};

export async function action({ request, params }) {
  const taskId = params.taskId;
  const form = await request.formData();
  const ids = form.get("ids");
  const path =
    ids == "" ? "" : JSON.parse(ids).reduce((a, b) => a + "/" + b, "");
  return redirect(`admin/tasks/${taskId}${path}`);
}

export default function AdminTaskMap() {
  const { features, selectIds, layer } = useLoaderData();
  const userId = useOutletContext();
  const mapRef = useRef();
  const submit = useSubmit();
  const fetcher = useFetcher();

  const [basemap, setBasemap] = useState("streets-v11");
  const [addPoint, setAddPoint] = useState(false);
  const [start, setStart] = useState<Number[]>();
  const [clickCoords, setClickCoords] = useState({ lng: 0, lat: 0 });
  const [filterIds, setFilterIds] = useState<Number[]>(selectIds);

  const selectCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: features
        .filter((f) => filterIds.includes(f.id))
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [filterIds]
  );

  const todoCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: features
        .filter((f) => !f.assignment)
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [features]
  );

  const assignedCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: features
        .filter((f) => f.assignment)
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [features]
  );

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
      setClickCoords(e.lngLat);
      setAddPoint(true);
    }
  };

  const createPoint = () => {
    setAddPoint(false);
    fetcher.submit(
      {
        layerId: String(layer.id),
        coordinates: JSON.stringify(clickCoords),
        userId: String(userId),
      },
      { method: "post", action: "/layer/feature-create" }
    );
  };

  const getQueried = (end: Array<Number>) => {
    const topLeft = [Math.min(start[0], end[0]), Math.min(start[1], end[1])];
    const botRight = [Math.max(start[0], end[0]), Math.max(start[1], end[1])];
    const queried = mapRef.current.queryRenderedFeatures([topLeft, botRight], {
      layers: ["todo", "assigned"],
    });
    const ids = queried.map((record) => record.id);
    //take symetrical difference of existing and new selections
    let difference = filterIds
      .filter((i) => !ids.includes(i))
      .concat(ids.filter((i) => !filterIds.includes(i)));
    setFilterIds(difference);
    submit(
      {
        ids: JSON.stringify(difference),
      },
      { method: "post" }
    );
  };

  return (
    <div className="flex flex-row h-full">
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
        interactiveLayerIds={["todo", "assigned"]}
        onClick={onFeatureClick}
        onMove={() => setAddPoint(false)}
        ref={mapRef}
        className="basis-2/3 relative"
        onZoom={(e) => {
          e.target.stop();
        }}
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
            <Source id="pg1" type="geojson" data={todoCollection}>
              <Layer id="todo" {...todoStyle} />
            </Source>
            <Source id="pg1" type="geojson" data={assignedCollection}>
              <Layer id="assigned" {...assignedStyle} />
            </Source>
            <Source id="pg1" type="geojson" data={selectCollection}>
              <Layer id="highlighted" {...highlightedStyle} />
            </Source>
          </>
        ) : (
          <>
            <Source id="todo" type="geojson" data={todoCollection}>
              <Layer id="todo" {...todoStyle} />
            </Source>
            <Source id="assigned" type="geojson" data={assignedCollection}>
              <Layer id="assigned" {...assignedStyle} />
            </Source>
            <Source id="highlighted" type="geojson" data={selectCollection}>
              <Layer id="highlighted" {...highlightedStyle} />
            </Source>
          </>
        )}

        {addPoint && (
          <Popup
            longitude={clickCoords.lng}
            latitude={clickCoords.lat}
            anchor="bottom"
            onClose={() => setAddPoint(false)}
          >
            <button
              onClick={createPoint}
              className="btn btn-xs btn-outline btn-primary"
            >
              Add Point
            </button>
          </Popup>
        )}

        <ul className="menu menu-horizontal bg-black w-auto absolute top-3 left-1 text-xs p-1 rounded-box">
          <li>
            <div
              onClick={() => setBasemap("streets-v11")}
              className={clsx("p2 font-sans", {
                active: basemap == "streets-v11",
              })}
            >
              Traffic
            </div>
          </li>
          <li>
            <div
              onClick={() => setBasemap("outdoors-v11")}
              className={clsx("p2 font-sans", {
                active: basemap == "outdoors-v11",
              })}
            >
              Topo
            </div>
          </li>
          <li>
            <div
              onClick={() => setBasemap("satellite-v9")}
              className={clsx("p2 font-sans", {
                active: basemap == "satellite-v9",
              })}
            >
              Satellite
            </div>
          </li>
          <li>
            <div
              onClick={() => setBasemap("dark-v10")}
              className={clsx("p2 font-sans", {
                active: basemap == "dark-v10",
              })}
            >
              Dark
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
      <div className="basis-1/3 drop-shadow-lg min-h-full border-l border-white max-h-full overflow-y-scroll bg-[#2A2D5C]">
        <Outlet context={{ features }} />
      </div>
    </div>
  );
}
