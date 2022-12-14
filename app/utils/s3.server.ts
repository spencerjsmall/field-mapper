import { Readable } from "stream";
import type { UploadHandler } from "@remix-run/node";
import { unstable_parseMultipartFormData } from "@remix-run/node";
import S3 from "aws-sdk/clients/s3";

// 1
const s3 = new S3({
  region: process.env.FM_BUCKET_REGION,
  accessKeyId: process.env.FM_ACCESS_KEY_ID,
  secretAccessKey: process.env.FM_SECRET_ACCESS_KEY,
});

const uploadHandler: UploadHandler = async ({ name, filename, data }) => {
  // 2
  const stream = Readable.from(data);

  if (name !== "file") {
    stream.resume();
    return;
  }

  const date = new Date();
  const ms = date.getTime();

  // 3
  const { Location } = await s3
    .upload({
      Bucket: process.env.FM_BUCKET_NAME || "",
      Key: `${Math.trunc(ms / 10000)}.${filename}`,
      Body: stream,
    })
    .promise();

  // 4
  return Location;
};

export async function uploadFile(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const fileUrl = formData.get("file")?.toString() || "";

  return fileUrl;
}
