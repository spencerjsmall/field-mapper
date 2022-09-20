import { useEffect, useState, useCallback } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";

import * as Survey from "survey-core";
import * as SurveyReact from "survey-react-ui";
import type { SurveyModel } from "survey-core";
import styles from "survey-core/defaultV2.css";
import { requireSurveyIds } from "~/utils/auth.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

Survey.StylesManager.applyTheme("defaultV2");

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireSurveyIds(request);
  const surveyId = session.get("surveyId");
  const recordId = session.get("recordId")
  console.log("surveyId", surveyId)
  console.log("recordId", recordId);
  return surveyId;
};

export default function SurveyPage() {
  const data = useLoaderData();
  const [model, setModel] = useState<SurveyModel>();

  var surveyJson = {
    surveyId: data,
  };  

  const alertResults = useCallback((sender) => {
    const results = JSON.stringify(sender.data);
    alert(results);
  }, []);
  
  useEffect(() => {
    var survey = new Survey.Model(surveyJson);
    survey.onComplete.add(alertResults);
    setModel(survey);
  }, []);  

  if (model && model != null) {
    return <SurveyReact.Survey model={model} />;
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
