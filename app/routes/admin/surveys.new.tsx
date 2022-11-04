import { useEffect, useState } from "react";
import { redirect } from "@remix-run/node";

import d_styles from "survey-core/defaultV2.min.css";
import c_styles from "survey-creator-core/survey-creator-core.min.css";

import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";
import { useSubmit } from "@remix-run/react";
import { prisma } from "~/utils/db.server";
import { getUserId } from "~/utils/auth.server";

export function links() {
  return [
    { rel: "stylesheet", href: d_styles },
    { rel: "stylesheet", href: c_styles },
  ];
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await getUserId(request);
  const { surveyData } = Object.fromEntries(await request.formData());
  const surveyJson = JSON.parse(JSON.parse(surveyData));
  await prisma.survey.create({
    data: {
      name: surveyJson.title ? surveyJson.title : "New Survey",
      json: surveyJson,
      admins: { connect: { id: userId } },
    },
  });
  return redirect("/admin/surveys");
};

export default function SurveyCreatorWidget() {
  const submit = useSubmit();
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
