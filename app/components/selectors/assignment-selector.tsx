import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import _ from "lodash";
import clsx from "clsx";

export function AssignmentSelect({ layer, features, surveyors }) {
  const incomplete = features.filter(
    (f) => !f.assignment || !f.assignment.completed
  );
  const fetcher = useFetcher();

  const [formData, setFormData] = useState({
    label: "",
    assigneeId: "",
    mandatory: "True",
  });

  const handleInputChange = (value: any, field: string) => {
    setFormData((form) => ({ ...form, [field]: value }));
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
    <div className="max-h-full h-full max-w-lg w-screen border-l border-slate-400 bg-ggp bg-blend-multiply bg-slate-800 bg-center p-4">
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
                            onChange={(e) =>
                              handleInputChange(e.target.value, "assigneeId")
                            }
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
                        <th>Mandatory</th>
                        <th>
                          <select
                            className="select select-sm w-full bg-black"
                            onChange={(e) =>
                              handleInputChange(e.target.value, "mandatory")
                            }
                          >
                            <option selected disabled>
                              Mixed
                            </option>
                            <option
                              selected={incomplete.every(
                                (f) =>
                                  (f.assignment && f.assignment.mandatory) ||
                                  !f.assignment
                              )}
                            >
                              True
                            </option>
                            <option
                              selected={incomplete.every(
                                (f) => f.assignment && !f.assignment.mandatory
                              )}
                            >
                              False
                            </option>
                          </select>
                        </th>
                      </tr>
                      <tr>
                        <th className="bg-black"></th>
                        <th className="bg-black flex">
                          <div
                            className={clsx("tooltip-top uppercase ml-auto", {
                              tooltip: !layer.surveyId,
                            })}
                            data-tip="Layer has no survey"
                          >
                            <button
                              onClick={() =>
                                handleSubmit(incomplete.map((f) => f.id))
                              }
                              className={clsx("btn w-fit mt-2", {
                                "btn-success":
                                  fetcher.type === "done" &&
                                  _.isEmpty(
                                    _.xor(
                                      fetcher.data.ids,
                                      incomplete.map((f) => f.id)
                                    )
                                  ),
                              })}
                              disabled={!layer.surveyId}
                            >
                              {fetcher.type === "done" &&
                              _.isEmpty(
                                _.xor(
                                  fetcher.data.ids,
                                  incomplete.map((f) => f.id)
                                )
                              )
                                ? "Assigned"
                                : "Save Assignments"}
                            </button>
                          </div>
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
                              <th className="bg-gray-800 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll">
                                Surveyor
                              </th>
                              <th className="bg-gray-900 text-gray-300 max-w-[300px] w-[300px] whitespace-normal overflow-x-scroll">
                                {feature.assignment.assignee
                                  ? `${feature.assignment.assignee.user.firstName} ${feature.assignment.assignee.user.lastName}`
                                  : "None"}
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-gray-800 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll">
                                Completed
                              </th>
                              <th className="bg-gray-900 text-gray-300 max-w-[300px] w-[300px] whitespace-normal overflow-x-scroll">
                                {new Date(
                                  feature.assignment.completedAt
                                ).toDateString()}
                              </th>
                            </tr>

                            {feature.assignment.notes && (
                              <tr>
                                <th className="bg-gray-800 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll">
                                  Notes
                                </th>
                                <th className="bg-gray-900 text-gray-300 max-w-[300px] w-[300px] whitespace-normal overflow-x-scroll">
                                  {feature.assignment.notes}
                                </th>
                              </tr>
                            )}

                            {feature.assignment.results ? (
                              <>
                                <tr>
                                  <th className="bg-green-900 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll">
                                    Results
                                  </th>
                                  <th className="bg-green-900 max-w-[300px] w-[300px] whitespace-normal overflow-x-scroll"></th>
                                </tr>
                                {Object.entries(feature.assignment.results).map(
                                  ([key, value], i) => (
                                    <tr key={i}>
                                      <th
                                        className="bg-gray-800 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll"
                                        key={i}
                                      >
                                        {key}
                                      </th>
                                      <th
                                        className="bg-gray-900 text-gray-300 max-w-[300px] w-[300px] whitespace-normal overflow-x-scroll"
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
                              <th className="bg-slate-600 max-w-[145px] w-[145px] overflow-x-scroll">
                                Surveyor
                              </th>
                              <th className="bg-slate-700">
                                <select
                                  className="select select-sm w-full bg-slate-800"
                                  onChange={(e) =>
                                    handleInputChange(
                                      e.target.value,
                                      "assigneeId"
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
                              <th className="bg-slate-600 max-w-[145px] w-[145px] overflow-x-scroll">
                                Label
                              </th>
                              <th className="bg-slate-700">
                                <input
                                  type="text"
                                  onChange={(e) =>
                                    handleInputChange(e.target.value, "label")
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
                              <th className="bg-slate-600 max-w-[145px] w-[145px] overflow-x-scroll">
                                Mandatory
                              </th>
                              <th className="bg-slate-700">
                                <select
                                  className="select select-sm w-full bg-slate-800"
                                  onChange={(e) =>
                                    handleInputChange(
                                      e.target.value,
                                      "mandatory"
                                    )
                                  }
                                >
                                  <option selected>True</option>
                                  <option>False</option>
                                </select>
                              </th>
                            </tr>
                            <tr>
                              <th className="bg-slate-800 max-w-[145px] w-[145px] overflow-x-scroll"></th>
                              <th className="bg-slate-800 flex">
                                <div
                                  className={clsx(
                                    "tooltip-top uppercase ml-auto",
                                    { tooltip: !layer.surveyId }
                                  )}
                                  data-tip="Layer has no survey"
                                >
                                  <button
                                    onClick={() => handleSubmit([feature.id])}
                                    className={clsx("btn w-fit mt-2", {
                                      "btn-success":
                                        fetcher.type === "done" &&
                                        fetcher.data.ids.includes(feature.id),
                                    })}
                                    disabled={!layer.surveyId}
                                  >
                                    {fetcher.type === "done" &&
                                    fetcher.data.ids.includes(feature.id)
                                      ? "Assigned"
                                      : "Save Assignment"}
                                  </button>
                                </div>
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
                                    ? "bg-green-900 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll"
                                    : "bg-slate-800 max-w-[145px] w-[145px] overflow-x-scroll"
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
                                        ? "bg-gray-800 text-gray-300 max-w-[145px] w-[145px] overflow-x-scroll"
                                        : "bg-slate-600 max-w-[145px] w-[145px] overflow-x-scroll"
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
                                        : "bg-slate-700 max-w-[300px] w-[300px] whitespace-normal overflow-x-scroll"
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
        <div className="invisible max-w-lg w-screen h-full" />
      )}
    </div>
  );
}
