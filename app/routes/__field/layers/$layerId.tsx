import { useState, useCallback, useRef } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  useLoaderData,
  useSubmit,
  useFetcher,
  useCatch,
  useParams,
} from "@remix-run/react";

import Map, { Source, Layer, Popup, GeolocateControl } from "react-map-gl";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";

import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import d_styles from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import m_styles from "../../../styles/mapbox.css";
import { todoStyle, doneStyle } from "~/styles/features";
import crosshairs from "../../../../public/images/crosshairs.svg";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

import { getUserSession, commitSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { BasemapSelector } from "~/components/selectors/basemap-selector";
import { ErrorMessage } from "~/components/error-message";

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
  const layer = await prisma.layer.findUnique({
    where: { id: parseInt(layerId) },
  });
  if (!layer) {
    throw new Response("Layer not found.", {
      status: 404,
    });
  }
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

  return { assignments, layer, savedState, token, userId };
};

export default function TaskMap() {
  const { assignments, layer, savedState, token, userId } = useLoaderData();
  const fetcher = useFetcher();
  const submit = useSubmit();
  const mapRef = useRef();

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
  const [hasSurvey, setHasSurvey] = useState(false);
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

  const mapDirections = new MapboxDirections({
    accessToken: token,
    placeholderOrigin: "Current Location",
    controls: {
      inputs: false,
      instructions: true,
    },
    zoom: 14,
  });

  const geolocateRef = useCallback((ref) => {
    if (ref !== null) {
      setTimeout(() => {
        // Activate as soon as the control is loaded
        ref.trigger();
      }, 1000);
    }
  }, []);

  const addNavigation = () => {
    mapRef.current.addControl(mapDirections);
  };

  const setCurrentLocation = (e) => {
    setCCoords({
      lng: e.coords.longitude,
      lat: e.coords.latitude,
    });
  };

  const onFeatureClick = (e) => {
    console.log(e.features);
    setDCoords(e.lngLat);
    if (e.features.length > 0) {
      mapRef.current.flyTo({ center: e.lngLat });
      let feat = e.features[0];
      setAddPoint(false);
      setShowPopup(true);
      setLabel(
        feat.properties.label == undefined
          ? `Record #${feat.id}`
          : feat.properties.label
      );
      setAssignment(feat.properties.assignmentId);
      setHasSurvey(feat.properties.surveyId !== undefined);
      setCompleted(feat.properties.completed);
    } else if (addPoint) {
      setAddPoint(false);
    } else {
      mapDirections.removeRoutes();
    }
  };

  const getDirections = () => {
    setShowPopup(false);
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

  const changeStyle = (bmap) => {
    mapRef.current.removeControl(mapDirections);
    setBasemap(bmap);
    setTimeout(() => {
      addNavigation();
    }, 2000);
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

  return (
    <Map
      initialViewState={viewState}
      ref={mapRef}
      onLoad={addNavigation}
      onMove={(e) => {
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
          ? `mapbox://styles/mapbox/satellite-v9`
          : `mapbox://styles/mapbox/${basemap}`
      }
      mapboxAccessToken={token}
      interactiveLayerIds={["todo", "done"]}
      onClick={onFeatureClick}
      style={{ flexGrow: 1, position: "relative", width: "100%" }}
    >
      {basemap == "satellite" && (
        <Source
          id="tiles"
          type="raster"
          tiles={["https://til.3dg.is/api/tiles/p2021_rgb8cm/{z}/{x}/{y}.png"]}
          tileSize={256}
        >
          <Layer beforeId="todo" type="raster" />
        </Source>
      )}
      <Source id="done" type="geojson" data={completedAssignments}>
        <Layer beforeId="todo" id="done" {...doneStyle} />
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
          <ul className="menu bg-slate-700 w-56 border-slate-500 border drop-shadow-md rounded-box">
            <li className="menu-title max-w-full py-2">
              <h2 className="text-xl text-orange-400">{label}</h2>
            </li>
            <li className="border-t border-slate-300" onClick={getDirections}>
              <p className="text-lg text-white">Get Directions</p>
            </li>
            {!completed && assignment && hasSurvey && (
              <li
                className="border-t border-slate-300 text-center"
                onClick={goToSurvey}
              >
                <p className="text-lg text-white">Complete Survey</p>
              </li>
            )}
            <li className="border-t border-slate-300" onClick={goToNotes}>
              <p className="text-lg text-white">Add Notes</p>
            </li>
          </ul>
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

      <GeolocateControl
        trackUserLocation
        showUserHeading
        onGeolocate={setCurrentLocation}
        ref={geolocateRef}
      />
      <div className="absolute top-3 left-3 flex flex-col items-center space-y-2">
        <BasemapSelector changeStyle={changeStyle} basemap={basemap} />
        <button
          onClick={() => setAddPoint(!addPoint)}
          className="btn btn-sm border-0 text-2xl rounded-full h-10 w-10 drop-shadow btn-square bg-white text-black"
        >
          {!addPoint ? <AiOutlinePlus /> : <AiOutlineClose />}
        </button>
      </div>
    </Map>
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
