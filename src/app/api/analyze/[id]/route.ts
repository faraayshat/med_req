import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifySessionFromRequest } from "@/lib/auth-server";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await verifySessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = await context.params;
  const reportId = params.id;
  const reportSnap = await adminDb.collection("reports").doc(reportId).get();

  if (!reportSnap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const report = reportSnap.data() as { userId: string; status?: string; updatedAt?: unknown; requestId?: string };
  if (report.userId !== session.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(
    {
      id: reportId,
      status: report.status ?? "pending",
      updatedAt: report.updatedAt ?? null,
      requestId: report.requestId ?? null,
    },
    { status: 200 }
  );
}
