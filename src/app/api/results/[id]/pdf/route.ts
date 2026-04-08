import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import { adminDb } from "@/lib/firebase-admin";
import { verifySessionFromRequest } from "@/lib/auth-server";
import { secureApiHeaders } from "@/lib/request-security";

type GenericRecord = Record<string, unknown>;

function toDisplayText(value: unknown, fallback = "N/A"): string {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
}

function toDisplayNumber(value: unknown, fallback = "N/A"): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return Number.isInteger(parsed) ? String(parsed) : parsed.toFixed(1);
    }
  }
  return fallback;
}

function createdAtLabel(report: GenericRecord): string {
  const createdAt = report.createdAt as { toDate?: () => Date; seconds?: number } | undefined;
  if (createdAt?.toDate) {
    return createdAt.toDate().toLocaleString();
  }
  if (typeof createdAt?.seconds === "number") {
    return new Date(createdAt.seconds * 1000).toLocaleString();
  }
  return new Date().toLocaleString();
}

function buildPdfBuffer(reportId: string, report: Record<string, unknown>): ArrayBuffer {
  const pdf = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const marginLeft = 44;
  const topMargin = 44;
  const lineHeight = 15;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - marginLeft * 2;
  let y = topMargin;

  const ensureSpace = (requiredHeight: number) => {
    if (y + requiredHeight <= pageHeight - 42) {
      return;
    }
    pdf.addPage();
    y = topMargin;
  };

  const drawHeader = () => {
    pdf.setFillColor(13, 71, 161);
    pdf.rect(0, 0, pageWidth, 84, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(20);
    pdf.text("MedReq", marginLeft, 34);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(11);
    pdf.text("Medical Assessment Report", marginLeft, 52);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(`Report ID: ${reportId.slice(0, 12).toUpperCase()}`, pageWidth - marginLeft - 180, 34);
    pdf.text(`Generated: ${createdAtLabel(report)}`, pageWidth - marginLeft - 180, 52);

    pdf.setTextColor(22, 28, 45);
    y = 108;
  };

  const drawSectionTitle = (title: string) => {
    ensureSpace(28);
    pdf.setFillColor(236, 245, 255);
    pdf.roundedRect(marginLeft, y - 12, contentWidth, 20, 4, 4, "F");
    pdf.setTextColor(16, 72, 131);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text(title, marginLeft + 10, y + 2);
    pdf.setTextColor(22, 28, 45);
    y += 24;
  };

  const addLine = (text: string, fontSize = 11) => {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, contentWidth) as string[];

    for (const line of lines) {
      ensureSpace(lineHeight + 2);
      pdf.text(line, marginLeft, y);
      y += lineHeight;
    }
  };

  const addKeyValue = (label: string, value: string) => {
    ensureSpace(18);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(86, 97, 118);
    pdf.text(`${label}:`, marginLeft, y);

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(22, 28, 45);
    pdf.text(value, marginLeft + 112, y);
    y += 16;
  };

  const drawFooter = () => {
    const pages = pdf.getNumberOfPages();
    for (let page = 1; page <= pages; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(224, 231, 255);
      pdf.line(marginLeft, pageHeight - 30, pageWidth - marginLeft, pageHeight - 30);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(102, 112, 133);
      pdf.text("MedReq clinical output is informational and not a diagnosis.", marginLeft, pageHeight - 18);
      pdf.text(`Page ${page} of ${pages}`, pageWidth - marginLeft - 52, pageHeight - 18);
    }
  };

  const name = toDisplayText(report.name, "Patient");
  const status = toDisplayText(report.status, "pending").toUpperCase();
  const reason = toDisplayText(report.reason);
  const symptoms = toDisplayText(report.symptoms);
  const age = toDisplayNumber(report.age);
  const gender = toDisplayText(report.gender);
  const height = toDisplayNumber(report.height);
  const weight = toDisplayNumber(report.weight);
  const temperature = toDisplayNumber(report.temperature);
  const heartRate = toDisplayNumber(report.heartRate);
  const bloodPressure = toDisplayText(report.bloodPressure);
  const bloodOxygen = toDisplayNumber(report.bloodOxygen);
  const bmi = toDisplayNumber(report.bmi);
  const bmiStatus = toDisplayText(report.bmiStatus);
  const overallConfidence = toDisplayNumber(report.overallConfidence);

  drawHeader();

  drawSectionTitle("Patient Profile");
  addKeyValue("Patient Name", name);
  addKeyValue("Age", age === "N/A" ? age : `${age} years`);
  addKeyValue("Gender", gender);
  addKeyValue("Report Status", status);
  y += 4;

  drawSectionTitle("Vitals And Measurements");
  addKeyValue("Height", height === "N/A" ? height : `${height} cm`);
  addKeyValue("Weight", weight === "N/A" ? weight : `${weight} kg`);
  addKeyValue("Temperature", temperature === "N/A" ? temperature : `${temperature} F`);
  addKeyValue("Heart Rate", heartRate === "N/A" ? heartRate : `${heartRate} bpm`);
  addKeyValue("Blood Pressure", bloodPressure);
  addKeyValue("Blood Oxygen", bloodOxygen === "N/A" ? bloodOxygen : `${bloodOxygen}%`);
  addKeyValue("BMI", bmi === "N/A" ? bmi : `${bmi} (${bmiStatus})`);
  y += 4;

  drawSectionTitle("Clinical Intake");
  addLine(`Reason for assessment: ${reason}`);
  y += 2;
  addLine(`Symptoms: ${symptoms}`);
  y += 4;

  drawSectionTitle("Analysis Summary");
  addKeyValue("Overall Confidence", overallConfidence === "N/A" ? overallConfidence : `${overallConfidence}%`);

  const recommendations = Array.isArray(report.recommendations)
    ? (report.recommendations as Array<unknown>)
    : [];

  drawSectionTitle("Recommendations");
  if (recommendations.length === 0) {
    addLine("No recommendations are available for this report.");
  } else {
    recommendations.forEach((item, index) => {
      const recommendation = typeof item === "object" && item !== null ? (item as GenericRecord) : {};
      const title = toDisplayText(recommendation.title, `Recommendation ${index + 1}`);
      const desc = toDisplayText(recommendation.desc, "");
      const medication = toDisplayText(recommendation.medication, "");
      const confidence = toDisplayNumber(recommendation.confidence, "N/A");

      ensureSpace(40);
      pdf.setDrawColor(228, 233, 245);
      pdf.roundedRect(marginLeft, y - 10, contentWidth, 52, 6, 6, "S");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.setTextColor(22, 28, 45);
      pdf.text(`${index + 1}. ${title}`, marginLeft + 10, y + 6);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);
      pdf.setTextColor(72, 84, 104);
      pdf.text(`Confidence: ${confidence === "N/A" ? confidence : `${confidence}%`}`, marginLeft + 10, y + 22);

      if (medication) {
        pdf.text(`Medication guidance: ${medication}`, marginLeft + 10, y + 36);
      }

      y += 58;

      if (desc) {
        addLine(desc, 10);
        y += 2;
      }

      const citations = Array.isArray(recommendation.citations)
        ? (recommendation.citations as Array<unknown>)
        : [];

      if (citations.length > 0) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(10);
        pdf.setTextColor(86, 97, 118);
        ensureSpace(18);
        pdf.text("Evidence:", marginLeft, y);
        y += 14;

        citations.forEach((citation) => {
          const citationRecord = typeof citation === "object" && citation !== null
            ? (citation as GenericRecord)
            : {};
          const publisher = toDisplayText(citationRecord.publisher, "Source");
          const titleText = toDisplayText(citationRecord.title, "Untitled");
          const url = toDisplayText(citationRecord.url, "");
          addLine(`- ${publisher}: ${titleText}${url ? ` (${url})` : ""}`, 9);
        });
      }

      y += 6;
    });
  }

  drawFooter();

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
