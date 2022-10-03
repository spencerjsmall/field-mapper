// app/components/image-uploader.tsx

import React, { useRef, useState } from "react";
import { Form } from "@remix-run/react";

export const LayerUploader = () => {
  const [draggingOver, setDraggingOver] = useState(false);
  const [formData, setFormData] = useState({
    layerId: "",
    name: "",
    field: "",
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef(null);

  // 1
  const preventDefaults = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 2
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    preventDefaults(e);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // 3
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      handleFileUpload(event.currentTarget.files[0]);
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  const handleFileUpload = async (file: File) => {
    let inputFormData = new FormData();
    inputFormData.append("layer", file);
    const response = await fetch("/layer", {
      method: "POST",
      body: inputFormData,
    });
    const layerId = await response.json();    
    setFormData((form) => ({
      ...form,
      layerId: JSON.parse(layerId),
    }));
  };

  // 4
  return (
    <Form method="post">
      <div
        ref={dropRef}
        className={`${
          draggingOver
            ? "border-4 border-dashed border-yellow-300 border-rounded"
            : ""
        } group rounded-full relative w-24 h-24 flex justify-center items-center bg-gray-400 transition duration-300 ease-in-out hover:bg-gray-500 cursor-pointer`}
        onDragEnter={() => setDraggingOver(true)}
        onDragLeave={() => setDraggingOver(false)}
        onDrag={preventDefaults}
        onDragStart={preventDefaults}
        onDragEnd={preventDefaults}
        onDragOver={preventDefaults}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {
          <p className="font-extrabold text-4xl text-gray-200 cursor-pointer select-none transition duration-300 ease-in-out group-hover:opacity-0 pointer-events-none z-10">
            +
          </p>
        }
        <input
          type="file"
          onChange={handleChange}
          ref={fileInputRef}
          className="hidden"
        />
      </div>
      <input
        type="text"
        name="layerId"
        value={formData.layerId}
        className="hidden"
        readOnly
      />
      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={(e) => handleInputChange(e, "name")}
        required
      />
      <input
        type="text"
        name="field"
        value={formData.field}
        onChange={(e) => handleInputChange(e, "field")}
      />
      <button
        type="submit"
        className="rounded-xl mt-2 bg-blue-400 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-blue-500 hover:-translate-y-1"
      >
        Upload layer
      </button>
    </Form>
  );
};
