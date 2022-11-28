import React, { useState } from "react";
import { Form, useOutletContext } from "@remix-run/react";
import "@loaders.gl/polyfills";
import { KMLLoader } from "@loaders.gl/kml";
import { GeoJSONLoader } from "@loaders.gl/json/dist/geojson-loader";
import { ShapefileLoader } from "@loaders.gl/shapefile";
import { load, selectLoader } from "@loaders.gl/core";
import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { getUserSession, commitSession } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import type { Prisma } from "@prisma/client";
import { Modal } from "~/components/modal";

export const action: ActionFunction = async ({ request }) => {
  const session = await getUserSession(request);
  const userId = session.get("userId");
  const { features, name, field, surveyId } = Object.fromEntries(
    await request.formData()
  );

  const parsedFeatures =
    String(features) == ""
      ? ""
      : JSON.parse(String(features), (key, value) =>
          typeof value == "string" &&
          value.length == 254 &&
          [...new Set(Array.from(value))].length == 1
            ? ""
            : value
        );

  let layer: Prisma.LayerCreateInput;
  if (parsedFeatures == "") {
    layer = {
      name: String(name),
      admins: { connect: { id: userId } },
      defaultSurvey: surveyId
        ? { connect: { id: parseInt(surveyId) } }
        : undefined,
    };
  } else {
    layer = {
      name: String(name),
      admins: { connect: { id: userId } },
      features: {
        createMany: {
          data: parsedFeatures.map((f) => ({
            ...f,
            label: f.geojson.properties[String(field)],
          })),
        },
      },
      defaultSurvey: surveyId
        ? { connect: { id: parseInt(surveyId) } }
        : undefined,
    };
  }

  await prisma.layer.create({ data: layer });
  return redirect(`/admin/layers`, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function NewLayer() {
  const { userSurveys } = useOutletContext();
  const [formData, setFormData] = useState({
    features: "",
    name: "",
    fileName: "",
  });

  // 3
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files) {
      if (event.currentTarget.files.length > 1) {
        handleShpUpload(Array.from(event.currentTarget.files));
      } else if (event.currentTarget.files[0]) {
        handleFileUpload(event.currentTarget.files[0]);
      }
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  const handleFileUpload = async (file: File) => {
    const loader = await selectLoader(file, [KMLLoader, GeoJSONLoader]);
    const data = await load(file, loader);
    const features = data.features.map((f) => ({ geojson: f }));
    setFormData((form) => ({
      ...form,
      features: JSON.stringify(features),
      fileName: file.name,
    }));
  };

  const handleShpUpload = async (files: File[]) => {
    let shpUrl = "";
    for (const file of files) {
      let inputFormData = new FormData();
      inputFormData.append("file", file);
      const response = await fetch("/actions/file-upload", {
        method: "POST",
        body: inputFormData,
      });

      const layerUrl = await response.json();
      const extension = layerUrl.split(".").pop();
      if (extension == "shp") {
        shpUrl = layerUrl;
      }
    }

    const data = await load(shpUrl, ShapefileLoader);
    const features = data.data.map((f) => ({ geojson: f }));
    setFormData((form) => ({
      ...form,
      features: JSON.stringify(features),
    }));
  };

  // 4
  return (
    <Modal title="New Layer">
      <Form method="post" className="flex flex-col w-10/12 mt-6">
        <input
          type="file"
          onChange={handleFileChange}
          className="file-input file-input-bordered w-full mb-6 mx-auto"
          multiple
        />
        <input
          type="text"
          name="features"
          value={formData.features}
          className="hidden"
          readOnly
        />

        <label className="text-white mb-2 font-space">Layer Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={(e) => handleInputChange(e, "name")}
          className="h-8 mb-8"
          required
        />

        <div className="flex flex-row space-x-2 mb-8 justify-around">
          <div className="flex flex-col space-y-2 justify-start">
            <label className="text-white font-space">Label Field </label>
            <select name="field" className="select w-fit">
              <option disabled selected key={0}>
                Select a label field
              </option>
              {formData.features &&
                formData.features.length > 0 &&
                Object.keys(
                  JSON.parse(formData.features)[0].geojson.properties
                ).map((prop, i) => (
                  <option value={prop} key={i + 1}>
                    {prop}
                  </option>
                ))}
            </select>
          </div>
          <div className="flex flex-col space-y-2 justify-start">
            <label className="text-white font-space">Survey </label>
            <select name="surveyId" className="select w-fit">
              <option disabled selected key={0}>
                {userSurveys && userSurveys.length > 0
                  ? "Select a survey"
                  : "None"}
              </option>
              {userSurveys &&
                userSurveys.length > 0 &&
                userSurveys.map((survey, i) => (
                  <option value={survey.id} key={i + 1}>
                    {survey.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-xl font-space bg-black border border-slate-600 px-3 py-4 text-white transition duration-300 ease-in-out hover:bg-red-500 hover:-translate-y-1"
        >
          {formData.features == "" ? "Create Empty Layer" : "Create Layer"}
        </button>
      </Form>
    </Modal>
  );
}
