import { useFetcher } from "@remix-run/react";
import JSONPretty from "react-json-pretty";
import _ from "lodash";
import clsx from "clsx";

export function AssignmentSelect({ layer, features }) {
  const fetcher = useFetcher();
  return (
    <div className="h-full p-4">
      {features && features.length > 0 ? (
        <ul className="justify-center items-center w-full flex flex-col space-y-2">
          {features.length > 1 && (
            <li key={0} className="w-full">
              <div
                tabIndex={0}
                className="collapse collapse-arrow border w-full border-base-300 bg-white rounded-box"
              >
                <input type="checkbox" />
                <div className="collapse-title text-center font-sans text-black text-xl font-medium">
                  Update {features.length} records
                </div>
                <div className="collapse-content text-black w-full">
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
                    <h3>Assignee:</h3>
                    <label>
                      <input
                        className="bg-black text-white"
                        type="text"
                        name="assigneeEmail"
                      />
                    </label>
                    <h3>Survey ID:</h3>
                    <label>
                      <input
                        className="bg-black text-white"
                        type="text"
                        name="surveyId"
                        defaultValue={
                          layer.defaultSurveyId
                            ? layer.defaultSurveyId
                            : undefined
                        }
                      />
                    </label>
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
                className="collapse collapse-arrow border border-base-300 bg-black rounded-box w-full"
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
                    <h3>Assignee:</h3>
                    <label>
                      <input
                        type="text"
                        key={
                          fetcher.type === "done"
                            ? "assigneeFetched"
                            : "assigneeReady"
                        }
                        defaultValue={
                          fetcher.type === "done" &&
                          fetcher.data.ids.includes(feature.id)
                            ? fetcher.data.assigneeEmail
                            : feature.assignment?.assignee.email
                        }
                        name="assigneeEmail"
                      />
                    </label>
                    <h3>Survey ID:</h3>
                    <label>
                      <input
                        type="text"
                        key={
                          fetcher.type === "done"
                            ? "surveyUpdated"
                            : "surveyReady"
                        }
                        defaultValue={
                          fetcher.type === "done" &&
                          fetcher.data.ids.includes(feature.id)
                            ? fetcher.data.surveyId
                            : feature.assignment
                            ? feature.assignment.surveyId
                            : layer.defaultSurveyId
                            ? layer.defaultSurveyId
                            : undefined
                        }
                        name="surveyId"
                      />
                    </label>
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
