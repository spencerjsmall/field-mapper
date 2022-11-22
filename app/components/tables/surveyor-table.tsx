import { AiFillCloseCircle } from "react-icons/ai";
import { AdminAvatars } from "../admin-avatars";

export function SurveyorTable({ surveyors, admin, preview = false }) {
  return (
    <div className="overflow-hidden drop-shadow-lg border border-slate-700 rounded-lg">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            {!preview && <th>Managed By</th>}
            <th>Assignments</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {surveyors.map((surveyor, i) => (
            <tr key={i} className="hover">
              <td>
                {surveyor.user.firstName} {surveyor.user.lastName}
              </td>
              <td>{surveyor.user.email}</td>
              {!preview && (
                <td>
                  <AdminAvatars admins={surveyor.admins} id={surveyor.id} />
                </td>
              )}
              <td>
                {surveyor.assignments.filter((a) => a.completed).length} /{" "}
                {surveyor.assignments.length} completed
              </td>
              <td>
                <form action="/actions/remove-surveyor" method="post">
                  <input
                    type="text"
                    name="surveyorId"
                    value={String(surveyor.id)}
                    className="hidden"
                    readOnly
                  />
                  <input
                    type="text"
                    name="adminId"
                    value={String(admin.id)}
                    className="hidden"
                    readOnly
                  />
                  <button type="submit">
                    <div
                      data-tip="Remove"
                      className="tooltip tooltip-bottom text-slate-500 hover:text-white text-lg z-50"
                    >
                      <AiFillCloseCircle />
                    </div>
                  </button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
