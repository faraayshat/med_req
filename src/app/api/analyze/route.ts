import crypto from "node:crypto";
import * as admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { analyzeFormSchema, formatZodIssues } from "@/lib/analyze-schema";
import { verifySessionFromRequest } from "@/lib/auth-server";
import { createRequestId, logEvent, safeErrorMessage } from "@/lib/observability";
import { enforceRateLimit } from "@/lib/rate-limit";
import { isTrustedSameOrigin, secureApiHeaders } from "@/lib/request-security";

const MAX_BODY_BYTES = 32 * 1024;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

function makeIdempotencyDocId(uid: string, idempotencyKey: string): string {
  return crypto.createHash("sha256").update(`${uid}:${idempotencyKey}`).digest("hex");
}

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const ip = getClientIp(request);

  try {
    if (!isTrustedSameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: secureApiHeaders({ "x-request-id": requestId }) });
    }

    const session = await verifySessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: secureApiHeaders({ "x-request-id": requestId }) });
    }

    const [userLimit, ipLimit] = await Promise.all([
      enforceRateLimit({ scope: "user", key: session.uid, max: 20, windowSeconds: 60 }),
      enforceRateLimit({ scope: "ip", key: ip, max: 60, windowSeconds: 60 }),
    ]);

    if (!userLimit.allowed || !ipLimit.allowed) {
      const retryAfter = Math.max(userLimit.retryAfterSeconds, ipLimit.retryAfterSeconds);
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "retry-after": String(retryAfter),
            "x-request-id": requestId,
            ...secureApiHeaders(),
          },
        }
      );
    }

    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413, headers: secureApiHeaders({ "x-request-id": requestId }) });
    }

    const parsedBody = JSON.parse(rawBody || "{}");
    const parsed = analyzeFormSchema.safeParse(parsedBody.formData ?? parsedBody);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: formatZodIssues(parsed.error),
        },
        { status: 400, headers: secureApiHeaders({ "x-request-id": requestId }) }
      );
    }

    const idempotencyKey = request.headers.get("x-idempotency-key")?.trim();
    if (idempotencyKey) {
      const idemDocId = makeIdempotencyDocId(session.uid, idempotencyKey);
      const idemSnap = await adminDb.collection("analyzeRequests").doc(idemDocId).get();
      if (idemSnap.exists) {
        const idem = idemSnap.data() as { reportId: string; jobId: string; status: string };
        return NextResponse.json(
          {
            success: true,
            reportId: idem.reportId,
            jobId: idem.jobId,
            status: idem.status,
            idempotentReplay: true,
          },
          { status: 202, headers: secureApiHeaders({ "x-request-id": requestId }) }
        );
      }
    }

    const now = admin.firestore.FieldValue.serverTimestamp();
    const reportRef = adminDb.collection("reports").doc();
    const jobRef = adminDb.collection("analysisJobs").doc();

    await adminDb.runTransaction(async (tx) => {
      tx.set(reportRef, {
        ...parsed.data,
        userId: session.uid,
        status: "pending",
        protocolVersion: "v5.0",
        requestId,
        createdAt: now,
        updatedAt: now,
      });

      tx.set(jobRef, {
        reportId: reportRef.id,
        userId: session.uid,
        status: "queued",
        requestId,
        createdAt: now,
        updatedAt: now,
      });

      tx.set(adminDb.collection("reportSummaries").doc(reportRef.id), {
        reportId: reportRef.id,
        userId: session.uid,
        name: parsed.data.name,
        reason: parsed.data.reason,
        status: "pending",
        createdAt: now,
        updatedAt: now,
      });
    });

    if (idempotencyKey) {
      const idemDocId = makeIdempotencyDocId(session.uid, idempotencyKey);
      await adminDb.collection("analyzeRequests").doc(idemDocId).set({
        userId: session.uid,
        reportId: reportRef.id,
        jobId: jobRef.id,
        status: "pending",
        createdAt: now,
      });
    }

    const workerToken = process.env.ANALYZE_WORKER_SECRET;
    const workerUrl = new URL("/api/analyze/worker", request.nextUrl.origin);
    try {
      const wakeController = new AbortController();
      const wakeTimeout = setTimeout(() => wakeController.abort(), 1500);

      await fetch(workerUrl, {
        method: "POST",
        headers: workerToken ? { "x-worker-token": workerToken } : {},
        cache: "no-store",
        signal: wakeController.signal,
      });

      clearTimeout(wakeTimeout);
    } catch {
      // Worker can also be triggered by retry endpoint or scheduler if immediate wake-up fails.
    }

    logEvent("info", "analyze.enqueued", { requestId, reportId: reportRef.id, jobId: jobRef.id, uid: session.uid });

    return NextResponse.json(
      {
        success: true,
        reportId: reportRef.id,
        jobId: jobRef.id,
        status: "pending",
        estimatedSecondsMin: 10,
        estimatedSecondsMax: 45,
      },
      {
        status: 202,
        headers: secureApiHeaders({ "x-request-id": requestId }),
      }
    );
  } catch (error) {
    logEvent("error", "analyze.enqueue_failed", {
      requestId,
      ip,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500, headers: secureApiHeaders({ "x-request-id": requestId }) });
  }
}

