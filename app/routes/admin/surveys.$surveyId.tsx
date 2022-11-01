import { useEffect, useState } from "react";
import { redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import d_styles from "survey-core/defaultV2.min.css";
import c_styles from "survey-creator-core/survey-creator-core.min.css";

import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import { useOutletContext, useSubmit } from "@remix-run/react";
import { prisma } from "~/utils/db.server";

export function links() {
  return [
    { rel: "stylesheet", href: d_styles },
    { rel: "stylesheet", href: c_styles },
  ];
}

export const action: ActionFunction = async ({ request }) => {
  const { surveyData, surveyId } = Object.fromEntries(
    await request.formData()
  );
  const surveyJson = JSON.parse(JSON.parse(surveyData));
  await prisma.survey.update({
    where: {
      id: parseInt(surveyId),
    },
    data: {
      name: surveyJson.title,
      json: surveyJson,
    },
  });
  return redirect("/admin/surveys");
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const survey = prisma.survey.findUniqueOrThrow({
    where: {
      id: parseInt(params.surveyId),
    },
  });
  return survey;
};

export default function SurveyCreatorWidget() {
  const survey = useLoaderData();  
  const submit = useSubmit();
  const userId = useOutletContext();
  const [creator, setCreator] = useState<SurveyCreator>();

  const creatorOptions = {
    showLogicTab: true,
    isAutoSave: true,
  };

  const completePlugin = {
    activate: () => {
      const newSurvey = window.localStorage.getItem("survey-json");
      submit(
        {
          surveyData: JSON.stringify(newSurvey),
          surveyId: survey.id,
          userId: userId,
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
    creatorObj.addPluginTab(
      "complete",
      completePlugin,
      "Complete",
      "svc-tab-template",
      4
    );
    creatorObj.JSON = survey.json;
    creatorObj.saveSurveyFunc = (saveNo, callback) => {
      window.localStorage.setItem("survey-json", creatorObj.text);      
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
