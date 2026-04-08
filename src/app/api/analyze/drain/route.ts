import { NextRequest } from "next/server";
import { secureJson } from "@/lib/request-security";

function verifyWorkerToken(request: NextRequest): boolean {
  const expected = process.env.ANALYZE_WORKER_SECRET;
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("x-worker-token") === expected;
}

export async function POST(request: NextRequest) {
  if (!verifyWorkerToken(request)) {
    return secureJson({ error: "Unauthorized" }, { status: 401 });
  }

  const batch = Math.max(1, Math.min(Number(request.nextUrl.searchParams.get("batch") || "5"), 20));
  const workerToken = process.env.ANALYZE_WORKER_SECRET;
  const workerUrl = new URL("/api/analyze/worker", request.nextUrl.origin);

  let processed = 0;
  for (let i = 0; i < batch; i += 1) {
    const response = await fetch(workerUrl, {
      method: "POST",
      headers: workerToken ? { "x-worker-token": workerToken } : {},
      cache: "no-store",
    });

    if (!response.ok) {
      return secureJson({ error: "Drain failed", processed }, { status: 500 });
    }

    const payload = (await response.json()) as { processed?: boolean };
    if (!payload.processed) {
      break;
    }

    processed += 1;
  }

  return secureJson({ success: true, processed }, { status: 200 });
}
