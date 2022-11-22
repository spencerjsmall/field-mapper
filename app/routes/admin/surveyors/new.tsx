import { Form, Link, useOutletContext, useSubmit } from "@remix-run/react";
import { useState } from "react";
import ReactSearchBox from "react-search-box";
import { FormField } from "~/components/form-field";
import { AiOutlineClose } from "react-icons/ai";
import { redirect } from "@remix-run/node";
import { prisma } from "~/utils/db.server";

export const action: ActionFunction = async ({ request }) => {
  const { surveyorId, adminId } = Object.fromEntries(await request.formData());
  await prisma.admin.update({
    where: { id: parseInt(adminId) },
    data: { surveyors: { connect: { id: parseInt(surveyorId) } } },
  });
  return redirect(`/admin/surveyors`);
};

export default function NewSurveyor() {
  const { userAdmin, surveyorsData, userSurveyors } = useOutletContext();
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
    <>
      <input
        type="checkbox"
        id="add-surveyors-modal"
        className="modal-toggle"
        checked
      />
      <div className="modal">
        <div className="modal-box flex flex-col items-center relative space-y-6">
          <Link
            to="/admin/surveyors"
            className="text-xl absolute top-5 right-5"
          >
            <AiOutlineClose />
          </Link>

          <h1 className="text-semibold text-white">Surveyors</h1>

          <ReactSearchBox
            placeholder="Add existing surveyors"
            data={surveyorsData.filter(
              (s) =>
                userSurveyors.length == 0 ||
                !userSurveyors.map((u) => u.id).includes(s.key)
            )}
            onSelect={(record: any) =>
              submit(
                { surveyorId: record.item.key, adminId: userAdmin.id },
                { method: "post" }
              )
            }
            autoFocus
          />

          <p className="my-8"> or, create a new surveyor</p>

          <Form method="post" action="/actions/surveyor-create">
            <input
              type="text"
              name="adminId"
              value={String(userAdmin.id)}
              className="hidden"
              readOnly
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

            <button
              type="submit"
              className="rounded-lg mt-2 bg-black w-full border-slate-600 px-3 py-2 text-white font-semibold transition duration-300 ease-in-out hover:bg-red-500 hover:-translate-y-1"
            >
              Create Surveyor
            </button>
          </Form>
        </div>
      </div>
    </>
  );
}
