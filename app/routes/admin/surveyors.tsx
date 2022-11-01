import { prisma } from "~/utils/db.server";
import { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserId } from "~/utils/auth.server";
import { SurveyorTable } from "~/components/tables/surveyor-table";
import { SurveyorAdminManager } from "~/components/modals/surveyor-admin-manager";

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const admin = await prisma.admin.findUniqueOrThrow({
    where: {
      userId: userId,
    },
  });
  const adminId = admin.id;
  const userSurveyors = await prisma.surveyor.findMany({
    where: {
      admins: {
        some: {
          id: adminId,
        },
      },
    },
    include: {
      user: true,
      admins: {
        include: {
          user: true,
        },
      },
      assignments: true,
    },
    orderBy: {
      user: { createdAt: "desc" },
    },
  });

  const allSurveyors = await prisma.surveyor.findMany({
    include: { user: true },
  });
  const allSurveyorData = allSurveyors.map((s) => ({
    key: s.id,
    value: `${s.user.firstName} ${s.user.lastName}`,
  }));

  return { userSurveyors, allSurveyorData, adminId };
};

export default function Surveyors() {
  const { userSurveyors, allSurveyorData, adminId } = useLoaderData();
  return (
    <div className="flex mx-auto flex-col items-center pt-32 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Surveyors</h1>
        <label htmlFor="add-surveyors-modal" className="btn w-36 modal-button">
          Add Surveyors
        </label>
      </div>
      {userSurveyors && userSurveyors.length > 0 ? (
        <SurveyorTable surveyors={userSurveyors} />
      ) : (
        <h2>No Surveyors</h2>
      )}
      <input
        type="checkbox"
        id="add-surveyors-modal"
        className="modal-toggle"
      />
      <div className="modal">
        <div className="modal-box relative p-8 bg-black">
          <SurveyorAdminManager
            userSurveyors={userSurveyors}
            allSurveyorData={allSurveyorData}
            adminId={adminId}
          />
        </div>
      </div>
    </div>
  );
}
