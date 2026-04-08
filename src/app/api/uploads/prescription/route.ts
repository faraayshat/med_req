import { NextRequest } from "next/server";
import { verifySessionFromRequest } from "@/lib/auth-server";
import { isTrustedSameOrigin, secureJson } from "@/lib/request-security";
import {
  isPrescriptionUploadEnabled,
  uploadPrescriptionFile,
  validatePrescriptionFile,
} from "@/lib/prescription-upload";

export async function POST(request: NextRequest) {
  if (!isTrustedSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 });
  }

  const session = await verifySessionFromRequest(request);
  if (!session) {
    return secureJson({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isPrescriptionUploadEnabled()) {
    return secureJson({ error: "Prescription upload is disabled" }, { status: 503 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return secureJson({ error: "Missing file" }, { status: 400 });
  }

  const validationError = validatePrescriptionFile(file);
  if (validationError) {
    return secureJson({ error: validationError }, { status: 400 });
  }

  try {
    const uploaded = await uploadPrescriptionFile(file);
    return secureJson({ success: true, ...uploaded }, { status: 200 });
  } catch {
    return secureJson({ error: "Could not upload prescription" }, { status: 500 });
  }
}
