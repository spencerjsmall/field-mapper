import { useFetcher } from "@remix-run/react";
import JSONPretty from "react-json-pretty";
import _ from "lodash";
import clsx from "clsx";

export function AssignmentSelect({ layer, features, surveys, surveyors }) {
  const fetcher = useFetcher();
  return (
    <div className="h-full bg-ggp bg-blend-multiply bg-gray-800 bg-center p-4">
      {features && features.length > 0 ? (
        <ul className="justify-center items-center w-full flex flex-col space-y-2">
          {features.length > 1 && (
            <li key={0} className="w-full">
              <div
                tabIndex={0}
                className="collapse collapse-arrow border w-full border-base-300 bg-black rounded-box"
              >
                <input type="checkbox" />
                <div className="collapse-title text-center font-sans text-white text-xl font-medium">
                  Update {features.length} records
                </div>
                <div className="collapse-content text-gray-200 w-full">
                  <fetcher.Form
                    method="post"
                    className="flex flex-col items-center"
                    action="/actions/assignment-create"
                  >
                    <input
                      type="hidden"
                      name="featureIds"
                      value={features.map((f) => f.id)}
                    />
                    <h3>Assigned to:</h3>
                    <select
                      name="assigneeId"
                      className="select select-sm w-fit bg-gray-700"
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
                        disabled
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
                            {surveyor.user.firstName} {surveyor.user.lastName}
                          </option>
                        ))}
                    </select>
                    <h3>Attached Survey:</h3>
                    <select
                      name="surveyId"
                      className="select select-sm w-fit bg-gray-700"
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
                        disabled
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
                    <button
                      type="submit"
                      name="actionId"
                      value="upsert"
                      className={clsx(
                        "rounded-xl mt-6 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1",
                        {
                          "btn-success bg-green-500":
                            fetcher.type === "done" &&
                            _.isEmpty(
                              _.xor(
                                fetcher.data.ids,
                                features.map((f) => f.id)
                              )
                            ) &&
                            fetcher.data.ok,
                        }
                      )}
                    >
                      {fetcher.type === "done" &&
                      _.isEmpty(
                        _.xor(
                          fetcher.data.ids,
                          features.map((f) => f.id)
                        )
                      ) &&
                      fetcher.data.ok
                        ? "Assignment Successful"
                        : "Assign"}
                    </button>
                  </fetcher.Form>
                </div>
              </div>
            </li>
          )}
          {features.map((feature) => (
            <li key={feature.id} className="w-full">
              <div
                tabIndex={feature.id}
                className="collapse collapse-arrow border border-base-300 bg-gray-800 rounded-box w-full"
              >
                <input type="checkbox" />
                <div className="collapse-title font-sans text-center text-xl text-white font-medium w-full">
                  {layer.labelField &&
                  feature.geojson.properties[layer.labelField] !== undefined
                    ? `${feature.geojson.properties[layer.labelField]}`
                    : `Record #${feature.id}`}
                </div>
                <div className="collapse-content w-full">
                  <fetcher.Form
                    method="post"
                    className="flex flex-col w-full items-center"
                    action="/actions/assignment-create"
                  >
                    <input
                      type="hidden"
                      name="featureIds"
                      value={[feature.id]}
                    />
                    <h3>Assigned to:</h3>
                    <select
                      name="assigneeId"
                      className="select select-sm w-fit bg-gray-200"
                    >
                      <option
                        selected={
                          !(
                            (fetcher.type === "done" &&
                              fetcher.data.ids.includes(feature.id)) ||
                            (feature.assignment &&
                              feature.assignment.assigneeId)
                          )
                        }
                        disabled
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
                              fetcher.data.ids.includes(feature.id)
                                ? fetcher.data.assigneeId == surveyor.id
                                : feature.assignment
                                ? feature.assignment.assigneeId == surveyor.id
                                : false
                            }
                            value={surveyor.id}
                          >
                            {surveyor.user.firstName} {surveyor.user.lastName}
                          </option>
                        ))}
                    </select>
                    <h3>Attached Survey:</h3>
                    <select name="surveyId" className="select select-sm w-fit bg-gray-200">
                      <option
                        selected={
                          !(
                            (fetcher.type === "done" &&
                              fetcher.data.ids.includes(feature.id)) ||
                            feature.assignment
                          )
                        }
                        disabled
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
                              fetcher.data.ids.includes(feature.id)
                                ? fetcher.data.surveyId == survey.id
                                : feature.assignment
                                ? feature.assignment.surveyId == survey.id
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

                    <button
                      type="submit"
                      name="actionId"
                      value={feature.assignment?.surveyId ? "update" : "create"}
                      className={clsx(
                        "rounded-xl mt-6 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1",
                        {
                          "btn-success bg-green-500":
                            fetcher.type === "done" &&
                            fetcher.data.ids.includes(feature.id) &&
                            fetcher.data.ok,
                        }
                      )}
                    >
                      {fetcher.type === "done" &&
                      fetcher.data.ids.includes(feature.id) &&
                      fetcher.data.ok
                        ? "Assignment Succesful"
                        : "Assign"}
                    </button>
                  </fetcher.Form>

                  <h3 className="text-white my-2">Details:</h3>
                  <div className="overflow-x-scroll">
                    <JSONPretty
                      style={{ fontSize: "0.9em" }}
                      data={feature.geojson.properties}
                    ></JSONPretty>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col w-full">
          <h2 className="text-white text-2xl">No selected records</h2>
        </div>
      )}
    </div>
  );
}
