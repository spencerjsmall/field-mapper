import { useEffect, useState } from "react";

import d_styles from "survey-core/defaultV2.min.css";
import c_styles from "survey-creator-core/survey-creator-core.min.css";

import { SurveyCreator, SurveyCreatorComponent } from "survey-creator-react";

export function links() {
  return [
    { rel: "stylesheet", href: d_styles },
    { rel: "stylesheet", href: c_styles },
  ];
}

const creatorOptions = {
  showLogicTab: true,
  isAutoSave: true,
};

export default function SurveyCreatorWidget() {
  const [creator, setCreator] = useState<SurveyCreator>();
  useEffect(() => {
    var creatorObj = new SurveyCreator(creatorOptions);
    creatorObj.saveSurveyFunc = (saveNo, callback) => {
      //window.localStorage.setItem("survey-json", creator.text);
      callback(saveNo, true);
    };
    console.log(creatorObj);
    setCreator(creatorObj);
  }, []);
  if (creator && creator != null) {
    return <SurveyCreatorComponent creator={creator} />;
  } else {
    return <h1>error</h1>;
  }
}
