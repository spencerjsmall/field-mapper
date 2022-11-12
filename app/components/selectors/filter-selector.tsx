import clsx from "clsx";
import _ from "lodash";

export function FilterSelector({ filter, setFilter }) {
  return (
    <ul className="menu menu-horizontal bg-black w-auto text-xs p-1 rounded-box">
      <li>
        <div
          onClick={() => setFilter(["todo", "assigned", "done"])}
          className={clsx("p2 font-sans", {
            active: _.isEmpty(_.xor(filter, ["todo", "assigned", "done"])),
          })}
        >
          All
        </div>
      </li>
      <li>
        <div
          onClick={() => setFilter(["todo"])}
          className={clsx("p2 font-sans", {
            active: _.isEmpty(_.xor(filter, ["todo"])),
          })}
        >
          Todo
        </div>
      </li>
      <li>
        <div
          onClick={() => setFilter(["assigned"])}
          className={clsx("p2 font-sans", {
            active: _.isEmpty(_.xor(filter, ["assigned"])),
          })}
        >
          Assigned
        </div>
      </li>
      <li>
        <div
          onClick={() => setFilter(["done"])}
          className={clsx("p2 font-sans", {
            active: _.isEmpty(_.xor(filter, ["done"])),
          })}
        >
          Completed
        </div>
      </li>
    </ul>
  );
}
