import { useOutletContext } from "@remix-run/react";
import { SurveyorTable } from "~/components/tables/surveyor-table";
import { SurveyorAdminManager } from "~/components/modals/surveyor-admin-manager";
import { Paginate } from "~/components/tables/paginate";
import { useEffect, useMemo, useState } from "react";

export default function Surveyors() {
  const { userSurveyors } = useOutletContext();
  const [page, setPage] = useState(1);
  const maxPages = Paginate({ perPage: 5, items: userSurveyors }).totalPages;
  const surveyors = useMemo(
    () => Paginate({ page: page, perPage: 5, items: userSurveyors }).items,
    [page, userSurveyors]
  );

  return (
    <div className="flex mx-auto flex-col items-center pt-24 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Surveyors</h1>
        {maxPages && maxPages > 1 && (
          <div className="btn-group">
            {[...Array(maxPages).keys()].map((i) => (
              <button
                onClick={() => setPage(i + 1)}
                key={i + 1}
                className={`btn ${page == i + 1 ? "btn-active bg-slate-600 border-slate-600" : ""}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        <label htmlFor="add-surveyors-modal" className="btn w-36 modal-button">
          Add Surveyors
        </label>
      </div>
      {userSurveyors && userSurveyors.length > 0 ? (
        <SurveyorTable surveyors={surveyors} />
      ) : (
        <h2>No Surveyors</h2>
      )}
    </div>
  );
}
