import * as admin from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { buildClinicalAssessment } from "@/lib/clinical-analysis";
import { analyzeFormSchema } from "@/lib/analyze-schema";
import { createRequestId, logEvent, safeErrorMessage } from "@/lib/observability";
import { recordMetric } from "@/lib/metrics";
import { createNotification } from "@/lib/notifications-server";

const WORKER_TIMEOUT_MS = 10_000;

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function verifyWorkerToken(request: NextRequest): boolean {
  const expected = process.env.ANALYZE_WORKER_SECRET;
  if (!expected) {
    return process.env.NODE_ENV !== "production";
  }
  return request.headers.get("x-worker-token") === expected;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Worker timeout")), timeoutMs);
    }),
  ]);
}

export async function POST(request: NextRequest) {
  if (!verifyWorkerToken(request)) {
    return unauthorized();
  }

  const requestId = createRequestId();
  const startedAt = Date.now();
  let metricStatus: "success" | "error" = "success";

  try {
    const queuedJobs = await adminDb
      .collection("analysisJobs")
      .where("status", "==", "queued")
      .limit(10)
      .get();

    if (queuedJobs.empty) {
      return NextResponse.json({ success: true, processed: false, message: "No queued jobs" });
    }

    const jobDoc = queuedJobs.docs
      .slice()
      .sort((a, b) => {
        const aMs = a.get("createdAt")?.toMillis?.() ?? 0;
        const bMs = b.get("createdAt")?.toMillis?.() ?? 0;
        return aMs - bMs;
      })[0];
    const job = jobDoc.data() as { reportId: string; userId: string };
    const reportRef = adminDb.collection("reports").doc(job.reportId);

    await jobDoc.ref.set(
      {
        status: "processing",
        workerRequestId: requestId,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const reportSnap = await reportRef.get();
    if (!reportSnap.exists) {
      await jobDoc.ref.set(
        {
          status: "failed",
          error: "Missing report",
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      await createNotification({
        userId: job.userId,
        type: "alert",
        title: "Analysis Failed",
        desc: `Report ${job.reportId.slice(0, 8).toUpperCase()} could not be processed.`,
        reportId: job.reportId,
      }).catch(() => undefined);

      return NextResponse.json({ success: false, processed: false }, { status: 404 });
    }

    const reportData = reportSnap.data() as Record<string, unknown>;
    const parsed = analyzeFormSchema.safeParse(reportData);
    if (!parsed.success) {
      await Promise.all([
        jobDoc.ref.set(
          {
            status: "failed",
            error: "Invalid report payload",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        ),
        reportRef.set(
          {
            status: "failed",
            error: "Invalid report payload",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        ),
      ]);

      await createNotification({
        userId: job.userId,
        type: "alert",
        title: "Analysis Rejected",
        desc: `Report ${job.reportId.slice(0, 8).toUpperCase()} has invalid payload data.`,
        reportId: job.reportId,
      }).catch(() => undefined);

      return NextResponse.json({ success: false, processed: true }, { status: 400 });
    }

    const assessment = await withTimeout(
      Promise.resolve(buildClinicalAssessment(parsed.data)),
      WORKER_TIMEOUT_MS
    );

    await Promise.all([
      reportRef.set(
        {
          bmi: assessment.bmi,
          bmiStatus: assessment.bmiStatus,
          recommendations: assessment.recommendations,
          overallConfidence: assessment.overallConfidence,
          status: "analyzed",
          analyzedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
      adminDb.collection("reportSummaries").doc(job.reportId).set(
        {
          status: "analyzed",
          bmiStatus: assessment.bmiStatus,
          overallConfidence: assessment.overallConfidence,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
      jobDoc.ref.set(
        {
          status: "done",
          finishedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      ),
    ]);

    await createNotification({
      userId: job.userId,
      type: "success",
      title: "Health Analysis Complete",
      desc: `Report ${job.reportId.slice(0, 8).toUpperCase()} is ready to review.`,
      reportId: job.reportId,
    }).catch(() => undefined);

    logEvent("info", "analyze.worker_done", {
      requestId,
      jobId: jobDoc.id,
      reportId: job.reportId,
      uid: job.userId,
      confidence: assessment.overallConfidence,
    });

    return NextResponse.json({ success: true, processed: true, reportId: job.reportId, jobId: jobDoc.id });
  } catch (error) {
    metricStatus = "error";
    logEvent("error", "analyze.worker_failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ error: safeErrorMessage() }, { status: 500 });
  } finally {
    void recordMetric({ route: "analyze.worker", status: metricStatus, durationMs: Date.now() - startedAt }).catch(() => {
      // Metrics must never block worker execution.
    });
  }
}
