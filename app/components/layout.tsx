import { useLocation, useNavigate } from "@remix-run/react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

import { BsGlobe } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { CgNotes } from "react-icons/cg";
import { IoIosArrowDropleftCircle, IoIosContact } from "react-icons/io";

export default function Layout({ children }: { children: React.ReactNode }) {
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
          <span className="uppercase text-xl">
            {pathname == "/" ? "home" : pathname.substring(1)}
          </span>
        )}
        <IoIosContact />
      </div>

      <div className="w-full basis-10/12">{children}</div>
      <div className="btm-nav btm-nav-md w-full basis-1/12 bg-blue">
        <Link
          to="/"
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname == "/",
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
