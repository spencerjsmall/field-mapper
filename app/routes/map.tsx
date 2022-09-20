import { useState, useCallback } from "react";
import type { LoaderArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import Map, {
  Source,
  Layer,
  useControl,
  Popup,
  GeolocateControl,
} from "react-map-gl";
import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import d_styles from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";
import m_styles from "../styles/mapbox.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

import { Layout } from "~/components/layout";
import { getAssignedPoints } from "~/utils/geo.server";
import {
  commitSession,
  getUserSession,
  requireUserSession,
} from "~/utils/auth.server";
import clsx from "clsx";

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

const layerStyle = {
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#007cbf",
  },
};

export const loader = async ({ request }: LoaderArgs) => {
  const session = await requireUserSession(request);
  const userId = session.get("userId");
  const layerId = session.get("layerId");
  const points = await getAssignedPoints(userId, layerId);
  return points;
};

export async function action({ request }) {
  const form = await request.formData();
  const surveyId = form.get("surveyId");
  const recordId = form.get("recordId");
  
  const session = await getUserSession(request);
  session.set("surveyId", surveyId);
  session.set("recordId", recordId);

  return redirect("/survey", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export default function MapPage() {
  const data = useLoaderData();
  const submit = useSubmit();

  const [showPopup, setShowPopup] = useState(false);
  const [showMark, setShowMark] = useState(false);
  const [addPoint, setAddPoint] = useState(false);
  const [basemap, setBasemap] = useState("streets-v11");
  const [dCoords, setDCoords] = useState({ lng: 0, lat: 0 });
  const [cCoords, setCCoords] = useState({ lng: 0, lat: 0 });
  const [surveyId, setSurveyId] = useState<String>();
  const [recordId, setRecordId] = useState<Number>();

  const geolocateRef = useCallback((ref) => {
    if (ref !== null) {
      setTimeout(() => {
        // Activate as soon as the control is loaded
        ref.trigger();
      }, 1000);
    }
  }, []);

  const onFeatureClick = (e) => {
    console.log(e);
    console.log(e.features);
    setDCoords(e.lngLat);
    if (e.features.length > 0) {
      setShowPopup(true);
      setSurveyId(e.features[0].properties.surveyId);
      setRecordId(e.features[0].id);
    } else if (addPoint) {
      setShowMark(true);
    } else {
      setAddPoint(false);
    }
  };

  const getSurvey = (e) => {
    submit({ surveyId: surveyId, recordId: recordId }, { method: "post" });
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
    mapDirections.setOrigin([cCoords.lng, cCoords.lat]);
    mapDirections.setDestination([dCoords.lng, dCoords.lat]);
    mapDirections.on("route", () => {
      try {
        mapDirections.mapState();
      } catch (e) {
        console.error(e);
      }
    });
  };

  // const addPoint = (e) => {
  //   //setShowMark(false);

  // };

  const setCurrentLocation = (e) => {
    console.log(e.coords);
    setCCoords({
      lng: e.coords.longitude,
      lat: e.coords.latitude,
    });
  };

  return (
    <Layout>
      <div className="h-full relative">
        <Map
          initialViewState={{
            longitude: -122.44,
            latitude: 37.75,
            zoom: 12,
          }}
          onMove={(e) => setShowPopup(false)}
          mapStyle={
            basemap == "custom"
              ? "mapbox://styles/mapbox/satellite-v9"
              : `mapbox://styles/mapbox/${basemap}`
          }
          mapboxAccessToken={
            "pk.eyJ1Ijoic3BlbmNlcmpzbWFsbCIsImEiOiJjbDdmNGY5d2YwNnJuM3hsZ2IyN2thc2QyIn0.hLfNqU8faCraSSKrXbtnHQ"
          }
          interactiveLayerIds={["data-layer"]}
          onClick={onFeatureClick}
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
              <Source id="postgres" type="geojson" data={data}>
                <Layer id="data-layer" {...layerStyle} />
              </Source>
            </>
          ) : (
            <Source id="postgres" type="geojson" data={data}>
              <Layer id="data-layer" {...layerStyle} />
            </Source>
          )}

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

                <button
                  onClick={getSurvey}
                  className="btn btn-xs btn-outline btn-secondary"
                >
                  Complete Survey
                </button>
              </div>
            </Popup>
          )}

          {showMark && addPoint && (
            <Popup
              longitude={dCoords.lng}
              latitude={dCoords.lat}
              anchor="bottom"
              onClose={() => setShowMark(false)}
            >
              <button className="btn btn-xs btn-outline btn-primary">
                Add Point
              </button>
            </Popup>
          )}
          <GeolocateControl
            onGeolocate={setCurrentLocation}
            ref={geolocateRef}
          />
          {mapDirections != null && <DirectionsControl />}
        </Map>

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
              className={clsx("p2", { active: basemap == "satellite-v9" })}
            >
              Dark
            </div>
          </li>
          <li>
            <div
              onClick={() => setBasemap("custom")}
              className={clsx("p2", { active: basemap == "custom" })}
            >
              Custom
            </div>
          </li>
        </ul>

        <button
          onClick={() => setAddPoint(!addPoint)}
          className="btn btn-sm absolute top-14 right-2.5 btn-square bg-white text-black"
        >
          {!addPoint ? <AiOutlinePlus /> : <AiOutlineClose />}
        </button>
      </div>
    </Layout>
  );
}
