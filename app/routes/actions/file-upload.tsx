// app/routes/avatar.tsx
import { ActionFunction, json } from "@remix-run/node";
import { uploadFile } from "~/utils/s3.server";

export const action: ActionFunction = async ({ request }) => {

  const fileUrl = await uploadFile(request);  
  return json(fileUrl);
};
