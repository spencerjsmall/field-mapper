import { useState, useMemo, useRef, useEffect } from "react";
import { prisma } from "~/utils/db.server";
import { json, LoaderArgs } from "@remix-run/node";
import {
  useLoaderData,
  useOutletContext,
  useFetcher,
  useCatch,
  useParams,
  Link,
} from "@remix-run/react";

import Map, { Source, Layer } from "react-map-gl";
import { commitSession, getSession } from "~/utils/auth.server";

import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import m_styles from "../../styles/mapbox.css";
import {
  assignedStyle,
  highlightedStyle,
  todoStyle,
  doneStyle,
} from "~/styles/features";
import crosshairs from "../../../public/images/crosshairs.svg";
import { AssignmentSelect } from "~/components/selectors/assignment-selector";
import { MapSettings } from "~/components/selectors/map-settings";
import { ErrorMessage } from "~/components/error-message";

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
  const layer = await prisma.layer.findUnique({
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
  if (!layer) {
    throw new Response("Layer not found.", {
      status: 404,
    });
  }
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
  const [filter, setFilter] = useState(["todo", "assigned", "done"]);
  const [beforeId, setBeforeId] = useState("todo");
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
    [layer.features, fetcher.data]
  );

  const assignedCollection = useMemo(
    () => ({
      type: "FeatureCollection",
      features: layer.features
        .filter((f) => f.assignment && !f.assignment.completed)
        .map((f) => ({ id: f.id, ...f.geojson })),
    }),
    [layer.features, fetcher.data]
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

  useEffect(() => {
    setBeforeId(filter[0]);
  }, [filter]);

  const onFeatureClick = (e) => {    
    console.log(e.lngLat);
    if (e.features.length > 0) {
      console.log(e.features);
      setAddPoint(false);
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
      layers: filter,
    });
    const ids = queried.map((record) => record.id);
    //take symetrical difference of existing and new selections
    let difference = filterIds
      .filter((i) => !ids.includes(i))
      .concat(ids.filter((i) => !filterIds.includes(i)));
    setFilterIds(difference);
  };

  return (
    <div className="drawer max-h-full h-full drawer-end">
      <input
        id="sidebar"
        type="checkbox"
        checked={filterIds.length > 0}
        className="drawer-toggle"
      />
      <div className="drawer-content">
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
            interactiveLayerIds={filter}
            onClick={onFeatureClick}
            ref={mapRef}
            className="relative"
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
                <Layer beforeId={beforeId} type="raster" />
              </Source>
            )}

            {filter.includes("todo") && (
              <Source id="todo" type="geojson" data={todoCollection}>
                <Layer id="todo" beforeId="highlighted" {...todoStyle} />
              </Source>
            )}
            {filter.includes("assigned") && (
              <Source id="assigned" type="geojson" data={assignedCollection}>
                <Layer
                  id="assigned"
                  beforeId="highlighted"
                  {...assignedStyle}
                />
              </Source>
            )}
            {filter.includes("done") && (
              <Source id="done" type="geojson" data={completedCollection}>
                <Layer id="done" beforeId="highlighted" {...doneStyle} />
              </Source>
            )}

            <Source id="highlighted" type="geojson" data={selectCollection}>
              <Layer id="highlighted" {...highlightedStyle} />
            </Source>

            {addPoint && (
              <>
                <div className="absolute pointer-events-none top-1/2 left-1/2 transform flex flex-col items-center space-y-52 -translate-x-1/2 -translate-y-1/2">
                  <img
                    src={crosshairs}
                    className="w-64 h-64"
                    alt="crosshairs"
                  />
                </div>
                <button
                  onClick={createPoint}
                  className="btn w-40 absolute bottom-32 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  Add Point
                </button>
              </>
            )}

            <div className="absolute top-3 left-5">
              <MapSettings
                setFilter={setFilter}
                filter={filter}
                setBasemap={setBasemap}
                basemap={basemap}
                setAddPoint={setAddPoint}
                addPoint={addPoint}
              />
            </div>

            <div className="toast">
              <div className="alert bg-black">
                <div>
                  <span className="text-slate-300 font-space">
                    <code>shift</code> + drag to select multiple points
                  </span>
                </div>
              </div>
            </div>
          </Map>
        </div>
      </div>
      <div className="drawer-side max-h-full h-full">
        <label
          htmlFor="sidebar"
          className="drawer-overlay opacity-0 pointer-events-none"
        ></label>
        <AssignmentSelect
          layer={layer}
          features={layer.features.filter((f) => filterIds.includes(f.id))}
          surveys={userSurveys}
          surveyors={userSurveyors}
        />
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return <ErrorMessage message={`Could not find layer ${params.layerId}`} />;
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}
