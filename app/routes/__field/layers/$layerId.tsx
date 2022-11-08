import { useState, useCallback } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  useLoaderData,
  useOutletContext,
  useSubmit,
  useFetcher,
} from "@remix-run/react";
import clsx from "clsx";

import Map, {
  Source,
  Layer,
  useControl,
  Popup,
  GeolocateControl,
} from "react-map-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";

import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import d_styles from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import m_styles from "../../../styles/mapbox.css";
import { assignedStyle, todoStyle } from "~/styles/features";
import { BasemapSelector } from "~/components/selectors/basemap-selector";
import crosshairs from "../../../../public/images/crosshairs.svg";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";
import { FiLayers } from "react-icons/fi";

import { getUserSession, commitSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export function links() {
  return [
    { rel: "stylesheet", href: mb_styles },
    {
      rel: "stylesheet",
      href: d_styles,
    },
    {
      rel: "stylesheet",
      href: m_styles,
    },
  ];
}

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getUserSession(request);
  const layerId = params.layerId;
  const { assignmentId, viewState, page } = Object.fromEntries(
    await request.formData()
  );
  session.set("viewState", viewState);
  return redirect(
    `/layers/${layerId}/${assignmentId}${page == "notes" ? "/notes" : ""}`,
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  const savedState = session.get("viewState");
  const layerId = params.layerId;
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { id: parseInt(layerId) },
  });
  const assignments = await prisma.assignment.findMany({
    where: {
      feature: {
        is: {
          layerId: layer.id,
        },
      },
      assignee: {
        is: {
          id: userId,
        },
      },
    },
    include: {
      feature: true,
    },
  });
  const token = process.env.MAPBOX_ACCESS_TOKEN;

  return { assignments, layer, savedState, token };
};

