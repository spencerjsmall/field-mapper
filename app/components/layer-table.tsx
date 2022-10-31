import { CSVLink } from "react-csv";
import { useRef, useState } from "react";
import { BsGlobe } from "react-icons/bs";
import { Link, useFetcher } from "@remix-run/react";
import { LayerAdminManager } from "./layer-admin-manager";
import { AdminAvatars } from "./admin-avatars";

export function LayerTable({ layers, surveys, admins }) {
  const [csv, setCSV] = useState({ data: null, fileName: "" });
  const csvLink = useRef(null);
  const fetcher = useFetcher();
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
    const data = await response.json();
    const fileName = layer.name.replace(/\s/g, "") + Date.now() + ".csv";
    setCSV({ data: data, fileName: fileName });
    csvLink.current.link.click();
  };

  return (
    <div className="overflow-x-auto px-8">
      <table className="table w-full">
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Managed By</th>
            <th>Features</th>
            <th>Assignments</th>
            <th>Assigned Survey</th>
            <th>Download</th>
          </tr>
        </thead>
        <tbody>
          {layers.map((layer, i) => (
            <tr key={i} className="hover overflow-y-visible">
              <td>
                <div
                  data-tip="Map Viewer"
                  className="tooltip tooltip-bottom z-50"
                >
                  <Link
                    className="hover:text-white text-2xl"
                    to={String(layer.id)}
                  >
                    <BsGlobe />
                  </Link>
                </div>
              </td>
              <td>{layer.name}</td>
              <td>{new Date(layer.createdAt).toDateString()}</td>
              <td>
                {new Date(layer.createdAt).toString() ===
                new Date(layer.updatedAt).toString()
                  ? null
                  : new Date(layer.updatedAt)
                      .toString()
                      .split(" ")
                      .slice(0, 5)
                      .join(" ")}
              </td>
              <td>
                <AdminAvatars admins={layer.admins} id={layer.id} />
              </td>
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
                        { method: "post" }
                      )
                    }
                    className="select select-sm w-fit"
                  >
                    <option selected={!layer.defaultSurvey} value={undefined}>
                      None
                    </option>
                    {surveys.map((survey, i) => (
                      <option
                        key={i}
                        selected={layer.defaultSurveyId == survey.id}
                        value={survey.id}
                      >
                        {survey.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <Link to="/admin/creator">
                    Create a survey for this layer
                  </Link>
                )}
              </td>
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
                  {csv.data && (
                    <CSVLink
                      ref={csvLink}
                      data={csv.data}
                      filename={csv.fileName}
                      target="_blank"
                    />
                  )}
                </div>
              </td>
              <input
                type="checkbox"
                id={`add-admins-modal-${layer.id}`}
                className="modal-toggle"
              />
              <label
                htmlFor={`add-admins-modal-${layer.id}`}
                className="modal cursor-pointer"
              >
                <label className="modal-box relative" for="">
                  <LayerAdminManager admins={admins} layer={layer} />
                </label>
              </label>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
