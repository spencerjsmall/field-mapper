import { prisma } from "~/utils/db.server";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { LayerTable } from "~/components/tables/layer-table";
import { SurveyTable } from "~/components/tables/survey-table";
import { SurveyorTable } from "~/components/tables/surveyor-table";
import { getSession } from "~/utils/auth.server";

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const layerId = session.get("layerId");
  const recentLayer = await prisma.layer.findUnique({
    where: { id: layerId ? parseInt(layerId) : -1 },
  });
  return { recentLayer };
};

export default function HomePage() {
  const { recentLayer } = useLoaderData();
  const { userAdmin, userLayers, userSurveys, userSurveyors, allAdmins } =
    useOutletContext();
  const adminData = allAdmins.map((a) => ({
    key: a.id,
    value: `${a.user.firstName} ${a.user.lastName}`,
  }));
  return (
    <div className="xl:grid xl:mx-auto flex flex-col h-full xl:h-fit items-center justify-center grid-flow-row xl:mt-12 xl:w-full 2xl:w-10/12 grid-cols-2 gap-y-10">
      <div className="flex flex-col pb-20 xl:p-0 items-center self-center justify-self-center">
        <h1 className="text-gray-200">Welcome, {userAdmin.user.firstName}</h1>
        {recentLayer !== null && (
          <div className="contents">
            <h3 className="italic my-4">Jump back into</h3>
            <Link to={`/admin/layers/${recentLayer.id}`}>
              <button className="btn">{recentLayer.name}</button>
            </Link>
          </div>
        )}
      </div>
      <div className="w-fit xl:flex hidden justify-self-center flex-col items-center xl:items-start">
        <div className="flex flex-row justify-between w-full items-center mb-6">
          <div className="flex flex-row space-x-2">
            <Link to="/admin/surveys">
              <h2 className="text-gray-100 hover:text-orange-400">
                Surveys
              </h2>
            </Link>
            <Link
              className="text-xl text-gray-400 cursor-pointer hover:text-white"
              to="/admin/surveys/new"
            >
              +
            </Link>
          </div>
          {userSurveys && userSurveys.length > 3 && (
            <Link to="/admin/surveys" className="hover:hover:text-orange-400">
              Show all
            </Link>
          )}
        </div>

        <SurveyTable
          surveys={userSurveys.slice(0, 3)}
          adminData={adminData}
          preview
        />
      </div>
      <div className="w-fit justify-self-center xl:flex hidden flex-col items-center xl:items-start">
        <div className="flex flex-row justify-between w-full items-center mb-6">
          <div className="flex flex-row space-x-2">
            <Link to="/admin/layers">
              <h2 className="text-gray-100 hover:text-orange-400">Layers</h2>
            </Link>
            <label
              className="text-xl text-gray-400 cursor-pointer hover:text-white"
              htmlFor="new-layer-modal"
            >
              +
            </label>
          </div>
          {userLayers && userLayers.length > 3 && (
            <Link to="/admin/layers" className="hover:hover:text-orange-400">
              Show all
            </Link>
          )}
        </div>

        <LayerTable
          layers={userLayers.slice(0, 3)}
          surveys={userSurveys}
          adminData={adminData}
          preview
        />
      </div>
      <div className="w-fit xl:flex hidden justify-self-center flex-col items-center xl:items-start">
        <div className="flex flex-row justify-between w-full items-center mb-6">
          <div className="flex flex-row space-x-2">
            <Link to="/admin/surveyors">
              <h2 className="text-gray-100 hover:text-orange-400">Surveyors</h2>
            </Link>
            <label
              className="text-xl text-gray-400 cursor-pointer hover:text-white"
              htmlFor="add-surveyors-modal"
            >
              +
            </label>
          </div>
          {userSurveyors && userSurveyors.length > 3 && (
            <Link to="/admin/surveyors" className="hover:hover:text-orange-400">
              Show all
            </Link>
          )}
        </div>

        <SurveyorTable surveyors={userSurveyors.slice(0, 3)} preview />
      </div>
    </div>
  );
}
