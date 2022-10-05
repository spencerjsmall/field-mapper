import { Readable } from "stream";
import type { UploadHandler } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import S3 from "aws-sdk/clients/s3";
import cuid from "cuid";

// 1
const s3 = new S3({
  region: process.env.FM_BUCKET_REGION,
  accessKeyId: process.env.FM_ACCESS_KEY_ID,
  secretAccessKey: process.env.FM_SECRET_ACCESS_KEY,
});

const uploadHandler: UploadHandler = async ({ name, filename, data }) => {
  // 2
  const stream = Readable.from(data);

  if (name !== "layer") {
    stream.resume();
    return;
  }

  // 3
  const { Location } = await s3
    .upload({
      Bucket: process.env.FM_BUCKET_NAME || "",
      Key: `${cuid()}.${filename.split(".").slice(-1)}`,
      Body: stream,
    })
    .promise();

  // 4
  return Location;
};

export async function uploadLayer(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const layerUrl = formData.get("layer")?.toString() || "";

  return layerUrl;
}
