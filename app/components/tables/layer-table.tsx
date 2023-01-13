import { CSVLink } from "react-csv";
import { useEffect, useRef, useState } from "react";
import { BsGlobe, BsTrash } from "react-icons/bs";
import { Link, useFetcher } from "@remix-run/react";
import { Avatars } from "../avatars";

export function LayerTable({ layers, surveys, preview = false }) {
  const [csv, setCSV] = useState({ data: null, headers: [], fileName: "" });
  const [prev, setPrev] = useState(preview);
  const csvLink = useRef(null);
  const fetcher = useFetcher();

  useEffect(() => {
    window.addEventListener("resize", () =>
      setPrev(preview ? true : window.innerWidth < 1024)
    );
  }, []);

  const downloadFile = (data, fileName, fileType) => {
    const file = new Blob([data], {
      type: fileType,
    });

    // anchor link
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = fileName;

    // simulate link click
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const exportToJson = async (layer) => {
    const response = await fetch(`/actions/${layer.id}/geojson`, {
      method: "GET",
    });
    const fc = await response.json();
    const fileName = layer.name.replace(/\s/g, "") + Date.now() + ".geojson";
    downloadFile(JSON.stringify(fc, null, 2), fileName, "application/json");
  };

  const exportToCsv = async (layer) => {
    const response = await fetch(`/actions/${layer.id}/csv`, {
      method: "GET",
    });
    const { cleanJSON, headers } = await response.json();
    console.log(cleanJSON);
    console.log(headers);
    const fileName = layer.name.replace(/\s/g, "") + Date.now() + ".csv";
    setCSV({ data: cleanJSON, headers: headers, fileName: fileName });
    csvLink.current.link.click();
  };

  return (
    <div
      className={`drop-shadow-lg overflow-y-hidden overflow-x-hidden border border-slate-700 rounded-lg`}
    >
      <table className="table w-full">
        <thead>
          <tr>
            {!prev && <th></th>}
            <th>Name</th>
            {!prev && (
              <>
                <th>Created</th>
                {/* <th>Updated</th> */}
                <th>Managed By</th>
              </>
            )}
            <th>Features</th>
            <th>Assignments</th>
            <th>Assigned Survey</th>
            {!prev && (
              <>
                <th>Download</th>
                <th></th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {layers.map((layer, i) => (
            <tr key={i} className="hover overflow-y-hidden">
              {!prev && (
                <td>
                  <div data-tip="Map" className="tooltip tooltip-bottom z-50">
                    <Link
                      className="hover:text-white text-2xl"
                      to={`/admin/layers/${String(layer.id)}`}
                    >
                      <BsGlobe />
                    </Link>
                  </div>
                </td>
              )}

              <td>
                <Link
                  className="hover:text-orange-400"
                  to={`/admin/layers/${String(layer.id)}`}
                >
                  {layer.name}
                </Link>
              </td>
              {!prev && (
                <>
                  <td>{new Date(layer.createdAt).toDateString()}</td>
                  {/* <td>
                    {new Date(layer.createdAt).toString() ===
                    new Date(layer.updatedAt).toString()
                      ? null
                      : new Date(layer.updatedAt)
                          .toString()
                          .split(" ")
                          .slice(0, 5)
                          .join(" ")}
                  </td> */}
                  <td>
                    <Link to={`/admin/layers/${layer.id}/admins`}>
                      <Avatars profiles={layer.admins} add />
                    </Link>
                  </td>
                </>
              )}
              <td>{layer._count.features}</td>
              <td>
                {
                  layer.features.filter(
                    (f) => f.assignment && f.assignment.completed
                  ).length
                }{" "}
                / {layer.features.filter((f) => f.assignment != null).length}{" "}
                completed
              </td>
              <td>
                {surveys && surveys.length > 0 ? (
                  <select
                    onChange={(e) =>
                      fetcher.submit(
                        { surveyId: e.target.value, layerId: layer.id },
                        { method: "post", action: "/admin/layers" }
                      )
                    }
                    className="select select-sm w-fit"
                  >
                    <option selected={!layer.survey} value={undefined}>
                      None
                    </option>
                    {surveys.map((survey, i) => (
                      <option
                        key={i}
                        selected={layer.surveyId == survey.id}
                        value={survey.id}
                      >
                        {survey.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Link
                    className="hover:text-orange-500"
                    to="/admin/surveys/new"
                  >
                    Create a survey
                  </Link>
                )}
              </td>
              {!prev && (
                <>
                  <td>
                    <div className="btn-group">
                      <button
                        onClick={() => exportToJson(layer)}
                        className="btn font-sans btn-xs text-white btn-ghost"
                        id="jsonDownload"
                        value="download"
                      >
                        JSON
                      </button>
                      <button
                        onClick={() => exportToCsv(layer)}
                        className="btn font-sans btn-xs text-white btn-ghost"
                        id="csvDownload"
                        value="download"
                      >
                        CSV
                      </button>
                      {csv.data &&
                        csv.headers.length > 0 &&
                        csv.fileName !== "" && (
                          <CSVLink
                            ref={csvLink}
                            data={csv.data}
                            headers={csv.headers}
                            filename={csv.fileName}
                          />
                        )}
                    </div>
                  </td>
                  <td>
                    <div
                      data-tip="Delete"
                      className="tooltip tooltip-bottom z-50"
                    >
                      <Link
                        className="cursor-pointer text-slate-600 hover:text-slate-100 text-xl"
                        to={`/admin/layers/${layer.id}/delete`}
                      >
                        <BsTrash />
                      </Link>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
