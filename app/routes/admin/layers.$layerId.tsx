import { useState, useMemo, useRef } from "react";
import { prisma } from "~/utils/db.server";
import { json, LoaderArgs } from "@remix-run/node";
import { useLoaderData, useOutletContext, useFetcher } from "@remix-run/react";

import Map, { Source, Layer } from "react-map-gl";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { commitSession, getSession } from "~/utils/auth.server";

import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import m_styles from "../../styles/mapbox.css";
import {
  assignedStyle,
  highlightedStyle,
  todoStyle,
  doneStyle,
} from "~/styles/features";
import { BasemapSelector } from "~/components/selectors/basemap-selector";
import crosshairs from "../../../public/images/crosshairs.svg";
import { AssignmentSelect } from "~/components/selectors/assignment-selector";

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
  const layerId = params.layerId;
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { id: parseInt(layerId) },
    include: {
      features: {
        include: {
          assignment: {
            include: { assignee: { include: { user: true } } },
          },
        },
      },
    },
  });
  const session = await getSession(request.headers.get("Cookie"));
  session.set("layerId", layerId);
  const token = process.env.MAPBOX_ACCESS_TOKEN;
  return json(
    { layer, token },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export default function AdminTaskMap() {
  const { layer, token } = useLoaderData();
  const { userSurveys, userSurveyors, userAdmin } = useOutletContext();
  const mapRef = useRef();
  const fetcher = useFetcher();

  const [basemap, setBasemap] = useState("satellite");
  const [addPoint, setAddPoint] = useState(false);
  const [start, setStart] = useState<Number[]>();
  const [filterIds, setFilterIds] = useState<Number[]>([]);
  const [viewState, setViewState] = useState({
    longitude: -122.44,
    latitude: 37.75,
    zoom: 12,
  });

  const selectCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: layer.features
        .filter((f) => filterIds.includes(f.id))
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [filterIds]
  );

  const todoCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: layer.features
        .filter((f) => !f.assignment)
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [layer.features]
  );

  const assignedCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: layer.features
        .filter((f) => f.assignment)
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [layer.features]
  );

  const completedCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: layer.features
        .filter((f) => f.assignment && f.assignment.completed)
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [layer.features]
  );

  const onFeatureClick = (e) => {
    console.log(e.lngLat);
    setAddPoint(false);
    if (e.features.length > 0) {
      console.log(e.features);
      setFilterIds([e.features[0].id]);
    } else if (filterIds.length > 0) {
      setFilterIds([]);
    }
  };

  const createPoint = () => {
    fetcher.submit(
      {
        layerId: String(layer.id),
        coordinates: JSON.stringify({
          lng: viewState.longitude,
          lat: viewState.latitude,
        }),
        userId: String(userAdmin.id),
      },
      { method: "post", action: "/actions/feature-create" }
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
          basemap == "satellite"
            ? "mapbox://styles/mapbox/satellite-v9"
            : `mapbox://styles/mapbox/${basemap}`
        }
        mapboxAccessToken={token}
        interactiveLayerIds={["todo", "assigned"]}
        onClick={onFeatureClick}
        ref={mapRef}
        className="basis-2/3 relative"
        onMove={(e) => setViewState(e.viewState)}
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
        {basemap == "satellite" && (
          <Source
            id="tiles"
            type="raster"
            tiles={[
              "https://til.3dg.is/api/tiles/p2021_rgb8cm/{z}/{x}/{y}.png",
            ]}
            tileSize={256}
          >
            <Layer beforeId="todo" type="raster" />
          </Source>
        )}

        <Source id="todo" type="geojson" data={todoCollection}>
          <Layer id="todo" beforeId="assigned" {...todoStyle} />
        </Source>
        <Source id="assigned" type="geojson" data={assignedCollection}>
          <Layer id="assigned" beforeId="done" {...assignedStyle} />
        </Source>
        <Source id="done" type="geojson" data={completedCollection}>
          <Layer beforeId="highlighted" id="done" {...doneStyle} />
        </Source>
        <Source id="highlighted" type="geojson" data={selectCollection}>
          <Layer id="highlighted" {...highlightedStyle} />
        </Source>

        {addPoint && (
          <>
            <div className="absolute top-1/2 left-1/2 transform pointer-events-none -translate-x-1/2 -translate-y-1/2">
              <img src={crosshairs} className="w-64 h-64" alt="crosshairs" />
            </div>
            <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
              <button onClick={createPoint} className="btn w-40">
                Add Point
              </button>
            </div>
          </>
        )}

        <div className="absolute top-3 left-1">
          <BasemapSelector basemap={basemap} setBasemap={setBasemap} />
        </div>
        <div className="absolute top-2 right-2">
          <div className="tooltip tooltip-left" data-tip="Add Point">
            <button
              onClick={() => setAddPoint(!addPoint)}
              className="btn btn-sm border-0 text-2xl drop-shadow btn-square bg-white text-black"
            >
              {!addPoint ? <AiOutlinePlus /> : <AiOutlineClose />}
            </button>
          </div>
        </div>
      </Map>
      {filterIds.length > 0 && (
        <div className="basis-1/3 drop-shadow-lg min-h-full border-l border-white max-h-full overflow-y-scroll bg-gray-700">
          <AssignmentSelect
            layer={layer}
            features={layer.features.filter((f) => filterIds.includes(f.id))}
            surveys={userSurveys}
            surveyors={userSurveyors}
          />
        </div>
      )}
    </div>
  );
}
