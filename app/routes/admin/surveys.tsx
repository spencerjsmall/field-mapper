import { prisma } from "~/utils/db.server";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  requireUserId,
  getUserSession,
  commitSession,
} from "~/utils/auth.server";
import { SurveyTable } from "~/components/survey-table";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userSurveys = await prisma.survey.findMany({
    where: {
      creatorId: userId,
    },
    include: {
      layers: true,
      assignments: true,
      _count: {
        select: {
          assignments: true,
        },
      },
    },
  });

  return { userSurveys };
};

export default function Surveys() {
  const { userSurveys } = useLoaderData();
  return (
    <div className="flex mx-auto flex-col items-center pt-32 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Surveys</h1>
        <Link to="new">
          <button className="btn w-36 ">New Survey</button>
        </Link>
      </div>
      {userSurveys && userSurveys.length > 0 ? (
        <SurveyTable surveys={userSurveys} />
      ) : (
        <h2>No Surveys</h2>
      )}
    </div>
  );
}
