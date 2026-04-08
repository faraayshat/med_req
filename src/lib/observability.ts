import crypto from "node:crypto";

export type LogLevel = "info" | "warn" | "error";

export function createRequestId(): string {
  return crypto.randomUUID();
}

export function logEvent(level: LogLevel, event: string, data: Record<string, unknown> = {}) {
  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...data,
  };

  const text = JSON.stringify(payload);
  if (level === "error") {
    console.error(text);
    return;
  }

  if (level === "warn") {
    console.warn(text);
    return;
  }

  console.log(text);
}

export function safeErrorMessage(): string {
  return "Request failed. Please try again.";
}
