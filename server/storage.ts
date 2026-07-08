import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.resolve(__dirname, "../client/public/uploads");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  // Save file locally
  const filename = relKey.split('/').pop() || 'upload.bin';
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
  return { key: filename, url: `/uploads/${filename}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const filename = relKey.split('/').pop() || '';
  return `/uploads/${filename}`;
}
