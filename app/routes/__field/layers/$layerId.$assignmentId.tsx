import { useEffect, useState, useCallback } from "react";
import type { LoaderFunction } from "@remix-run/node";
import {
  useCatch,
  useLoaderData,
  useParams,
  useSubmit,
} from "@remix-run/react";
import { redirect } from "@remix-run/node";

import * as Survey from "survey-core";
import * as SurveyReact from "survey-react-ui";
import type { SurveyModel } from "survey-core";
import styles from "survey-core/defaultV2.css";
import { prisma } from "~/utils/db.server";
import { requireUserId } from "~/utils/auth.server";
import { ErrorMessage } from "~/components/error-message";
import { emailCompleteAssignment } from "~/utils/email.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

Survey.StylesManager.applyTheme("defaultV2");

export const loader: LoaderFunction = async ({ request, params }) => {
  const assnId = parseInt(params.assignmentId);
  const assn = await prisma.assignment.findUnique({
    where: { id: assnId },
    include: { survey: true, feature: true },
  });
  if (!assn) {
    throw new Response("Assignment not found.", {
      status: 404,
    });
  }
  return assn;
};

export async function action({ request, params }) {
  const assnId = parseInt(params.assignmentId);
  const userId = await requireUserId(request);
  const layerId = params.layerId;
  const { results } = Object.fromEntries(await request.formData());
  const assn = await prisma.assignment.update({
    where: {
      id: assnId,
    },
    data: {
      completed: true,
      completedAt: new Date(),
      results: JSON.parse(results),
      assignee: { connect: { id: userId } },
    },
    include: {
      feature: {
        include: {
          layer: {
            include: {
              admins: true,
            },
          },
        },
      },
      assignee: {
        include: {
          user: true,
        },
      },
    },
  });
  emailCompleteAssignment(assn);
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
      <div className="grow w-full overflow-y-scroll">
        <SurveyReact.Survey model={model} />
      </div>
    );
  } else return <h1>error</h1>;
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <ErrorMessage
        message={`Could not find assignment ${params.assignmentId}`}
      />
    );
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}
