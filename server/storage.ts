import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Em desenvolvimento o servidor está em server/, em produção está em dist/
const UPLOAD_DIR = process.env.NODE_ENV === "production"
  ? path.resolve(__dirname, "public/uploads")
  : path.resolve(__dirname, "../client/public/uploads");

// Ensure upload directory exists for local development
if (!process.env.S3_BUCKET && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

let s3Client: S3Client | null = null;
if (process.env.S3_BUCKET && process.env.S3_ENDPOINT && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
  });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const filename = relKey.split('/').pop() || `upload_${Date.now()}.bin`;
  
  if (s3Client && process.env.S3_BUCKET) {
    const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    });
    
    await s3Client.send(command);
    
    const publicUrl = process.env.S3_PUBLIC_URL 
      ? `${process.env.S3_PUBLIC_URL}/${filename}`
      : `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}/${filename}`;
      
    return { key: filename, url: publicUrl };
  }

  // Fallback to local disk (useful for local dev)
  const filePath = path.join(UPLOAD_DIR, filename);
  if (typeof data === "string") {
    fs.writeFileSync(filePath, data);
  } else {
    fs.writeFileSync(filePath, Buffer.from(data));
  }
  return { key: filename, url: `/uploads/${filename}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const filename = relKey.split('/').pop() || '';
  if (s3Client && process.env.S3_PUBLIC_URL) {
    return { key: filename, url: `${process.env.S3_PUBLIC_URL}/${filename}` };
  }
  return { key: filename, url: `/uploads/${filename}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const filename = relKey.split('/').pop() || '';
  if (s3Client && process.env.S3_PUBLIC_URL) {
    return `${process.env.S3_PUBLIC_URL}/${filename}`;
  }
  return `/uploads/${filename}`;
}
