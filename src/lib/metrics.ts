import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebase-admin";

export type MetricEvent = {
  route: string;
  status: "success" | "error";
  durationMs: number;
};

export async function recordMetric(event: MetricEvent): Promise<void> {
  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const docRef = adminDb.collection("systemMetrics").doc(`${event.route}:${day}`);

  const latencyBucket =
    event.durationMs <= 200 ? "p200" : event.durationMs <= 500 ? "p500" : event.durationMs <= 1000 ? "p1000" : "p1000plus";

  await docRef.set(
    {
      route: event.route,
      day,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      totalCount: admin.firestore.FieldValue.increment(1),
      successCount: admin.firestore.FieldValue.increment(event.status === "success" ? 1 : 0),
      errorCount: admin.firestore.FieldValue.increment(event.status === "error" ? 1 : 0),
      latencySumMs: admin.firestore.FieldValue.increment(event.durationMs),
      [`latencyBuckets.${latencyBucket}`]: admin.firestore.FieldValue.increment(1),
    },
    { merge: true }
  );
}
