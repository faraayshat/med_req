import * as admin from "firebase-admin";
import { adminDb } from "@/lib/firebase-admin";

export type NotificationType = "success" | "alert" | "info";

interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  desc: string;
  reportId?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<void> {
  const now = admin.firestore.FieldValue.serverTimestamp();

  await adminDb.collection("notifications").add({
    userId: input.userId,
    type: input.type,
    title: input.title,
    desc: input.desc,
    reportId: input.reportId ?? null,
    dismissed: false,
    createdAt: now,
    updatedAt: now,
  });
}
