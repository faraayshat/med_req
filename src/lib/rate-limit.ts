import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";

export type RateLimitScope = "ip" | "user";

export type RateLimitConfig = {
  scope: RateLimitScope;
  key: string;
  max: number;
  windowSeconds: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

function buildBucket(config: RateLimitConfig): string {
  const bucket = Math.floor(Date.now() / (config.windowSeconds * 1000));
  return `${config.scope}:${config.key}:${bucket}`;
}

export async function enforceRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const bucketId = buildBucket(config);
  const docRef = adminDb.collection("rateLimits").doc(bucketId);

  return adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const existing = snap.exists ? (snap.data() as { count?: number }) : {};
    const nextCount = (existing.count ?? 0) + 1;
    const allowed = nextCount <= config.max;

    tx.set(
      docRef,
      {
        scope: config.scope,
        key: config.key,
        count: nextCount,
        windowSeconds: config.windowSeconds,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      allowed,
      remaining: Math.max(0, config.max - nextCount),
      retryAfterSeconds: config.windowSeconds,
    };
  });
}
