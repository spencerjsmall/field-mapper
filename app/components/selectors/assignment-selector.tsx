import { useFetcher } from "@remix-run/react";
import _ from "lodash";
import clsx from "clsx";

export function AssignmentSelect({ layer, features, surveys, surveyors }) {
  const fetcher = useFetcher();
  return (
    <div className="max-h-full h-full max-w-md w-screen border-l border-slate-400 bg-ggp bg-blend-multiply bg-slate-800 bg-center p-4">
      {features && features.length > 0 ? (
        <ul className="justify-center items-center w-full flex flex-col space-y-2">
          {features.length > 1 && (
            <li key={0} className="w-full">
              <div
                tabIndex={0}
                className="collapse collapse-arrow border w-full border-slate-700 bg-black rounded-box"
              >
                <input type="checkbox" />
                <div className="collapse-title text-center font-sans text-white text-xl font-medium">
                  Update {features.length} records
                </div>
                <div className="collapse-content text-slate-200 w-full">
                  <table className="table w-full">
                    <tbody>
                      <tr>
                        <th className="bg-black">Assignment</th>
                        <th className="bg-black"></th>
                      </tr>
                      <tr>
                        <th>Surveyor</th>
                        <th>
                          <select
                            name="assigneeId"
                            className="select select-sm w-fit bg-black"
                            onChange={(e) =>
                              fetcher.submit(
                                {
                                  featureIds: JSON.stringify(
                                    features.map((f) => f.id)
                                  ),
                                  assigneeId: e.target.value,
                                },
                                {
                                  method: "post",
                                  action: "/actions/assignment-create",
                                }
                              )
                            }
                          >
                            <option
                              selected={
                                !features.every(
                                  (f) =>
                                    f.assignment &&
                                    features[0].assignment &&
                                    f.assignment.assigneeId ==
                                      features[0].assignment.assigneeId
                                )
                              }
                            >
                              Choose a surveyor
                            </option>
                            {surveyors &&
                              surveyors.length > 0 &&
                              surveyors.map((surveyor, i) => (
                                <option
                                  key={i}
                                  selected={features.every(
                                    (f) =>
                                      f.assignment &&
                                      f.assignment.assigneeId == surveyor.id
                                  )}
                                  value={surveyor.id}
                                >
                                  {surveyor.user.firstName}{" "}
                                  {surveyor.user.lastName}
                                </option>
                              ))}
                          </select>
                        </th>
                      </tr>
                      <tr>
                        <th>Survey</th>
                        <th>
                          <select
                            name="surveyId"
                            className="select select-sm w-fit bg-black"
                            onChange={(e) =>
                              fetcher.submit(
                                {
                                  featureIds: JSON.stringify(
                                    features.map((f) => f.id)
                                  ),
                                  surveyId: e.target.value,
                                },
                                {
                                  method: "post",
                                  action: "/actions/assignment-create",
                                }
                              )
                            }
                          >
                            <option
                              selected={
                                !features.every(
                                  (f) =>
                                    f.assignment &&
                                    features[0].assignment &&
                                    f.assignment.surveyId ==
                                      features[0].assignment.surveyId
                                )
                              }
                            >
                              Choose a survey
                            </option>
                            {surveys &&
                              surveys.length > 0 &&
                              surveys.map((survey, i) => (
                                <option
                                  key={i}
                                  selected={
                                    features.every(
                                      (f) =>
                                        f.assignment &&
                                        f.assignment.surveyId == survey.id
                                    ) ||
                                    features.every(
                                      (f) =>
                                        !f.assignment &&
                                        layer.defaultSurveyId == survey.id
                                    )
                                  }
                                  value={survey.id}
                                >
                                  {survey.name}
                                </option>
                              ))}
                          </select>
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </li>
          )}
          {features.map((feature) => (
            <li key={feature.id} className="w-full">
              <div
                tabIndex={feature.id}
                className="collapse collapse-arrow border border-slate-700 bg-slate-800 rounded-box w-full"
              >
                <input type="checkbox" />
                <div className="collapse-title font-sans text-center text-xl text-white font-medium w-full">
                  {feature.label ? feature.label : `Record #${feature.id}`}
                </div>
                <div className="collapse-content w-full">
                  <div className="w-full overflow-x-auto">
                    <table className="table drop-shadow-md table-compact w-full">
                      <tbody>
                        <tr>
                          <th className="bg-slate-800">Assignment</th>
                          <th className="bg-slate-800"></th>
                        </tr>
                        {feature.assignment && feature.assignment.completed ? (
                          <>
                            <tr>
                              <th className="bg-slate-600">Surveyor</th>
                              <th className="bg-slate-700">
                                {feature.assignment.assignee
                                  ? `${feature.assignment.assignee.user.firstName} ${feature.assignment.assignee.user.lastName}`
                                  : "None"}
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-slate-600">Survey</th>
                              <th className="bg-slate-700">
                                {
                                  surveys.filter(
                                    (s) => s.id == feature.assignment.surveyId
                                  )[0].name
                                }
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-slate-600">Completed</th>
                              <th className="bg-slate-700">
                                {new Date(
                                  feature.assignment.completedAt
                                ).toDateString()}
                              </th>
                            </tr>

                            {feature.assignment.notes && (
                              <tr>
                                <th className="bg-slate-600">Notes</th>
                                <th className="bg-slate-700">
                                  {feature.assignment.notes}
                                </th>
                              </tr>
                            )}

                            {feature.assignment.results ? (
                              <>
                                <tr>
                                  <th className="bg-slate-800">Results</th>
                                  <th className="bg-slate-800"></th>
                                </tr>
                                {Object.entries(feature.assignment.results).map(
                                  ([key, value], i) => (
                                    <tr key={i}>
                                      <th className="bg-slate-600" key={i}>
                                        {key}
                                      </th>
                                      <th className="bg-slate-700" key={i}>
                                        {typeof value == "object"
                                          ? JSON.stringify(value)
                                          : value}
                                      </th>
                                    </tr>
                                  )
                                )}
                              </>
                            ) : (
                              <></>
                            )}
                          </>
                        ) : (
                          <>
                            <tr>
                              <th className="bg-slate-600">Surveyor</th>
                              <th className="bg-slate-700">
                                <select
                                  name="assigneeId"
                                  className="select select-sm w-fit bg-slate-800"
                                  disabled={
                                    feature.assignment &&
                                    feature.assignment.completed
                                  }
                                  onChange={(e) =>
                                    fetcher.submit(
                                      {
                                        featureIds: JSON.stringify([
                                          feature.id,
                                        ]),
                                        assigneeId: e.target.value,
                                      },
                                      {
                                        method: "post",
                                        action: "/actions/assignment-create",
                                      }
                                    )
                                  }
                                >
                                  <option
                                    selected={
                                      !(
                                        (fetcher.type === "done" &&
                                          fetcher.data.assigneeId &&
                                          fetcher.data.ids.includes(
                                            feature.id
                                          )) ||
                                        (feature.assignment &&
                                          feature.assignment.assigneeId)
                                      )
                                    }
                                  >
                                    Choose a surveyor
                                  </option>
                                  {surveyors &&
                                    surveyors.length > 0 &&
                                    surveyors.map((surveyor, i) => (
                                      <option
                                        key={i}
                                        selected={
                                          fetcher.type === "done" &&
                                          fetcher.data.ids.includes(
                                            feature.id
                                          ) &&
                                          fetcher.data.assigneeId
                                            ? fetcher.data.assigneeId ==
                                              surveyor.id
                                            : feature.assignment
                                            ? feature.assignment.assigneeId ==
                                              surveyor.id
                                            : false
                                        }
                                        value={surveyor.id}
                                      >
                                        {surveyor.user.firstName}{" "}
                                        {surveyor.user.lastName}
                                      </option>
                                    ))}
                                </select>
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-slate-600">Survey</th>
                              <th className="bg-slate-700">
                                <select
                                  name="surveyId"
                                  className="select select-sm w-fit bg-slate-800"
                                  disabled={
                                    feature.assignment &&
                                    feature.assignment.completed
                                  }
                                  onChange={(e) =>
                                    fetcher.submit(
                                      {
                                        featureIds: JSON.stringify([
                                          feature.id,
                                        ]),
                                        surveyId: e.target.value,
                                      },
                                      {
                                        method: "post",
                                        action: "/actions/assignment-create",
                                      }
                                    )
                                  }
                                >
                                  <option
                                    selected={
                                      !(
                                        (fetcher.type === "done" &&
                                          fetcher.data.surveyId &&
                                          fetcher.data.ids.includes(
                                            feature.id
                                          )) ||
                                        (feature.assignment &&
                                          feature.assignment.surveyId)
                                      )
                                    }
                                  >
                                    Choose a survey
                                  </option>
                                  {surveys &&
                                    surveys.length > 0 &&
                                    surveys.map((survey, i) => (
                                      <option
                                        key={i}
                                        selected={
                                          fetcher.type === "done" &&
                                          fetcher.data.ids.includes(
                                            feature.id
                                          ) &&
                                          fetcher.data.surveyId
                                            ? fetcher.data.surveyId == survey.id
                                            : feature.assignment
                                            ? feature.assignment.surveyId ==
                                              survey.id
                                            : layer.defaultSurveyId
                                            ? layer.defaultSurveyId == survey.id
                                            : false
                                        }
                                        value={survey.id}
                                      >
                                        {survey.name}
                                      </option>
                                    ))}
                                </select>
                              </th>
                            </tr>
                          </>
                        )}
                        {Object.keys(feature.geojson.properties).length > 0 ? (
                          <>
                            <tr>
                              <th className="bg-slate-800">Feature</th>
                              <th className="bg-slate-800"></th>
                            </tr>
                            {Object.entries(feature.geojson.properties).map(
                              ([key, value], i) => (
                                <tr key={i}>
                                  <th className="bg-slate-600" key={i}>
                                    {key}
                                  </th>
                                  <th className="bg-slate-700" key={i}>
                                    {value}
                                  </th>
                                </tr>
                              )
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="invisible max-w-md w-screen h-full" />
      )}
    </div>
  );
}
