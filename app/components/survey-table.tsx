import { Link } from "@remix-run/react";
import { AdminAvatars } from "./admin-avatars";
import { SurveyAdminManager } from "./survey-admin-manager";

export function SurveyTable({ surveys, adminData }) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Managed By</th>
            <th>Assigned Layer</th>
            <th>Assignments</th>
          </tr>
        </thead>
        <tbody>
          {surveys.map((survey, i) => (
            <tr key={i} className="hover">
              <td>
                <Link to={`/admin/surveys/${survey.id}`}>Edit</Link>
              </td>
              <td>{survey.name}</td>
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
                <AdminAvatars admins={survey.admins} id={survey.id} />
              </td>
              <td>{survey.layers.map((l) => l.name).join(", ")}</td>
              <td>
                {survey.assignments.filter((a) => a.completed).length} /
                {" " + survey._count.assignments} completed
              </td>
              <input
                type="checkbox"
                id={`add-admins-modal-${survey.id}`}
                className="modal-toggle"
              />
              <label
                htmlFor={`add-admins-modal-${survey.id}`}
                className="modal cursor-pointer"
              >
                <label className="modal-box relative" for="">
                  <SurveyAdminManager admins={adminData} survey={survey} />
                </label>
              </label>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
