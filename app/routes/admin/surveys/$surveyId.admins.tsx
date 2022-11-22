import { useLoaderData, useOutletContext, useSubmit } from "@remix-run/react";
import { AiFillCloseCircle } from "react-icons/ai";
import ReactSearchBox from "react-search-box";
import { prisma } from "~/utils/db.server";
import { ActionFunction } from "@remix-run/node";
import { Modal } from "~/components/modal";

export const action: ActionFunction = async ({ request }) => {
  const { adminId, surveyId, action } = Object.fromEntries(
    await request.formData()
  );
  await prisma.survey.update({
    where: { id: parseInt(surveyId) },
    data: {
      admins:
        String(action) == "add"
          ? { connect: { id: parseInt(adminId) } }
          : { disconnect: { id: parseInt(adminId) } },
    },
  });
  return null;
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
    <Modal title={survey.name}>
      <div className="flex flex-row justify-center space-x-2 items-center flex-wrap">
        {survey.admins &&
          survey.admins.map((a, i) => (
            <div
              key={i}
              className="w-fit h-fit py-1 px-3 flex flex-row items-center space-x-2 flex-no-wrap rounded-2xl bg-black text-slate-300 hover:bg-slate-900"
            >
              <span>
                {a.user.firstName} {a.user.lastName}
              </span>
              <div
                className="hover:text-white cursor-pointer"
                onClick={() =>
                  submit(
                    {
                      adminId: a.id,
                      surveyId: survey.id,
                      action: "remove",
                    },
                    { method: "post" }
                  )
                }
              >
                <AiFillCloseCircle />
              </div>
            </div>
          ))}
      </div>
      <div className="py-4">
        <ReactSearchBox
          placeholder="Add new manager"
          data={adminData.filter(
            (a) => !survey.admins.map((a) => a.id).includes(a.key)
          )}
          onSelect={(record: any) =>
            submit(
              {
                adminId: record.item.key,
                surveyId: survey.id,
                action: "add",
              },
              { method: "post" }
            )
          }
          clearOnSelect
          autoFocus
        />
      </div>
    </Modal>
  );
}
