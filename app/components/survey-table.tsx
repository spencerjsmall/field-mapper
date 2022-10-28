import { Link } from "@remix-run/react";

export function SurveyTable({ surveys }) {
  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Created</th>
            <th>Updated</th>
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
              <td>{survey.layers.map((l) => l.name).join(", ")}</td>
              <td>
                {survey.assignments.filter((a) => a.completed).length} /
                {" " + survey._count.assignments} completed
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
