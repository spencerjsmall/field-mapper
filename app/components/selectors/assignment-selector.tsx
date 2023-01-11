import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import _ from "lodash";
import clsx from "clsx";

export function AssignmentSelect({ layer, features, surveys, surveyors }) {
  const incomplete = features.filter(
    (f) => !f.assignment || !f.assignment.completed
  );
  const fetcher = useFetcher();

  const [formData, setFormData] = useState({
    label: "",
    assigneeId: "",
    surveyId: "",
  });

  const handleInputChange = (event: React.ChangeEvent, field: string) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  const handleSubmit = (featureIds: Array<Number>) => {
    fetcher.submit(
      { ...formData, featureIds: JSON.stringify(featureIds) },
      {
        method: "post",
        action: "/actions/assignment-create",
      }
    );
  };

  return (
    <div className="max-h-full h-full max-w-md w-screen border-l border-slate-400 bg-ggp bg-blend-multiply bg-slate-800 bg-center p-4">
      {features && features.length > 0 ? (
        <ul className="justify-center items-center w-full flex flex-col space-y-2">
          {incomplete && incomplete.length > 1 && (
            <li key={0} className="w-full">
              <div
                tabIndex={0}
                className="collapse collapse-arrow border w-full border-slate-700 bg-black rounded-box"
              >
                <input type="checkbox" />
                <div className="collapse-title text-center font-sans text-white text-xl font-medium">
                  Update {incomplete.length} records
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
                            className="select select-sm w-full bg-black"
                            onChange={(e) => handleInputChange(e, "assigneeId")}
                          >
                            <option
                              selected={
                                !incomplete.every(
                                  (f) =>
                                    f.assignment &&
                                    incomplete[0].assignment &&
                                    f.assignment.assigneeId ==
                                      incomplete[0].assignment.assigneeId
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
                                  selected={incomplete.every(
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
                            className="select select-sm w-full bg-black"
                            onChange={(e) => handleInputChange(e, "surveyId")}
                          >
                            <option
                              selected={
                                !incomplete.every(
                                  (f) =>
                                    f.assignment &&
                                    incomplete[0].assignment &&
                                    f.assignment.surveyId ==
                                      incomplete[0].assignment.surveyId
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
                                    incomplete.every(
                                      (f) =>
                                        f.assignment &&
                                        f.assignment.surveyId == survey.id
                                    ) ||
                                    incomplete.every(
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
                      <button
                        onClick={() =>
                          handleSubmit(incomplete.map((f) => f.id))
                        }
                        className="btn w-full mt-4"
                      >
                        Save Assignments
                      </button>
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
                className={clsx(
                  "collapse collapse-arrow border rounded-box w-full",
                  {
                    "bg-green-900 border-green-800":
                      feature.assignment && feature.assignment.completed,
                    "border-slate-700 bg-slate-800":
                      !feature.assignment || !feature.assignment.completed,
                  }
                )}
              >
                <input type="checkbox" />
                <div className="collapse-title font-sans text-center text-xl text-white font-medium w-full">
                  {fetcher.type === "done" &&
                  fetcher.data.ids.includes(feature.id) &&
                  fetcher.data.label
                    ? fetcher.data.label
                    : feature.label
                    ? feature.label
                    : `Record #${feature.id}`}
                </div>
                <div className="collapse-content w-full">
                  <div className="w-full overflow-x-auto">
                    <table className="table drop-shadow-md table-compact w-full">
                      <tbody>
                        <tr>
                          <th
                            className={
                              feature.assignment && feature.assignment.completed
                                ? "bg-green-900 text-gray-300"
                                : "bg-slate-800"
                            }
                          >
                            Assignment
                          </th>
                          <th
                            className={
                              feature.assignment && feature.assignment.completed
                                ? "bg-green-900"
                                : "bg-slate-800"
                            }
                          ></th>
                        </tr>
                        {feature.assignment && feature.assignment.completed ? (
                          <>
                            <tr>
                              <th className="bg-gray-800 text-gray-300">
                                Surveyor
                              </th>
                              <th className="bg-gray-900 text-gray-300">
                                {feature.assignment.assignee
                                  ? `${feature.assignment.assignee.user.firstName} ${feature.assignment.assignee.user.lastName}`
                                  : "None"}
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-gray-800 text-gray-300">
                                Survey
                              </th>
                              <th className="bg-gray-900 text-gray-300">
                                {
                                  surveys.filter(
                                    (s) => s.id == feature.assignment.surveyId
                                  )[0].name
                                }
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-gray-800 text-gray-300">
                                Completed
                              </th>
                              <th className="bg-gray-900 text-gray-300">
                                {new Date(
                                  feature.assignment.completedAt
                                ).toDateString()}
                              </th>
                            </tr>

                            {feature.assignment.notes && (
                              <tr>
                                <th className="bg-gray-800 text-gray-300">
                                  Notes
                                </th>
                                <th className="bg-gray-900 text-gray-300">
                                  {feature.assignment.notes}
                                </th>
                              </tr>
                            )}

                            {feature.assignment.results ? (
                              <>
                                <tr>
                                  <th className="bg-green-900 text-gray-300">
                                    Results
                                  </th>
                                  <th className="bg-green-900"></th>
                                </tr>
                                {Object.entries(feature.assignment.results).map(
                                  ([key, value], i) => (
                                    <tr key={i}>
                                      <th
                                        className="bg-gray-800 text-gray-300"
                                        key={i}
                                      >
                                        {key}
                                      </th>
                                      <th
                                        className="bg-gray-900 text-gray-300"
                                        key={i}
                                      >
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
                                  className="select select-sm w-full bg-slate-800"
                                  onChange={(e) =>
                                    handleInputChange(e, "assigneeId")
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
                                  className="select select-sm w-full bg-slate-800"
                                  onChange={(e) =>
                                    handleInputChange(e, "surveyId")
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
                            <tr>
                              <th className="bg-slate-600">Label</th>
                              <th className="bg-slate-700">
                                <input
                                  type="text"
                                  onChange={(e) =>
                                    handleInputChange(e, "label")
                                  }
                                  placeholder="Add a label name"
                                  value={
                                    formData.label
                                      ? formData.label
                                      : feature.label
                                      ? feature.label
                                      : undefined
                                  }
                                  className="input bg-slate-800 w-full h-fit text-sm p-2"
                                />
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-slate-800"></th>
                              <th className="bg-slate-800 flex">
                                <button
                                  onClick={() => handleSubmit([feature.id])}
                                  className="btn w-fit mt-2 ml-auto"
                                >
                                  Save Assignment
                                </button>
                              </th>
                            </tr>
                          </>
                        )}
                        {Object.keys(feature.geojson.properties).length > 0 ? (
                          <>
                            <tr>
                              <th
                                className={
                                  feature.assignment &&
                                  feature.assignment.completed
                                    ? "bg-green-900 text-gray-300"
                                    : "bg-slate-800"
                                }
                              >
                                Feature
                              </th>
                              <th
                                className={
                                  feature.assignment &&
                                  feature.assignment.completed
                                    ? "bg-green-900 text-gray-300"
                                    : "bg-slate-800"
                                }
                              ></th>
                            </tr>
                            {Object.entries(feature.geojson.properties).map(
                              ([key, value], i) => (
                                <tr key={i}>
                                  <th
                                    className={
                                      feature.assignment &&
                                      feature.assignment.completed
                                        ? "bg-gray-800 text-gray-300"
                                        : "bg-slate-600"
                                    }
                                    key={i}
                                  >
                                    {key}
                                  </th>
                                  <th
                                    className={
                                      feature.assignment &&
                                      feature.assignment.completed
                                        ? "bg-gray-900 text-gray-300"
                                        : "bg-slate-700"
                                    }
                                    key={i}
                                  >
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
