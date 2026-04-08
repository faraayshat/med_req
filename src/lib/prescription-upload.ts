import crypto from "node:crypto";

export type UploadedPrescription = {
  fileUrl: string;
  fileName: string;
  fileContentType: string;
  fileSizeBytes: number;
};

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

function getCloudinaryEnv() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "prescriptions";

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function buildSignature(params: Record<string, string | number>, apiSecret: string): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${sorted}${apiSecret}`).digest("hex");
}

export function isPrescriptionUploadEnabled(): boolean {
  return Boolean(getCloudinaryEnv());
}

export function validatePrescriptionFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "Only PDF, PNG, JPG, and WEBP files are allowed";
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
    return "File size must be between 1 byte and 5MB";
  }

  return null;
}

export async function uploadPrescriptionFile(file: File): Promise<UploadedPrescription> {
  const cloudinary = getCloudinaryEnv();
  if (!cloudinary) {
    throw new Error("Prescription upload is not configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = `rx_${crypto.randomUUID()}`;

  const params = {
    folder: cloudinary.folder,
    public_id: publicId,
    timestamp,
  };
  const signature = buildSignature(params, cloudinary.apiSecret);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  const formData = new FormData();
  formData.append("file", dataUri);
  formData.append("api_key", cloudinary.apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", cloudinary.folder);
  formData.append("public_id", publicId);
  formData.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to upload prescription file");
  }

  const result = (await response.json()) as { secure_url?: string; original_filename?: string; format?: string };
  if (!result.secure_url) {
    throw new Error("Missing uploaded file URL");
  }

  return {
    fileUrl: result.secure_url,
    fileName: result.original_filename ? `${result.original_filename}.${result.format || "file"}` : file.name,
    fileContentType: file.type,
    fileSizeBytes: file.size,
  };
}
