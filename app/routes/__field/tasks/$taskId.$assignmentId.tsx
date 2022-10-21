import { useEffect, useState, useCallback } from "react";
import type { LoaderFunction } from "@remix-run/node";
import {
  useCatch,
  useLoaderData,
  useOutletContext,
  useSubmit,
} from "@remix-run/react";
import { redirect } from "@remix-run/node";

import * as Survey from "survey-core";
import * as SurveyReact from "survey-react-ui";
import type { SurveyModel } from "survey-core";
import styles from "survey-core/defaultV2.css";
import { prisma } from "~/utils/db.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

Survey.StylesManager.applyTheme("defaultV2");

export const loader: LoaderFunction = async ({ request, params }) => {
  const assnId = parseInt(params.assignmentId);
  const assn = await prisma.assignment.findUniqueOrThrow({
    where: {
      id: assnId,
    },
  });
  return assn.surveyId;
};

export async function action({ request, params }) {
  const assnId = parseInt(params.assignmentId);
  const taskId = params.taskId;
  const { results, userId } = Object.fromEntries(await request.formData());
  await prisma.assignment.update({
    where: {
      id: assnId,
    },
    data: {
      completed: true,
      results: JSON.parse(results),
      assignee: { connect: { id: parseInt(userId) } },
    },
  });
  return redirect(`/tasks/${taskId}`);
}

export default function SurveyPage() {
  const surveyId = useLoaderData();
  const userId = useOutletContext<Number>();
  const submit = useSubmit();
  const [model, setModel] = useState<SurveyModel>();

  var surveyJson = {
    surveyId: surveyId,
  };

  const handleComplete = useCallback(
    (sender) => {
      submit(
        {
          results: JSON.stringify(sender.data),
          userId: String(userId),
        },
        { method: "post" }
      );
    },
    [submit]
  );

  useEffect(() => {
    var survey = new Survey.Model(surveyJson);
    survey.onComplete.add(handleComplete);
    setModel(survey);
  }, []);

  if (model && model != null) {
    return (
      <div className="min-h-full  max-h-full overflow-y-scroll">
        <SurveyReact.Survey model={model} />
      </div>
    );
  } else return <h1>error</h1>;
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Note not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}
