"use client";

import { useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotificationType = "success" | "alert" | "info";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  desc: string;
  createdAtMs: number;
}

function toRelativeTime(createdAtMs: number): string {
  const diffSeconds = Math.floor((Date.now() - createdAtMs) / 1000);
  if (diffSeconds < 60) {
    return "just now";
  }
  if (diffSeconds < 3600) {
    const mins = Math.floor(diffSeconds / 60);
    return `${mins} min${mins === 1 ? "" : "s"} ago`;
  }
  if (diffSeconds < 86400) {
    const hours = Math.floor(diffSeconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  const days = Math.floor(diffSeconds / 86400);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function useRealtimeNotifications(userId?: string, maxItems = 25) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoadingNotifications(false);
      return;
    }

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(maxItems)
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => {
            const data = item.data() as Record<string, unknown>;
            const createdAt = data.createdAt as { toMillis?: () => number; seconds?: number } | undefined;
            const createdAtMs = createdAt?.toMillis?.() ?? ((createdAt?.seconds ?? 0) * 1000);
            if (data.dismissed === true) {
              return null;
            }
            return {
              id: item.id,
              userId: String(data.userId || ""),
              type: (data.type as NotificationType) || "info",
              title: String(data.title || "Notification"),
              desc: String(data.desc || ""),
              createdAtMs,
            } satisfies AppNotification;
          })
          .filter((value): value is AppNotification => value !== null);

        setNotifications(items);
        setLoadingNotifications(false);
      },
      () => {
        setLoadingNotifications(false);
      }
    );

    return () => unsub();
  }, [userId, maxItems]);

  const dismissNotification = async (notificationId: string) => {
    await deleteDoc(doc(db, "notifications", notificationId));
  };

  const clearAllNotifications = async () => {
    if (notifications.length === 0) {
      return;
    }
    const batch = writeBatch(db);
    notifications.forEach((item) => {
      batch.delete(doc(db, "notifications", item.id));
    });
    await batch.commit();
  };

  const enrichedNotifications = useMemo(
    () => notifications.map((item) => ({ ...item, time: toRelativeTime(item.createdAtMs) })),
    [notifications]
  );

  return {
    notifications: enrichedNotifications,
    loadingNotifications,
    dismissNotification,
    clearAllNotifications,
  };
}