export default function TaskMap() {
  const { assignments, layer, savedState, token } = useLoaderData();
  const userId = useOutletContext();
  const fetcher = useFetcher();
  const submit = useSubmit();

  const [showPopup, setShowPopup] = useState(false);
  const [addPoint, setAddPoint] = useState(false);
  const [basemap, setBasemap] = useState("satellite");
  const [dCoords, setDCoords] = useState({ lng: 0, lat: 0 });
  const [cCoords, setCCoords] = useState({ lng: 0, lat: 0 });
  const [preventZoom, setPreventZoom] = useState(true);
  const [viewState, setViewState] = useState(
    savedState
      ? JSON.parse(savedState)
      : {
          longitude: -122.44,
          latitude: 37.75,
          zoom: 12,
        }
  );
  const [completed, setCompleted] = useState<Boolean>();
  const [assignment, setAssignment] = useState();
  const [label, setLabel] = useState("");  
  const completedAssignments = {
    type: "FeatureCollection",
    features: assignments
      .filter((a) => a.completed)
      .map((a) => ({
        id: a.feature.id,
        geometry: a.feature.geojson.geometry,
        properties: {
          ...a.feature.geojson.properties,
          label: a.feature.label,
          surveyId: a.surveyId,
          assignmentId: a.id,
          completed: true,
        },
      })),
  };

  const todoAssignments = {
    type: "FeatureCollection",
    features: assignments
      .filter((a) => !a.completed)
      .map((a) => ({
        id: a.feature.id,
        geometry: a.feature.geojson.geometry,
        properties: {
          ...a.feature.geojson.properties,
          label: a.feature.label,
          surveyId: a.surveyId,
          assignmentId: a.id,
          completed: false,
        },
      })),
  };

  const geolocateRef = useCallback((ref) => {
    if (ref !== null) {
      setTimeout(() => {
        // Activate as soon as the control is loaded
        ref.trigger();
      }, 1000);
    }
  }, []);

  const onFeatureClick = (e) => {
    console.log(e.features);
    setDCoords(e.lngLat);
    if (e.features.length > 0) {
      setAddPoint(false);
      setShowPopup(true);
      setLabel(e.features[0].properties.label);
      setAssignment(e.features[0].properties.assignmentId);
      setCompleted(e.features[0].properties.completed);
    } else if (addPoint) {
      setAddPoint(false);
    }
  };

  const mapDirections = new MapboxDirections({
    accessToken: token,
    placeholderOrigin: "Current Location",
    controls: {
      inputs: false,
      instructions: false,
    },
    zoom: 14,
  });

  const DirectionsControl = () => {
    useControl(() => mapDirections);
    return null;
  };

  const getDirections = () => {
    mapDirections.setOrigin([cCoords.lng, cCoords.lat]);
    mapDirections.setDestination([dCoords.lng, dCoords.lat]);
    mapDirections.on("route", () => {
      try {
        mapDirections.mapState();
      } catch (e) {
        console.error("error", e);
      }
    });
  };

  const createPoint = () => {
    fetcher.submit(
      {
        layerId: String(layer.id),
        coordinates: JSON.stringify({
          lng: viewState.longitude,
          lat: viewState.latitude,
        }),
        userId: String(userId),
      },
      { method: "post", action: "/actions/feature-create" }
    );
  };

  const goToSurvey = () => {
    submit(
      {
        assignmentId: String(assignment),
        viewState: JSON.stringify(viewState),
        page: "survey",
      },
      { method: "post" }
    );
  };

  const goToNotes = () => {
    submit(
      {
        assignmentId: String(assignment),
        viewState: JSON.stringify(viewState),
        page: "notes",
      },
      { method: "post" }
    );
  };

  const setCurrentLocation = (e) => {
    setCCoords({
      lng: e.coords.longitude,
      lat: e.coords.latitude,
    });
  };

  return (
    <div className="h-full relative">
      <Map
        initialViewState={viewState}
        onMove={(e) => {
          setShowPopup(false);
          setViewState(e.viewState);
        }}
        onZoom={(e) => {
          if (preventZoom) {
            e.target.stop();
            setPreventZoom(false);
          }
        }}
        mapStyle={
          basemap == "satellite"
            ? "mapbox://styles/mapbox/satellite-v9"
            : `mapbox://styles/mapbox/${basemap}`
        }
        mapboxAccessToken={token}
        interactiveLayerIds={["todo", "done"]}
        onClick={onFeatureClick}
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
        <Source id="done" type="geojson" data={completedAssignments}>
          <Layer beforeId="todo" id="done" {...assignedStyle} />
        </Source>
        <Source id="todo" type="geojson" data={todoAssignments}>
          <Layer id="todo" {...todoStyle} />
        </Source>

        {showPopup && (
          <Popup
            longitude={dCoords.lng}
            latitude={dCoords.lat}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
          >
            <div className="flex flex-col items-center space-y-2">
              <h2>{label}</h2>
              <button
                onClick={getDirections}
                className="btn btn-xs btn-outline btn-primary"
              >
                Get Directions
              </button>
              {!completed && assignment && (
                <button
                  onClick={goToSurvey}
                  className="btn btn-xs btn-outline btn-secondary"
                >
                  Complete Survey
                </button>
              )}
              <button
                onClick={goToNotes}
                className="btn btn-xs btn-outline btn-secondary"
              >
                Add Notes
              </button>
            </div>
          </Popup>
        )}

        {addPoint && (
          <>
            <div className="absolute top-1/2 left-1/2 transform pointer-events-none -translate-x-1/2 -translate-y-1/2">
              <img src={crosshairs} className="w-30 h-30" alt="crosshairs" />
            </div>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
              <button onClick={createPoint} className="btn w-40">
                Add Point
              </button>
            </div>
          </>
        )}

        <GeolocateControl onGeolocate={setCurrentLocation} ref={geolocateRef} />

        {mapDirections != null && <DirectionsControl />}
      </Map>

      <div className="absolute top-1.5 left-1.5 flex flex-col items-center space-y-1">
        <div className="dropdown dropdown-right py-0 drop-shadow">
          <label
            tabIndex={0}
            className="btn m-1 bg-white text-black text-xl py-0 h-8 w-8 min-h-8 p-1 border-none"
          >
            <FiLayers />
          </label>
          <ul className="dropdown-content menu p-2 shadow bg-white rounded-box w-52">
            <li tabIndex={1}>
              <div
                onClick={() => setBasemap("satellite")}
                className={clsx("p2 font-sans", {
                  active: basemap == "satellite",
                })}
              >
                Satellite
              </div>
            </li>
            <li tabIndex={2}>
              <div
                onClick={() => setBasemap("streets-v11")}
                className={clsx("p2 font-sans", {
                  active: basemap == "streets-v11",
                })}
              >
                Traffic
              </div>
            </li>
            <li tabIndex={3}>
              <div
                onClick={() => setBasemap("outdoors-v11")}
                className={clsx("p2 font-sans", {
                  active: basemap == "outdoors-v11",
                })}
              >
                Topo
              </div>
            </li>
            <li tabIndex={4}>
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
        </div>
        <button
          onClick={() => setAddPoint(!addPoint)}
          className="btn btn-sm border-0 text-2xl drop-shadow btn-square bg-white text-black"
        >
          {!addPoint ? <AiOutlinePlus /> : <AiOutlineClose />}
        </button>
      </div>
    </div>
  );
}
