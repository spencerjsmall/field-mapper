import { useState, useMemo, useRef } from "react";
import { LoaderArgs, redirect } from "@remix-run/node";
import { useLoaderData, Outlet, useFetcher, useSubmit } from "@remix-run/react";

import Map, { Source, Layer, useMap, Popup } from "react-map-gl";
import mb_styles from "mapbox-gl/dist/mapbox-gl.css";
import m_styles from "../../styles/mapbox.css";
import { AiOutlinePlus, AiOutlineClose } from "react-icons/ai";

import { getAllPoints, getAssignedPoints } from "~/utils/geo.server";
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
  const points = await getAllPoints("PublicArtPoints");
  return points;
};

export async function action({ request }) {
  const form = await request.formData();
  const ids = form.get("ids");
  console.log("ids", ids);
  const path =
    ids == "" ? "" : JSON.parse(ids).reduce((a, b) => a + "/" + b, "");
  return redirect(`assignments${path}`);
}

const todoLayer = {
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#0000FF",
  },
};

const highlightLayer = {
  type: "circle",
  paint: {
    "circle-radius": 10,
    "circle-color": "#FF0000",
  },
};

export default function AdminPage() {
  const points = useLoaderData();
  const mapRef = useRef();
  const submit = useSubmit();

  const [basemap, setBasemap] = useState("streets-v11");
  const [addPoint, setAddPoint] = useState(false);
  const [start, setStart] = useState<Number[]>();
  const [filterIds, setFilterIds] = useState<Any[]>([]);

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
    console.log("start", start);
    console.log("end", end);
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

  return (
    <div className="h-full">
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
              <Source id="todo" type="geojson" data={points}>
                <Layer id="todo" {...todoLayer} />
              </Source>
              <Source id="todo" type="geojson" data={points}>
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
            className="btn btn-sm absolute top-2 right-2.5 btn-square bg-white text-black"
          >
            {!addPoint ? <AiOutlinePlus /> : <AiOutlineClose />}
          </button>
        </Map>
        <div className="basis-1/3 h-full bg-white">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
