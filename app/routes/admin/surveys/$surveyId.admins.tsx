import {
  Link,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { AiOutlineClose } from "react-icons/ai";
import ReactSearchBox from "react-search-box";
import { prisma } from "~/utils/db.server";
import { ActionFunction, redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const { adminId, surveyId } = Object.fromEntries(await request.formData());
  await prisma.survey.update({
    where: { id: parseInt(surveyId) },
    data: { admins: { connect: { id: parseInt(adminId) } } },
  });
  return redirect(`/admin/surveys`);
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const surveyId = parseInt(params.surveyId);
  const survey = await prisma.survey.findUniqueOrThrow({
    where: { id: surveyId },
    include: {
      admins: {
        include: {
          user: true,
        },
      },
    },
  });
  return { survey };
};

export default function SurveyAdmins() {
  const { survey } = useLoaderData();
  const { adminData } = useOutletContext();
  const submit = useSubmit();
  return (
    <>
      <input
        type="checkbox"
        id={`survey-${survey.id}-admins`}
        className="modal-toggle"
        checked
      />
      <label
        htmlFor={`survey-${survey.id}-admins`}
        className="modal cursor-pointer"
      >
        <label
          className="modal-box bg-slate-700 border border-slate-500 relative"
          for=""
        >
          <div className="flex flex-col items-center space-y-6">
            <Link to="/admin/surveys" className="absolute top-0 right-5">
              <AiOutlineClose />
            </Link>
            <h1>{survey.name} Managers</h1>
            <div className="flex flex-row space-x-4 items-center">
              {survey.admins &&
                survey.admins.map((a, i) => (
                  <div
                    key={i}
                    className="w-fit h-fit py-1 px-3 rounded-2xl bg-black text-white hover:bg-slate-600"
                  >
                    {a.user.firstName} {a.user.lastName}
                  </div>
                ))}
            </div>
            <ReactSearchBox
              placeholder="Add new manager"
              data={adminData.filter(
                (a) => !survey.admins.map((a) => a.id).includes(a.key)
              )}
              onSelect={(record: any) =>
                submit(
                  { adminId: record.item.key, surveyId: survey.id },
                  { method: "post" }
                )
              }
              autoFocus
            />
          </div>
        </label>
      </label>
    </>
  );
}
