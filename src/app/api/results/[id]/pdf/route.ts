import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { adminDb } from "@/lib/firebase-admin";
import { verifySessionFromRequest } from "@/lib/auth-server";
import { secureApiHeaders } from "@/lib/request-security";

function buildPdfBuffer(reportId: string, report: Record<string, unknown>): ArrayBuffer {
  const pdf = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const marginLeft = 40;
  const lineHeight = 16;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pdf.internal.pageSize.getWidth() - marginLeft * 2;
  let y = 50;

  const addLine = (text: string, fontSize = 11) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, contentWidth) as string[];

    for (const line of lines) {
      if (y > pageHeight - 50) {
        pdf.addPage();
        y = 50;
      }
      pdf.text(line, marginLeft, y);
      y += lineHeight;
    }
  };

  const name = String(report.name || "Patient");
  const reason = String(report.reason || "N/A");
  const symptoms = String(report.symptoms || "N/A");
  const bmi = String(report.bmi || "N/A");
  const bmiStatus = String(report.bmiStatus || "N/A");
  const status = String(report.status || "pending");

  addLine("Health Analysis Report", 18);
  y += 8;
  addLine(`Report ID: ${reportId}`);
  addLine(`Patient: ${name}`);
  addLine(`Status: ${status}`);
  y += 8;

  addLine("Reason for Assessment", 13);
  addLine(reason);
  y += 6;

  addLine("Symptoms", 13);
  addLine(symptoms);
  y += 6;

  addLine("Body Metrics", 13);
  addLine(`BMI: ${bmi} (${bmiStatus})`);
  y += 6;

  const recommendations = Array.isArray(report.recommendations)
    ? (report.recommendations as Array<Record<string, unknown>>)
    : [];

  addLine("Recommendations", 13);
  if (recommendations.length === 0) {
    addLine("No recommendations yet.");
  } else {
    recommendations.forEach((item, index) => {
      const title = String(item.title || `Recommendation ${index + 1}`);
      const desc = String(item.desc || "");
      const confidence = item.confidence !== undefined ? `${item.confidence}%` : "N/A";
      addLine(`${index + 1}. ${title}`);
      addLine(`Confidence: ${confidence}`, 10);
      if (desc) {
        addLine(desc, 10);
      }
      y += 4;
    });
  }

  return pdf.output("arraybuffer");
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

  const pdfBuffer = buildPdfBuffer(id, report);

  return new NextResponse(new Blob([pdfBuffer], { type: "application/pdf" }), {
    status: 200,
    headers: {
      ...secureApiHeaders(),
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename=HealthReport-${id.slice(0, 8)}.pdf`,
    },
  });
}
