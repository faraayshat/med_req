import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { secureJson } from "@/lib/request-security";

function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.METRICS_API_KEY;
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("x-metrics-key") === expected;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return secureJson({ error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await adminDb.collection("systemMetrics").limit(100).get();
  const metrics = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  return secureJson({ success: true, metrics }, { status: 200 });
}
