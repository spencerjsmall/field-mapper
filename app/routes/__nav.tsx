import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { json, isSession } from "@remix-run/node";
import { Link } from "@remix-run/react";
import clsx from "clsx";

import { BsGlobe } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { CgNotes } from "react-icons/cg";
import { IoIosArrowDropleftCircle, IoIosContact } from "react-icons/io";
import { requireUserSession } from "~/utils/auth.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireUserSession(request);
  const layerId = session.get("layerId");
  const recordId = session.get("recordId");
  return { layerId, recordId };
};

export default function Layout() {
  const { layerId, recordId } = useLoaderData();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row basis-1/12 bg-blue items-center sticky top-0 z-50 justify-between bg-black text-white text-2xl py-4 px-6">
        {pathname != "/" && (
          <div onClick={() => navigate(-1)}>
            <IoIosArrowDropleftCircle />
          </div>
        )}
        {!pathname.substring(1).includes("/") && (
          <span className="uppercase text-xl pl-10">
            {pathname == "/" ? "home" : pathname.substring(1)}
          </span>
        )}
        <div className="btn btn-sm btn-ghost">
          <form action="/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div>
      </div>

      <div className="w-full basis-10/12 z-0">
        <Outlet />
      </div>
      <div className="btm-nav btm-nav-md w-full basis-1/12 bg-black z-50">
        <Link
          to="/home"
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname == "/home",
          })}
        >
          <button className="flex flex-row items-center text-2xl">
            <AiOutlineHome />
          </button>
        </Link>
        <Link
          to="/map"
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname == "/map",
            disabled: layerId == null,
          })}
        >
          <button className="flex flex-row items-center text-2xl">
            <BsGlobe />
          </button>
        </Link>
        <Link
          to="/survey"
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname == "/survey",
            disabled: recordId == null,
          })}
        >
          <button className="flex flex-row items-center text-2xl">
            <CgNotes />
          </button>
        </Link>
      </div>
    </div>
  );
}
