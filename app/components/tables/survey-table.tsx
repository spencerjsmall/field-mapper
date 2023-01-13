import { Link } from "@remix-run/react";
import { BsTrash } from "react-icons/bs";
import { Avatars } from "../avatars";

export function SurveyTable({ surveys, preview = false }) {
  return (
    <div className="drop-shadow-lg overflow-x-hidden overflow-y-hidden border border-slate-700 rounded-lg">
      <table className="table w-full">
        <thead>
          <tr>
            {!preview && <th></th>}
            <th>Name</th>
            {!preview && (
              <>
                <th>Created</th>
                <th>Updated</th>
                <th>Managed By</th>
              </>
            )}
            <th>Assigned In</th>
            {!preview && <th></th>}
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey, i) => (
            <tr key={i} className="hover">
              {!preview && (
                <td>
                  <Link
                    className="text-slate-600 hover:text-slate-100"
                    to={`/admin/surveys/${survey.id}`}
                  >
                    Edit
                  </Link>
                </td>
              )}
              <td>
                <Link
                  className="hover:text-orange-400"
                  to={`/admin/surveys/${String(survey.id)}`}
                >
                  {survey.name}
                </Link>
              </td>
              {!preview && (
                <>
                  <td>{new Date(survey.createdAt).toDateString()}</td>
                  <td>
                    {new Date(survey.createdAt).toString() ===
                    new Date(survey.updatedAt).toString()
                      ? null
                      : new Date(survey.updatedAt)
                          .toString()
                          .split(" ")
                          .slice(0, 5)
                          .join(" ")}
                  </td>
                  <td>
                    <Link to={`/admin/surveys/${survey.id}/admins`}>
                      <Avatars profiles={survey.admins} add />
                    </Link>
                  </td>
                </>
              )}
              <td>{survey.layers.map((l) => l.name).join(", ")}</td>
              {!preview && (
                <td>
                  <div
                    data-tip="Delete"
                    className="tooltip tooltip-bottom z-50"
                  >
                    <Link
                      className="cursor-pointer text-slate-600 hover:text-slate-100 text-xl"
                      to={`/admin/surveys/${survey.id}/delete`}
                    >
                      <BsTrash />
                    </Link>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
