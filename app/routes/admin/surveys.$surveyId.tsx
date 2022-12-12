import { useEffect, useState } from "react";
import { redirect } from "@remix-run/node";
import { useCatch, useLoaderData, useParams } from "@remix-run/react";

import d_styles from "survey-core/defaultV2.min.css";
import c_styles from "survey-creator-core/survey-creator-core.min.css";

import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import { useOutletContext, useSubmit } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { ErrorMessage } from "~/components/error-message";

export function links() {
  return [
    { rel: "stylesheet", href: d_styles },
    { rel: "stylesheet", href: c_styles },
  ];
}

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const action = form.get("action");
  if (action == "redirect") {
    return redirect("/admin/surveys");
  }
  const surveyData = form.get("surveyData");
  const surveyId = form.get("surveyId");
  const surveyJson = JSON.parse(JSON.parse(surveyData));
  const updatedSurvey = await prisma.survey.update({
    where: {
      id: parseInt(surveyId),
    },
    data: {
      name: surveyJson.title,
      json: surveyJson,
    },
  });
  return updatedSurvey;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const licensed = process.env.SURVEYJS_LICENSED;
  const survey = await prisma.survey.findUnique({
    where: {
      id: parseInt(params.surveyId),
    },
  });
  if (!survey) {
    throw new Response("Survey not found.", {
      status: 404,
    });
  }
  return { survey, licensed };
};

export default function SurveyCreatorWidget() {
  const { survey, licensed } = useLoaderData();
  const submit = useSubmit();
  const [creator, setCreator] = useState<SurveyCreator>();

  const creatorOptions = {
    showLogicTab: true,
    isAutoSave: true,
    haveCommercialLicense: licensed === "true",
  };

  const donePlugin = {
    activate: () => {
      submit(
        {
          action: "redirect",
        },
        { method: "post" }
      );
    },
    deactivate: () => {
      return true;
    },
  };

  useEffect(() => {
    var creatorObj = new SurveyCreator(creatorOptions);
    creatorObj.addPluginTab("done", donePlugin, "Done", "svc-tab-template", 4);
    creatorObj.JSON = survey.json;
    creatorObj.saveSurveyFunc = (saveNo, callback) => {
      submit(
        {
          surveyData: JSON.stringify(creatorObj.text),
          surveyId: survey.id,
        },
        { method: "post" }
      );
      callback(saveNo, true);
    };
    setCreator(creatorObj);
  }, []);
  if (creator && creator != null) {
    return <SurveyCreatorComponent creator={creator} />;
  } else {
    return <h1>error</h1>;
  }
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return (
      <ErrorMessage message={`Could not find survey ${params.surveyId}`} />
    );
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}
