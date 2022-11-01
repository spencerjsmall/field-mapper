import { useSubmit } from "@remix-run/react";
import ReactSearchBox from "react-search-box";

export function SurveyAdminManager({ admins, survey }) {
  const submit = useSubmit();  
  return (
    <div className="flex flex-col items-center space-y-6">
      <h1>{survey.name} Managers</h1>
      <div className="flex flex-row space-x-4 items-center">
        {survey.admins &&
          survey.admins.map((a, i) => (
            <div
              key={i}
              className="w-fit h-fit py-1 px-3 rounded-2xl bg-black text-white hover:bg-gray-600"
            >
              {a.user.firstName} {a.user.lastName}
            </div>
          ))}
      </div>
      <ReactSearchBox
        placeholder="Add new manager"
        data={admins.filter(
          (a) => !survey.admins.map((a) => a.id).includes(a.key)
        )}
        onSelect={(record: any) =>
          submit(
            { adminId: record.item.key, surveyId: survey.id },
            { method: "post", action: "/actions/add-survey-admin" }
          )
        }
        autoFocus
      />
    </div>
  );
}
