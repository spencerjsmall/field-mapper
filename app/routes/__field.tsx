import {
  Outlet,
  useLoaderData,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import { Link } from "@remix-run/react";
import clsx from "clsx";

import { BsGlobe } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { CgNotes } from "react-icons/cg";
import { IoIosArrowDropleftCircle, IoIosContact } from "react-icons/io";
import { requireUserSession } from "~/utils/auth.server";
import { prisma } from "@prisma/client";

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await requireUserSession(request);
  const userId = session.get("userId");
  const taskId = session.get('task')
  const assignmentId = params.assignmentId;
  return { userId, taskId, assignmentId };
};

export default function FieldLayout() {
  const { userId, taskId, assignmentId } = useLoaderData();
  const { pathname } = useLocation();  
  const navigate = useNavigate();

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-row basis-1/12 bg-[#41437E] items-center sticky top-0 z-50 justify-between text-white text-2xl py-4 px-6">
        {pathname != "/" && (
          <div onClick={() => navigate(-1)}>
            <IoIosArrowDropleftCircle />
          </div>
        )}
        {pathname && (
          <h3 className="uppercase pl-10">
            {pathname == "/home"
              ? "home"
              : taskId && assignmentId == undefined
              ? taskId.split(/(?=[A-Z])/).join(" ")
              : "survey"}
          </h3>
        )}

        <div className="btn btn-sm font-sans btn-ghost">
          <form action="/auth/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div>
      </div>

      <div className="w-full basis-10/12 z-0">
        <Outlet context={userId} />
      </div>
      <div className="btm-nav btm-nav-lg w-full basis-1/12 bg-[#41437E] z-50">
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
          to={`/tasks/${taskId}`}
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname.match(/\//g).length == 2,
            disabled: taskId == undefined,
          })}
        >
          <button className="flex flex-row items-center text-2xl">
            <BsGlobe />
          </button>
        </Link>
        <Link
          to={`/tasks/${taskId}/${assignmentId}`}
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname.match(/\//g).length == 3,
            disabled: taskId == undefined || assignmentId == undefined,
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
