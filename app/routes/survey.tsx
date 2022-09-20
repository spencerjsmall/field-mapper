import { useEffect, useState } from "react";
import type { LoaderFunction } from "@remix-run/node"
import { useCatch, useLoaderData } from "@remix-run/react";

import * as Survey from "survey-core";
import * as SurveyReact from "survey-react-ui";
import type { SurveyModel } from "survey-core";
import styles from "survey-core/defaultV2.css";

import { Layout } from "~/components/layout";
import { requireSurveyId } from "~/utils/auth.server";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

Survey.StylesManager.applyTheme("defaultV2");

export const loader: LoaderFunction = async ({ request }) => {
  const session = await requireSurveyId(request);
  const surveyId = session.get("surveyId")
  return surveyId;
};


export default function SurveyPage() {
  const data = useLoaderData()
  var surveyJson = {
    surveyId: data,
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
