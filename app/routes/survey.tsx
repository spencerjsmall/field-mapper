import { useEffect, useState } from "react";
import * as Survey from "survey-core";
import * as SurveyReact from "survey-react-ui";
import type { SurveyModel } from "survey-core";
import styles from "survey-core/defaultV2.css";
import { useCatch, useLoaderData } from "@remix-run/react";
import { Layout } from "~/components/layout";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

Survey.StylesManager.applyTheme("defaultV2");

export default function SurveyPage() {
  var surveyJson = {
    surveyId: "f690f329-c015-4e62-9fcc-bf8b4be0d507",
  };
  const [model, setModel] = useState<SurveyModel>();
  useEffect(() => {
    var survey = new Survey.Model(surveyJson);
    setModel(survey);
  }, []);
  return <Layout>{model && <SurveyReact.Survey model={model} />}</Layout>;
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
