import clsx from "clsx";

export function BasemapSelector({ basemap, setBasemap }) {
  return (
    <ul className="menu menu-horizontal bg-black w-auto text-xs p-1 rounded-box">
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
          onClick={() => setBasemap("satellite")}
          className={clsx("p2 font-sans", {
            active: basemap == "satellite",
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
  );
}
