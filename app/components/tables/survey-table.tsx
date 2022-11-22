import { Link } from "@remix-run/react";
import { BsTrash } from "react-icons/bs";
import { AdminAvatars } from "../admin-avatars";

export function SurveyTable({ surveys, preview = false }) {
  return (
    <div className="overflow-x-auto drop-shadow-lg border border-slate-700 rounded-lg">
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
            <th>Assignments</th>
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
              <td>{survey.name}</td>
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
                      <AdminAvatars
                        admins={survey.admins}
                        id={survey.id}
                        addAdmins
                      />
                    </Link>
                  </td>
                </>
              )}
              <td>{survey.layers.map((l) => l.name).join(", ")}</td>
              <td>
                {survey.assignments.filter((a) => a.completed).length} /
                {" " + survey._count.assignments} completed
              </td>
              {!preview && (
                <td>
                  <div
                    data-tip="Delete"
                    className="tooltip tooltip-bottom z-50"
                  >
                    <Link
                      className="cursor-pointer hover:text-white text-xl"
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
