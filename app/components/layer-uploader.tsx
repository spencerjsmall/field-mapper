// app/components/image-uploader.tsx

import React, { useRef, useState } from "react";
import { Form } from "@remix-run/react";
import { AiOutlineClose } from "react-icons/ai";

import "@loaders.gl/polyfills";
import { KMLLoader } from "@loaders.gl/kml";
import { GeoJSONLoader } from "@loaders.gl/json/dist/geojson-loader";
import { ShapefileLoader } from "@loaders.gl/shapefile";
import { load, selectLoader } from "@loaders.gl/core";

export const LayerUploader = ({ surveys }) => {
  const [draggingOver, setDraggingOver] = useState(false);
  const [formData, setFormData] = useState({
    features: "",
    name: "",
    fileName: "",
  });
  const [emptyLayer, setEmptyLayer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef(null);

  // 1
  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 2
  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

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
      inputFormData.append("layer", file);
      const response = await fetch("/actions/layer-upload", {
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
    <div className="flex flex-col w-full items-center">
      <div className="modal-action absolute top-0 right-5">
        <label htmlFor="my-modal" className="text-xl">
          <AiOutlineClose />
        </label>
      </div>
      <h1>Create Layer</h1>
      <Form
        method="post"
        action="/actions/layer-create"
        className="flex flex-col w-full mt-6 space-y-2"
      >
        <div
          ref={dropRef}
          className={`${
            draggingOver ? "border-4 border-dashed border-yellow-300" : ""
          } group relative w-fit px-4 rounded-2xl mx-auto h-12 flex justify-center items-center bg-black border border-slate-100 transition duration-300 ease-in-out hover:bg-red-500 cursor-pointer`}
          onDragEnter={() => setDraggingOver(true)}
          onDragLeave={() => setDraggingOver(false)}
          onDrag={preventDefaults}
          onDragStart={preventDefaults}
          onDragEnd={preventDefaults}
          onDragOver={preventDefaults}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <p className=" text-gray-200 cursor-pointer select-none transition duration-300 ease-in-out pointer-events-none z-10">
            {formData.features.length > 0 ? formData.fileName : "Choose a file"}
          </p>

          <input
            type="file"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
            multiple
          />
        </div>

        <input
          type="text"
          name="features"
          value={formData.features}
          className="hidden"
          readOnly
        />

        {formData.features.length > 0 || emptyLayer ? (
          <>
            <label className="text-white font-space">Layer Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={(e) => handleInputChange(e, "name")}
              className="h-8"
              required
            />
            <div className="flex flex-row justify-between">
              <div className="flex flex-col justify-start">
                <label className="text-white font-space">Label Field </label>
                <select name="surveyId" className="select w-fit">
                  <option disabled selected key={0}>
                    Select a field for feature labels
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
              <div className="flex flex-col justify-start">
                <label className="text-white font-space">Survey </label>
                <select name="surveyId" className="select w-fit">
                  <option disabled selected key={0}>
                    {surveys && surveys.length > 0
                      ? "Choose a default survey"
                      : "None"}
                  </option>
                  {surveys &&
                    surveys.length > 0 &&
                    surveys.map((survey, i) => (
                      <option value={survey.id} key={i + 1}>
                        {survey.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="modal-action pt-10 w-full">
              <label htmlFor="my-modal" className="mx-auto">
                <button
                  type="submit"
                  className="rounded-xl font-space bg-black border border-white px-3 py-2 text-white transition duration-300 ease-in-out hover:bg-red-500 hover:-translate-y-1"
                >
                  Create Layer
                </button>
              </label>
            </div>
          </>
        ) : (
          <p className='mx-auto'>
            or,{" "}
            <span
              onClick={() => setEmptyLayer(true)}
              className="text-red-500 italic cursor-pointer"
            >
              continue with an empty layer
            </span>
          </p>
        )}
      </Form>
    </div>
  );
};
