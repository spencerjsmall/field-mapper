import { Link, useOutletContext } from "@remix-run/react";
import { useMemo, useState } from "react";
import { Paginate } from "~/components/tables/paginate";
import { SurveyTable } from "~/components/tables/survey-table";

export default function Surveys() {
  const { userSurveys, allAdmins } = useOutletContext();
  const adminData = allAdmins.map((a) => ({
    key: a.id,
    value: `${a.user.firstName} ${a.user.lastName}`,
  }));
  const maxPages = Paginate({ perPage: 5, items: userSurveys }).totalPages;
  const [page, setPage] = useState(1);
  const surveys = useMemo(
    () => Paginate({ page: page, perPage: 5, items: userSurveys }).items,
    [page, userSurveys]
  );
  return (
    <div className="flex mx-auto flex-col items-center pt-24 w-3/4 h-full">
      <div className="flex w-full justify-between">
        <h1 className="text-white text-4xl mb-14">Surveys</h1>
        {maxPages && maxPages > 1 && (
          <div className="btn-group">
            {[...Array(maxPages).keys()].map((i) => (
              <button
                onClick={() => setPage(i + 1)}
                key={i + 1}
                className={`btn ${
                  page == i + 1
                    ? "btn-active bg-slate-600 border-slate-600"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
        <Link to="new">
          <button className="btn w-36 ">New Survey</button>
        </Link>
      </div>
      {userSurveys && userSurveys.length > 0 ? (
        <SurveyTable surveys={surveys} adminData={adminData} />
      ) : (
        <h2>No Surveys</h2>
      )}
    </div>
  );
}
