import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3 = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export async function uploadPhoto(file: File, folder: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Недопустимый формат файла. Разрешены: JPEG, PNG, WEBP");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("Файл слишком большой. Максимум 5 МБ");
  }

  const extension = file.type.split("/")[1];
  const key = `${folder}/${uuidv4()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    })
  );

  return `${process.env.S3_PUBLIC_URL}/${key}`;
}
