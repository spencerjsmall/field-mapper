import { prisma } from "~/utils/db.server";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  requireUserId,
  getUserSession,
  commitSession,
} from "~/utils/auth.server";
import { SurveyTable } from "~/components/tables/survey-table";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const userSurveys = await prisma.survey.findMany({
    where: {
      admins: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      layers: true,
      admins: {
        include: {
          user: true,
        },
      },
      assignments: true,
      _count: {
        select: {
          assignments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const allAdmins = await prisma.admin.findMany({
    include: { user: true },
  });
  const adminData = allAdmins.map((a) => ({
    key: a.id,
    value: `${a.user.firstName} ${a.user.lastName}`,
  }));

  return { userSurveys, adminData };
};

export default function Surveys() {
  const { userSurveys, adminData } = useLoaderData();
  return (
    <div className="flex mx-auto flex-col items-center pt-32 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Surveys</h1>
        <Link to="new">
          <button className="btn w-36 ">New Survey</button>
        </Link>
      </div>
      {userSurveys && userSurveys.length > 0 ? (
        <SurveyTable surveys={userSurveys} adminData={adminData} />
      ) : (
        <h2>No Surveys</h2>
      )}
    </div>
  );
}
