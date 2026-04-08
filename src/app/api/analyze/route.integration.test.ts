import { describe, expect, it, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const verifySessionFromRequest = vi.fn();
const enforceRateLimit = vi.fn();
const isTrustedSameOrigin = vi.fn();

vi.mock("@/lib/auth-server", () => ({
  verifySessionFromRequest,
}));

vi.mock("@/lib/rate-limit", () => ({
  enforceRateLimit,
}));

vi.mock("@/lib/request-security", async () => {
  const actual = await vi.importActual<typeof import("@/lib/request-security")>("@/lib/request-security");
  return {
    ...actual,
    isTrustedSameOrigin,
  };
});

vi.mock("@/lib/firebase-admin", () => ({
  adminDb: {
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        get: vi.fn(),
        set: vi.fn(),
      })),
    })),
    runTransaction: vi.fn(),
  },
}));

vi.mock("firebase-admin", () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: () => ({ _serverTimestamp: true }),
      increment: (value: number) => ({ _increment: value }),
    },
  },
  default: {
    firestore: {
      FieldValue: {
        serverTimestamp: () => ({ _serverTimestamp: true }),
        increment: (value: number) => ({ _increment: value }),
      },
    },
  },
}));

vi.mock("@/lib/observability", () => ({
  createRequestId: () => "test-request-id",
  logEvent: vi.fn(),
  safeErrorMessage: () => "Request failed. Please try again.",
}));

describe("analyze route integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 403 for untrusted origin", async () => {
    isTrustedSameOrigin.mockReturnValue(false);

    const { POST } = await import("@/app/api/analyze/route");
    const request = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ formData: {} }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(403);
  });

  it("returns 401 for missing session", async () => {
    isTrustedSameOrigin.mockReturnValue(true);
    verifySessionFromRequest.mockResolvedValue(null);

    const { POST } = await import("@/app/api/analyze/route");
    const request = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ formData: {} }),
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it("returns 400 for invalid payload shape", async () => {
    isTrustedSameOrigin.mockReturnValue(true);
    verifySessionFromRequest.mockResolvedValue({ uid: "user-1" });
    enforceRateLimit.mockResolvedValue({ allowed: true, remaining: 1, retryAfterSeconds: 60 });

    const { POST } = await import("@/app/api/analyze/route");
    const request = new NextRequest("http://localhost:3000/api/analyze", {
      method: "POST",
      body: JSON.stringify({ formData: { name: "A" } }),
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });
});
