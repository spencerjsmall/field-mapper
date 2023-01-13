import clsx from "clsx";
import _ from "lodash";
import { useState } from "react";
import { AiOutlineClose, AiOutlinePlus } from "react-icons/ai";
import { FiLayers, FiFilter } from "react-icons/fi";

export function MapSettings({
  setFilter,
  filter,
  setBasemap,
  basemap,
  setAddPoint,
  addPoint,
}) {
  const [filterMenu, setFilterMenu] = useState(false);
  const [basemapMenu, setBasemapMenu] = useState(false);
  return (
    <ul className="menu menu-horizontal bg-slate-800 rounded-box border border-slate-600 drop-shadow-sm">
      <li tabIndex={0}>
        <div className="tooltip tooltip-bottom" data-tip="Basemap">
          <span
            className="text-2xl"
            onClick={() => setBasemapMenu(!basemapMenu)}
          >
            <FiLayers />
          </span>
        </div>
        {basemapMenu && (
          <ul className="rounded-box bg-slate-800 border border-slate-600 drop-shadow-sm">
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setBasemapMenu(false);
                setBasemap("satellite");
              }}
            >
              <a className={basemap == "satellite" ? "active" : ""}>
                Satellite
              </a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setBasemapMenu(false);
                setBasemap("streets-v11");
              }}
            >
              <a className={basemap == "streets-v11" ? "active" : ""}>
                Traffic
              </a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setBasemapMenu(false);
                setBasemap("outdoors-v11");
              }}
            >
              <a className={basemap == "outdoors-v11" ? "active" : ""}>Topo</a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setBasemapMenu(false);
                setBasemap("dark-v10");
              }}
            >
              <a className={basemap == "dark-v10" ? "active" : ""}>Dark</a>
            </li>
          </ul>
        )}
      </li>

      <li tabIndex={1}>
        <div className="tooltip tooltip-bottom" data-tip="Filter">
          <span className="text-2xl" onClick={() => setFilterMenu(!filterMenu)}>
            <FiFilter />
          </span>
        </div>
        {filterMenu && (
          <ul className="rounded-box bg-slate-800 border border-slate-600 drop-shadow-sm">
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setFilterMenu(false);
                setFilter(["todo", "mandatory", "optional", "done"]);
              }}
            >
              <a
                className={
                  _.isEmpty(
                    _.xor(filter, ["todo", "mandatory", "optional", "done"])
                  )
                    ? "active"
                    : ""
                }
              >
                All
              </a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setFilterMenu(false);
                setFilter(["todo"]);
              }}
            >
              <a className={_.isEmpty(_.xor(filter, ["todo"])) ? "active" : ""}>
                Unassigned
              </a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setFilterMenu(false);
                setFilter(["mandatory"]);
              }}
            >
              <a
                className={
                  _.isEmpty(_.xor(filter, ["mandatory"])) ? "active" : ""
                }
              >
                Mandatory
              </a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setFilterMenu(false);
                setFilter(["optional"]);
              }}
            >
              <a
                className={
                  _.isEmpty(_.xor(filter, ["optional"])) ? "active" : ""
                }
              >
                Optional
              </a>
            </li>
            <li
              className="text-lg text-center cursor-pointer hover:text-white"
              onClick={() => {
                setFilterMenu(false);
                setFilter(["done"]);
              }}
            >
              <a className={_.isEmpty(_.xor(filter, ["done"])) ? "active" : ""}>
                Completed
              </a>
            </li>
          </ul>
        )}
      </li>
      <div className="tooltip tooltip-bottom" data-tip="Add Point">
        <li
          className="text-2xl text-center cursor-pointer hover:text-white"
          onClick={() => setAddPoint(!addPoint)}
        >
          <a className={addPoint ? "active" : ""}>
            {addPoint ? <AiOutlineClose /> : <AiOutlinePlus />}
          </a>
        </li>
      </div>
    </ul>
  );
}
