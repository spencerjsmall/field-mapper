import { useState, useCallback } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  useLoaderData,
  useOutletContext,
  useSubmit,
  useFetcher,
} from "@remix-run/react";

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
import { BasemapSelector } from "~/components/basemap-selector";

import {
  getUserSession,
  commitSession,
  requireUserSession,
} from "~/utils/auth.server";
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

export const loader = async ({ request, params }: LoaderArgs) => {
  const session = await requireUserSession(request);
  const userId = session.get("userId");
  const savedState = session.get("viewState");
  const taskId = params.taskId;
  const layer = await prisma.layer.findUniqueOrThrow({
    where: { name: taskId },
  });
  const assignments = await prisma.feature.findMany({
    where: {
      layerId: layer.id,
      assignment: {
        is: {
          assigneeId: userId,
        },
      },
    },
    include: {
      assignment: true,
    },
  });

  return { assignments, layer, savedState };
};

export const action: ActionFunction = async ({ request, params }) => {
  const session = await getUserSession(request);
  const taskId = params.taskId;
  const { assignmentId, viewState } = Object.fromEntries(
    await request.formData()
  );
  session.set("viewState", viewState);
  return redirect(`/tasks/${taskId}/${assignmentId}`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function TaskMap() {
  const { assignments, layer, savedState } = useLoaderData();
  const userId = useOutletContext();
  const fetcher = useFetcher();
  const submit = useSubmit();

  const [showPopup, setShowPopup] = useState(false);
  const [addPoint, setAddPoint] = useState(false);
  const [basemap, setBasemap] = useState("streets-v11");
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

  const completedAssignments = {
    type: "FeatureCollection",
    features: assignments
      .filter((f) => f.assignment.completed)
      .map((f) => ({
        id: f.id,
        geometry: f.geojson.geometry,
        properties: {
          ...f.geojson.properties,
          surveyId: f.assignment.surveyId,
          assignmentId: f.assignment.id,
          completed: true,
        },
      })),
  };

  const todoAssignments = {
    type: "FeatureCollection",
    features: assignments
      .filter((f) => !f.assignment.completed)
      .map((f) => ({
        id: f.id,
        geometry: f.geojson.geometry,
        properties: {
          ...f.geojson.properties,
          surveyId: f.assignment.surveyId,
          assignmentId: f.assignment.id,
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
      setShowPopup(true);
      setAssignment(e.features[0].properties.assignmentId);
      setCompleted(e.features[0].properties.completed);
    } else setAddPoint(true);
  };

  const mapDirections = new MapboxDirections({
    accessToken:
      "pk.eyJ1Ijoic3BlbmNlcmpzbWFsbCIsImEiOiJjbDdmNGY5d2YwNnJuM3hsZ2IyN2thc2QyIn0.hLfNqU8faCraSSKrXbtnHQ",
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
    mapDirections.on("route", () => {
      try {
        mapDirections.mapState();
      } catch (e) {
        console.error("error", e);
      }
    });
    mapDirections.setOrigin([cCoords.lng, cCoords.lat]);
    mapDirections.setDestination([dCoords.lng, dCoords.lat]);
  };

  const createPoint = () => {
    setAddPoint(false);
    fetcher.submit(
      {
        layerId: String(layer.id),
        coordinates: JSON.stringify(dCoords),
        userId: String(userId),
      },
      { method: "post", action: "/layer/feature-create" }
    );
  };

  const getSurvey = () => {
    submit(
      {
        assignmentId: String(assignment),
        viewState: JSON.stringify(viewState),
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
          setAddPoint(false);
          setViewState(e.viewState);
        }}
        onZoom={(e) => {
          if (preventZoom) {
            e.target.stop();
            setPreventZoom(false);
          }
        }}
        mapStyle={
          basemap == "custom"
            ? "mapbox://styles/mapbox/satellite-v9"
            : `mapbox://styles/mapbox/${basemap}`
        }
        mapboxAccessToken={
          "pk.eyJ1Ijoic3BlbmNlcmpzbWFsbCIsImEiOiJjbDdmNGY5d2YwNnJuM3hsZ2IyN2thc2QyIn0.hLfNqU8faCraSSKrXbtnHQ"
        }
        interactiveLayerIds={["todo", "done"]}
        onClick={onFeatureClick}
      >
        {basemap == "custom" && (
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
        )}

        <Source id="todo" type="geojson" data={todoAssignments}>
          <Layer id="todo" {...todoStyle} />
        </Source>
        <Source id="done" type="geojson" data={completedAssignments}>
          <Layer id="done" {...assignedStyle} />
        </Source>

        {showPopup && (
          <Popup
            longitude={dCoords.lng}
            latitude={dCoords.lat}
            anchor="bottom"
            onClose={() => setShowPopup(false)}
          >
            <div className="flex flex-col items-center space-y-2">
              <button
                onClick={getDirections}
                className="btn btn-xs btn-outline btn-primary"
              >
                Get Directions
              </button>
              {!completed && assignment && (
                <button
                  onClick={getSurvey}
                  className="btn btn-xs btn-outline btn-secondary"
                >
                  Complete Survey
                </button>
              )}
            </div>
          </Popup>
        )}

        {addPoint && (
          <Popup
            longitude={dCoords.lng}
            latitude={dCoords.lat}
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

        <GeolocateControl onGeolocate={setCurrentLocation} ref={geolocateRef} />

        {mapDirections != null && <DirectionsControl />}
      </Map>

      <div className="absolute top-3 left-1">
        <BasemapSelector basemap={basemap} setBasemap={setBasemap} />
      </div>
    </div>
  );
}
