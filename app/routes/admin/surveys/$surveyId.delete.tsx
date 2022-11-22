import { Form, Link, useLoaderData } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { redirect } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { Modal } from "~/components/modal";

export const action: ActionFunction = async ({ request, params }) => {
  const surveyId = parseInt(params.surveyId);
  await prisma.survey.delete({ where: { id: parseInt(surveyId) } });
  return redirect("/admin/surveys");
};

export const loader = async ({ request, params }: LoaderArgs) => {
  const surveyId = parseInt(params.surveyId);
  const survey = await prisma.survey.findUniqueOrThrow({
    where: { id: surveyId },
  });
  return { survey };
};

export default function ConfirmDeleteSurvey() {
  const { survey } = useLoaderData();
  return (
    <Modal>
      <Form method="post">
        <h3 className="font-bold text-xl text-center">
          Are you sure you want to delete {survey.name}?
        </h3>
        <p className="py-4 text-center">
          This action will delete all assignments and collected data.
        </p>

        <div className="py-1 flex flex-row items-center justify-evenly">
          <Link to="/admin/surveys">
            <button className="btn btn-ghost">Cancel</button>
          </Link>
          <button className="btn" type="submit">
            Confirm
          </button>
        </div>
      </Form>
    </Modal>
  );
}
