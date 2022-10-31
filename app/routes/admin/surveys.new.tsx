import { useEffect, useState } from "react";
import { redirect } from "@remix-run/node";

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
  const { surveyData, userId } = Object.fromEntries(await request.formData());
  const surveyJson = JSON.parse(JSON.parse(surveyData));
  await prisma.survey.create({
    data: {
      name: surveyJson.title ? surveyJson.title : "New Survey",
      json: surveyJson,
      admins: { connect: { id: parseInt(userId) } },
    },
  });
  return redirect("/admin/surveys");
};

export default function SurveyCreatorWidget() {
  const submit = useSubmit();
  const userId = useOutletContext();
  const [creator, setCreator] = useState<SurveyCreator>();

  const creatorOptions = {
    showLogicTab: true,
    isAutoSave: true,
  };

  const completePlugin = {
    activate: () => {
      const survey = window.localStorage.getItem("survey-json");
      submit(
        {
          surveyData: JSON.stringify(survey),
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
    creatorObj.saveSurveyFunc = (saveNo, callback) => {
      window.localStorage.setItem("survey-json", creatorObj.text);
      console.log(creatorObj.text);
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
