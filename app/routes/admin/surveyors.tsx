import { useOutletContext } from "@remix-run/react";
import { SurveyorTable } from "~/components/tables/surveyor-table";
import { SurveyorAdminManager } from "~/components/modals/surveyor-admin-manager";

export default function Surveyors() {
  const { userSurveyors } = useOutletContext();  
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
    </div>
  );
}
