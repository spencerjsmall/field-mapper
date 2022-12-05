import clsx from "clsx";
import { useState } from "react";
import { FiLayers } from "react-icons/fi";

export function BasemapSelector({ basemap, changeStyle }) {
  const [showOptions, setShowOptions] = useState(false);
  return (
    <div className="dropdown dropdown-right drop-shadow">
      <label tabIndex={0}>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="btn btn-sm border-0 text-xl rounded-full h-10 w-10 btn-square bg-white text-black"
        >
          <FiLayers />
        </button>
      </label>
      {showOptions && (
        <ul className="dropdown-content ml-4 menu p-2 shadow bg-slate-700 bborder border-slate-500 rounded-box w-52">
          <li tabIndex={1}>
            <div
              onClick={() => {
                setShowOptions(false);
                changeStyle("satellite");
              }}
              className={clsx("p2 font-sans text-lg", {
                active: basemap == "satellite",
              })}
            >
              Satellite
            </div>
          </li>
          <li tabIndex={2}>
            <div
              onClick={() => {
                setShowOptions(false);
                changeStyle("streets-v11");
              }}
              className={clsx("p2 font-sans text-lg", {
                active: basemap == "streets-v11",
              })}
            >
              Traffic
            </div>
          </li>
          <li tabIndex={3}>
            <div
              onClick={() => {
                setShowOptions(false);
                changeStyle("outdoors-v11");
              }}
              className={clsx("p2 font-sans text-lg", {
                active: basemap == "outdoors-v11",
              })}
            >
              Topo
            </div>
          </li>
          <li tabIndex={4}>
            <div
              onClick={() => {
                setShowOptions(false);
                changeStyle("dark-v10");
              }}
              className={clsx("p2 font-sans text-lg", {
                active: basemap == "dark-v10",
              })}
            >
              Dark
            </div>
          </li>
        </ul>
      )}
    </div>
  );
}
