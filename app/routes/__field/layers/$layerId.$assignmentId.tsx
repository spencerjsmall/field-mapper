import { useEffect, useState, useCallback } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { useCatch, useLoaderData, useSubmit } from "@remix-run/react";
import { redirect } from "@remix-run/node";

import * as Survey from "survey-core";
import * as SurveyReact from "survey-react-ui";
import type { SurveyModel } from "survey-core";
import styles from "survey-core/defaultV2.css";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/auth.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

Survey.StylesManager.applyTheme("defaultV2");

export const loader: LoaderFunction = async ({ request, params }) => {
  const assnId = parseInt(params.assignmentId);
  const assn = await prisma.assignment.findUniqueOrThrow({
    where: { id: assnId },
    include: { survey: true, feature: true },
  });
  return assn;
};

export async function action({ request, params }) {
  const assnId = parseInt(params.assignmentId);
  const userId = await requireUserId(request);
  const layerId = params.layerId;
  const { results } = Object.fromEntries(await request.formData());  
  await prisma.assignment.update({
    where: {
      id: assnId,
    },
    data: {
      completed: true,
      completedAt: new Date(),
      results: JSON.parse(results),
      assignee: { connect: { id: userId } },
    },
  });
  return redirect(`/layers/${layerId}`);
}

export default function SurveyPage() {
  const assn = useLoaderData();
  const submit = useSubmit();
  const [model, setModel] = useState<SurveyModel>();

  const handleComplete = useCallback(
    (sender) => {
      submit(
        {
          results: JSON.stringify(sender.data),
        },
        { method: "post" }
      );
    },
    [submit]
  );

  useEffect(() => {
    var survey = new Survey.Model(assn.survey.json);
    survey.onUploadFiles.add(async (sender, options) => {
      options.callback(
        "success",
        await Promise.all(
          options.files.map(async (file) => {
            let inputFormData = new FormData();
            inputFormData.append("file", file);
            const response = await fetch("/actions/file-upload", {
              method: "POST",
              body: inputFormData,
            });
            const fileUrl = await response.json();
            return {
              file: file,
              content: fileUrl,
            };
          })
        )
      );
    });
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
