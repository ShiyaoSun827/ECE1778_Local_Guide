// src/lib/storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  region: process.env.DO_SPACES_REGION || "nyc3",
  credentials: {
    accessKeyId: process.env.DO_SPACES_KEY!,
    secretAccessKey: process.env.DO_SPACES_SECRET!,
  },
});

export async function uploadToSpaces(file: File, folder: string = "places"): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  

  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s/g, '-')}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.DO_SPACES_BUCKET,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read",
    })
  );


  return `${process.env.DO_SPACES_ENDPOINT}/${process.env.DO_SPACES_BUCKET}/${fileName}`;
}