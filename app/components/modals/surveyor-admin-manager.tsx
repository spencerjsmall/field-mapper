import { useSubmit } from "@remix-run/react";
import { useState } from "react";
import ReactSearchBox from "react-search-box";
import { FormField } from "../form-field";
import { AiOutlineClose } from "react-icons/ai";

export function SurveyorAdminManager({
  userSurveyors,
  allSurveyorData,
  adminId,
}) {   
  const submit = useSubmit();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setFormData((form) => ({ ...form, [field]: event.target.value }));
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <div className="modal-action absolute top-0 right-5">
        <label htmlFor="add-surveyors-modal" className="text-xl">
          <AiOutlineClose />
        </label>
      </div>
      <h1>Surveyors</h1>
      <div className="flex flex-row space-x-4 items-center">
        {userSurveyors &&
          userSurveyors.map((s, i) => (
            <div
              key={i}
              className="w-fit h-fit py-1 px-3 rounded-2xl bg-black text-white hover:bg-gray-600"
            >
              {s.user.firstName} {s.user.lastName}
            </div>
          ))}
      </div>
      <ReactSearchBox
        placeholder="Add existing surveyors"
        data={allSurveyorData.filter(
          (s) =>
            userSurveyors.length == 0 ||
            !userSurveyors.map((u) => u.id).includes(s.key)
        )}
        onSelect={(record: any) =>
          submit(
            { surveyorId: record.item.key, adminId: adminId },
            { method: "post", action: "/actions/add-surveyor-admin" }
          )
        }
        autoFocus
      />

      <p className="my-8"> or, create a new surveyor</p>

      <form method="POST" action="/actions/surveyor-create">
        <input
          type="text"
          name="adminId"
          value={String(adminId)}
          className="hidden"
          readOnly
        />
        <FormField
          htmlFor="email"
          label="Email"
          value={formData.email}
          onChange={(e) => handleInputChange(e, "email")}
        />
        <FormField
          htmlFor="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={(e) => handleInputChange(e, "password")}
        />
        <FormField
          htmlFor="firstName"
          label="First Name"
          onChange={(e) => handleInputChange(e, "firstName")}
          value={formData.firstName}
        />
        <FormField
          htmlFor="lastName"
          label="Last Name"
          onChange={(e) => handleInputChange(e, "lastName")}
          value={formData.lastName}
        />

        <div className="w-full text-center">
          <button
            type="submit"
            className="rounded-lg mt-2 bg-black px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-red-500 hover:-translate-y-1"
          >
            Create Surveyor
          </button>
        </div>
      </form>
    </div>
  );
}
