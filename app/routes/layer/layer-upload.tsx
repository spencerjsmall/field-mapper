// app/routes/avatar.tsx
import { ActionFunction, json } from "@remix-run/node";
import { uploadLayer } from "~/utils/s3.server";

export const action: ActionFunction = async ({ request }) => {

  const layerUrl = await uploadLayer(request);
  const extension = layerUrl.split(".").pop();

  if (
    extension == "dbf" ||
    extension == "shx" ||
    extension == "prj" ||
    extension == "cpg"
  ) {
    console.log("PASS");
    return null;
  }

  // 4
  return json(layerUrl);
};
