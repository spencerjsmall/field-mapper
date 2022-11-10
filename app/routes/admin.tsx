import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useLocation,
  useMatches,
} from "@remix-run/react";
import { requireAdminSession } from "~/utils/auth.server";
import { AiOutlineMenu } from "react-icons/ai";
import { AdminAvatars } from "~/components/admin-avatars";
import { prisma } from "~/utils/db.server";
import { LayerUploader } from "~/components/modals/layer-uploader";
import { SurveyorAdminManager } from "~/components/modals/surveyor-admin-manager";
import {
  getUserAdmin,
  getUserLayers,
  getUserSurveyors,
  getUserSurveys,
} from "~/utils/user.server";
import sf_seal from "../../public/images/sf_seal.png";
import { useEffect, useState } from "react";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireAdminSession(request);
  const userId = session.get("userId");

  const userAdmin = await getUserAdmin(userId);
  const userSurveys = await getUserSurveys(userId);
  const userSurveyors = await getUserSurveyors(userId);
  const userLayers = await getUserLayers(userId);

  const allSurveyors = await prisma.surveyor.findMany({
    include: { user: true },
  });

  const allAdmins = await prisma.admin.findMany({
    include: { user: true },
  });

  return {    
    userAdmin,
    userSurveys,
    userSurveyors,
    userLayers,
    allSurveyors,
    allAdmins,
  };
};

export default function AdminLayout() {
  const {    
    userAdmin,
    userSurveys,
    userSurveyors,
    userLayers,
    allSurveyors,
    allAdmins,
  } = useLoaderData();
  const location = useLocation();
  const matches = useMatches();  

  const surveyorsData = allSurveyors.map((s) => ({
    key: s.id,
    value: `${s.user.firstName} ${s.user.lastName}`,
  }));

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="grid grid-cols-3 grid-rows-1 bg-black sticky top-0 z-50 drop-shadow-xl border-b border-white text-white text-2xl py-4 px-6">
        {/* <label htmlFor="sidebar" className="cursor-pointer text-3xl">
            <AiOutlineMenu />
          </label> */}
        <Link
          className="flex flex-row justify-self-start text-2xl items-center space-x-3"
          to="/admin/home"
        >
          <img
            src={sf_seal}
            className="w-14"
            alt="City and County of San Francico"
          />

          <h1 className="uppercase hidden lg:inline">
            {matches[2].id == "routes/admin/layers.$layerId" &&
            matches[2].data.layer
              ? matches[2].data.layer.name
              : "Field Mapper"}
          </h1>
        </Link>

        <div className="flex flex-row justify-self-center space-x-4 lg:space-x-8 xl:space-x-12 items-center text-xl uppercase cursor-pointer">
          <Link
            className={
              location.pathname == "/admin/surveys"
                ? "text-gray-100"
                : "text-gray-500 hover:text-gray-100"
            }
            to="/admin/surveys"
          >
            surveys
          </Link>
          <Link
            className={
              location.pathname == "/admin/layers"
                ? "text-gray-100"
                : "text-gray-500 hover:text-gray-100"
            }
            to="/admin/layers"
          >
            layers
          </Link>
          <Link
            className={
              location.pathname == "/admin/surveyors"
                ? "text-gray-100"
                : "text-gray-500 hover:text-gray-100"
            }
            to="/admin/surveyors"
          >
            surveyors
          </Link>
        </div>

        <form action="/auth/logout" className="justify-self-end" method="post">
          <button type="submit">
            <AdminAvatars admins={[userAdmin]} />
          </button>
        </form>
      </div>

      <div className="drawer">
        <input id="sidebar" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <div className="w-full max-h-full bg-ggp bg-blend-multiply bg-gray-800 bg-center h-full overflow-y-hidden z-0">
            <Outlet
              context={{
                userAdmin,
                userSurveys,
                userSurveyors,
                userLayers,
                allSurveyors,
                allAdmins,
              }}
            />
          </div>
        </div>

        <div className="drawer-side">
          <label htmlFor="sidebar" className="drawer-overlay"></label>
          <ul className="menu p-4 overflow-y-auto w-80 bg-black border-r border-white text-base-content">
            <li>Sidebar Item 1</li>
            <li>Sidebar Item 2</li>
          </ul>
        </div>

        <input type="checkbox" id="new-layer-modal" className="modal-toggle" />
        <div className="modal">
          <div className="modal-box relative p-8 bg-gray-800 border border-gray-700">
            <LayerUploader surveys={userSurveys} />
          </div>
        </div>

        <input
          type="checkbox"
          id="add-surveyors-modal"
          className="modal-toggle"
        />
        <div className="modal">
          <div className="modal-box relative p-8 bg-gray-800 border border-gray-700">
            <SurveyorAdminManager
              userSurveyors={userSurveyors}
              allSurveyorData={surveyorsData}
              admin={userAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
