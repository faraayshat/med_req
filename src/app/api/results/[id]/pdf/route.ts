import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifySessionFromRequest } from "@/lib/auth-server";
import { secureApiHeaders } from "@/lib/request-security";

function buildPdfBuffer(reportId: string, report: Record<string, unknown>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const name = String(report.name || "Patient");
    const reason = String(report.reason || "N/A");
    const symptoms = String(report.symptoms || "N/A");
    const bmi = String(report.bmi || "N/A");
    const bmiStatus = String(report.bmiStatus || "N/A");
    const status = String(report.status || "pending");

    doc.fontSize(20).text("Health Analysis Report", { underline: true });
    doc.moveDown();
    doc.fontSize(11).text(`Report ID: ${reportId}`);
    doc.text(`Patient: ${name}`);
    doc.text(`Status: ${status}`);
    doc.moveDown();

    doc.fontSize(13).text("Reason for Assessment");
    doc.fontSize(11).text(reason);
    doc.moveDown();

    doc.fontSize(13).text("Symptoms");
    doc.fontSize(11).text(symptoms);
    doc.moveDown();

    doc.fontSize(13).text("Body Metrics");
    doc.fontSize(11).text(`BMI: ${bmi} (${bmiStatus})`);
    doc.moveDown();

    const recommendations = Array.isArray(report.recommendations)
      ? (report.recommendations as Array<Record<string, unknown>>)
      : [];

    doc.fontSize(13).text("Recommendations");
    if (recommendations.length === 0) {
      doc.fontSize(11).text("No recommendations yet.");
    } else {
      recommendations.forEach((item, index) => {
        const title = String(item.title || `Recommendation ${index + 1}`);
        const desc = String(item.desc || "");
        const confidence = item.confidence !== undefined ? `${item.confidence}%` : "N/A";

        doc.moveDown(0.5);
        doc.fontSize(11).text(`${index + 1}. ${title}`);
        doc.fontSize(10).text(`Confidence: ${confidence}`);
        if (desc) {
          doc.fontSize(10).text(desc);
        }
      });
    }

    doc.end();
  });
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await verifySessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: secureApiHeaders() });
  }

  const { id } = await context.params;
  const docSnap = await adminDb.collection("reports").doc(id).get();

  if (!docSnap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: secureApiHeaders() });
  }

  const report = docSnap.data() as Record<string, unknown> & { userId?: string };
  if (report.userId !== session.uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403, headers: secureApiHeaders() });
  }

  const pdfBuffer = await buildPdfBuffer(id, report);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      ...secureApiHeaders(),
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename=HealthReport-${id.slice(0, 8)}.pdf`,
    },
  });
}
