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

export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await requireUserSession(request);
  const userId = session.get("userId");
  const taskId = params.taskId;
  const recordId = params.recordId;
  const surveyId = params.surveyId;
  return { userId, taskId, recordId, surveyId };
};

export default function FieldLayout() {
  const { userId, taskId, recordId, surveyId } = useLoaderData();
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

        <span className="uppercase text-xl pl-10">
          {pathname == "/home"
            ? "home"
            : surveyId == undefined
            ? taskId.split(/(?=[A-Z])/).join(" ")
            : "survey"}
        </span>

        <div className="btn btn-sm btn-ghost">
          <form action="/logout" method="post">
            <button type="submit">Sign Out</button>
          </form>
        </div>
      </div>

      <div className="w-full basis-10/12 z-0">
        <Outlet context={userId} />
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
          to={`/tasks/${taskId}`}
          className={clsx({
            "text-white bg-blue": true, //always applies
            active: pathname == `/tasks/${taskId}`,
            disabled: taskId == null,
          })}
        >
          <button className="flex flex-row items-center text-2xl">
            <BsGlobe />
          </button>
        </Link>
        <Link
          to={`/tasks/${taskId}/${recordId}/${surveyId}`}
          className={clsx({
            "text-white bg-blue": true, //always applies
            //active: pathname == `/tasks/${taskId}/${recordId}/${surveyId}`,
            disabled:
              taskId == undefined ||
              recordId == undefined ||
              surveyId == undefined,
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
