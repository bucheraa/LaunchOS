import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

let s3Client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION ?? "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      ...(process.env.S3_ENDPOINT
        ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true }
        : {}),
    });
  }
  return s3Client;
}

const BUCKET = process.env.S3_BUCKET ?? "launchos-assets";

export async function uploadFile(
  file: Buffer,
  mimeType: string,
  folder: string = "uploads"
): Promise<{ key: string; url: string }> {
  const ext = mimeType.split("/")[1] ?? "bin";
  const key = `${folder}/${randomUUID()}.${ext}`;

  await getS3Client().send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file,
      ContentType: mimeType,
    })
  );

  const url = process.env.CDN_URL
    ? `${process.env.CDN_URL}/${key}`
    : `https://${BUCKET}.s3.amazonaws.com/${key}`;

  return { key, url };
}

export async function getSignedUploadUrl(
  key: string,
  mimeType: string,
  expiresIn = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: mimeType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return getSignedUrl(getS3Client(), command, { expiresIn });
}

export async function deleteFile(key: string): Promise<void> {
  await getS3Client().send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: key })
  );
}
