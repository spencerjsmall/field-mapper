import { Link, useOutletContext } from "@remix-run/react";
import { SurveyTable } from "~/components/tables/survey-table";

export default function Surveys() {
  const { userSurveys, allAdmins } = useOutletContext();
  console.log(allAdmins);
  const adminData = allAdmins.map((a) => ({
    key: a.id,
    value: `${a.user.firstName} ${a.user.lastName}`,
  }));
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
