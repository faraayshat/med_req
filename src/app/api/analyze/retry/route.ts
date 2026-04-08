import { NextRequest } from "next/server";
import { verifySessionFromRequest } from "@/lib/auth-server";
import { isTrustedSameOrigin, secureJson } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  if (!isTrustedSameOrigin(request)) {
    return secureJson({ error: "Forbidden" }, { status: 403 });
  }

  const session = await verifySessionFromRequest(request);
  if (!session) {
    return secureJson({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const workerToken = process.env.ANALYZE_WORKER_SECRET;
    const workerUrl = new URL("/api/analyze/worker", request.nextUrl.origin);

    const response = await fetch(workerUrl, {
      method: "POST",
      headers: workerToken ? { "x-worker-token": workerToken } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return secureJson({ error: "Worker wake-up failed" }, { status: 503 });
    }

    return secureJson({ success: true }, { status: 200 });
  } catch {
    return secureJson({ error: "Worker wake-up failed" }, { status: 503 });
  }
}
