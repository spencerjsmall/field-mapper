// app/routes/avatar.tsx
import { ActionFunction, json } from "@remix-run/node";
import { uploadLayer } from "~/utils/s3.server";

export const action: ActionFunction = async ({ request }) => {

  const layerUrl = await uploadLayer(request);  
  return json(layerUrl);
};
