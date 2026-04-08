"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useSearchParams } from "next/navigation";
import { 
  FileText, 
  Activity, 
  Download, 
  ShieldCheck, 
  ExternalLink, 
  Loader2,
  Info,
  ArrowLeft,
  Share2,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";
import jsPDF from "jspdf";
import * as htmlToImage from 'html-to-image';

export default function Results() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [status, setStatus] = useState<string>("pending");
  const [cachedPdf, setCachedPdf] = useState<File | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [retryTriggered, setRetryTriggered] = useState(false);

  const generatePdfFile = async () => {
    if (cachedPdf) {
      return cachedPdf;
    }

    const element = document.getElementById("report-content");
    if (!element) {
      throw new Error("Report content is unavailable");
    }

    const dataUrl = await htmlToImage.toPng(element, {
      quality: 0.8,
      backgroundColor: "#f8fafc",
      style: { colorScheme: "light" },
      pixelRatio: 1.5,
    });

    const pdf = new jsPDF("p", "mm", "a4", true);
    const pdfWidth = pdf.internal.pageSize.getWidth();

    const img = new Image();
    img.src = dataUrl;
    await new Promise((resolve) => (img.onload = resolve));

    const pdfHeight = (img.height * pdfWidth) / img.width;
    pdf.addImage(dataUrl, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

    const fileName = `HealthReport-${(report?.name || "Patient").replace(/\s+/g, "_")}.pdf`;
    const blob = pdf.output("blob");
    const file = new File([blob], fileName, { type: "application/pdf" });
    setCachedPdf(file);
    return file;
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`/api/results/${id as string}/pdf`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Server PDF generation failed");
      }

      const serverBlob = await response.blob();
      const fileName = `HealthReport-${(report?.name || "Patient").replace(/\s+/g, "_")}.pdf`;
      const url = URL.createObjectURL(serverBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Server PDF generation failed, using client fallback:", err);
      try {
        const pdfFile = await generatePdfFile();
        const url = URL.createObjectURL(pdfFile);
        const a = document.createElement("a");
        a.href = url;
        a.download = pdfFile.name;
        a.click();
        URL.revokeObjectURL(url);
      } catch (fallbackError) {
        console.error("PDF fallback failed:", fallbackError);
      }
    } finally {
      setDownloading(false);
    }
  };

  const shareReport = async () => {
    try {
      let file: File;

      try {
        const response = await fetch(`/api/results/${id as string}/pdf`, {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Server PDF generation failed");
        }

        const blob = await response.blob();
        const fileName = `HealthReport-${(report?.name || "Patient").replace(/\s+/g, "_")}.pdf`;
        file = new File([blob], fileName, { type: "application/pdf" });
      } catch {
        file = await generatePdfFile();
      }

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Health Analysis Report',
          text: `Medical assessment report (Ref: ${(id as string).slice(0, 8).toUpperCase()})`,
        });
      } else {
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Sharing failed", err);
    }
  };

  useEffect(() => {
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let elapsedTimer: ReturnType<typeof setInterval> | null = null;

    const fetchReport = async () => {
      try {
        const docRef = doc(db, "reports", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setReport(data);
          setStatus(data.status || "pending");

          const createdMs = data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now();
          setElapsedSeconds(Math.max(0, Math.floor((Date.now() - createdMs) / 1000)));

          if ((data.status || "pending") === "pending" && !pollTimer) {
            pollTimer = setInterval(fetchReport, 4000);
          }
          if ((data.status || "pending") !== "pending" && pollTimer) {
            clearInterval(pollTimer);
            pollTimer = null;
          }
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();

    if (searchParams.get("pending") === "1") {
      pollTimer = setInterval(fetchReport, 4000);
      elapsedTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (pollTimer) {
        clearInterval(pollTimer);
      }
      if (elapsedTimer) {
        clearInterval(elapsedTimer);
      }
    };
  }, [id, searchParams]);

  useEffect(() => {
    if (status !== "pending" || retryTriggered || elapsedSeconds < 25) {
      return;
    }

    const wakeWorker = async () => {
      try {
        await fetch("/api/analyze/retry", {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });
      } finally {
        setRetryTriggered(true);
      }
    };

    void wakeWorker();
  }, [status, elapsedSeconds, retryTriggered]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        <Sidebar activePath="/dashboard/records" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
            <p className="text-slate-500 font-medium">Preparing health report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        <Sidebar activePath="/dashboard/records" />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 text-center space-y-6 max-w-md shadow-sm">
            <div className="bg-rose-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
              <Activity className="w-10 h-10 text-rose-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Report Not Found</h2>
              <p className="text-slate-500 text-sm leading-relaxed">We couldn't locate the health assessment you're looking for. It may have been removed or has not been processed yet.</p>
            </div>
            <Link href="/dashboard" className="hospital-button-primary w-full py-4 text-center text-sm font-bold block">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar activePath="/dashboard/records" />
      
      <div className="flex-1 w-full p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <Link 
                href="/dashboard/records" 
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors bg-white border border-slate-200 w-fit px-3 py-1.5 rounded-full"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Records
              </Link>
              <div className="space-y-2">
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">{status === "pending" ? "Assessment Pending" : "Assessment Complete"}</span>
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Health Analysis Report</h1>
                <p className="text-slate-500 text-sm font-medium">Reference ID: <span className="text-slate-900 font-bold">{(id as string)?.slice(0, 8).toUpperCase()}</span> • {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={downloadPDF}
                disabled={downloading || status === "pending"}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all shadow-sm disabled:opacity-50"
              >
                {downloading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {downloading ? "Generating..." : "Download PDF"}
              </button>
              <button 
                onClick={shareReport}
                disabled={status === "pending"}
                className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl text-xs font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-200 disabled:opacity-50"
              >
                <Share2 className="w-4 h-4" />
                Share Report
              </button>
            </div>
          </div>

          {status === "pending" && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
              <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
              <p className="text-xs font-semibold text-amber-700">
                Analysis is still running. Typical setup time is 10-45 seconds. Elapsed: {elapsedSeconds}s.
                {elapsedSeconds > 45 ? " Processing is taking longer than usual; worker wake-up retry has been triggered." : " This page auto-refreshes every few seconds."}
              </p>
            </div>
          )}

          <div id="report-content" className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-1">
            
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                    {report.gender === 'male' ? 'M' : report.gender === 'female' ? 'F' : 'O'}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Profile</p>
                    <h3 className="text-lg font-bold text-slate-900 capitalize">{report.name || report.gender}, {report.age} Years</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Height</p>
                    <p className="text-sm font-bold text-slate-900">{report.height} cm</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                    <p className="text-sm font-bold text-slate-900">{report.weight} kg</p>
                  </div>
                </div>
              </div>

              <div className="bg-rose-500 rounded-[2rem] p-8 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Body Mass Index (BMI)</p>
                    <Activity className="w-4 h-4 opacity-80" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-5xl font-black">{report.bmi}</h2>
                    <span className="text-xs font-bold uppercase opacity-80">kg/m²</span>
                  </div>
                  <div className="py-2 px-4 bg-white/20 backdrop-blur-md rounded-xl w-fit">
                    <p className="text-[10px] font-bold uppercase">{report.bmiStatus}</p>
                  </div>
                </div>
              </div>

              {report.fileUrl && (
                <a href={report.fileUrl} target="_blank" rel="noopener noreferrer" className="block bg-slate-900 rounded-[2rem] p-8 text-white group hover:bg-slate-800 transition-colors shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div className="bg-white/10 p-3 rounded-xl"><FileText className="w-6 h-6 text-rose-500" /></div>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold mb-2">Attached Prescription</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Past medical document or doctor's prescription uploaded for review.</p>
                </a>
              )}
            </div>

            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-900">Current Health Analysis</h3>
                  <div className="h-1 w-12 bg-rose-500 rounded-full" />
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Reason for Assessment</h4>
                    <p className="text-slate-600 text-sm leading-relaxed italic">"{report.reason}"</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Symptoms Described</h4>
                    <p className="text-slate-600 text-sm leading-relaxed">{report.symptoms}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Health Suggestions</h3>
                    <div className="h-1 w-12 bg-emerald-500 rounded-full" />
                  </div>
                  <div className="bg-emerald-50 px-4 py-2 rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Safety Verified</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {(report.recommendations && Array.isArray(report.recommendations)) ? report.recommendations.map((rec: any, i: number) => {
                    const title = typeof rec === 'string' ? rec : (rec.title || "Recommendation");
                    const desc = typeof rec === 'object' ? rec.desc : "";
                    const medication = typeof rec === 'object' ? rec.medication : null;
                    const confidence = typeof rec === 'object' ? rec.confidence : null;
                    const citations = typeof rec === 'object' && Array.isArray(rec.citations) ? rec.citations : [];
                    
                    return (
                      <div key={i} className="group p-8 rounded-[2.5rem] border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-300 flex flex-col gap-5 shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-black shrink-0 border border-emerald-100/50">
                              {i + 1}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">{title}</h4>
                              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{desc}</p>
                            </div>
                          </div>
                          {confidence && (
                            <div className="flex flex-col items-end gap-1">
                              <div className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest leading-none">
                                {confidence}% Confidence
                              </div>
                              <p className="text-[8px] font-bold text-slate-400 tracking-tighter uppercase px-1">Confidence Score</p>
                            </div>
                          )}
                        </div>

                        {medication && (
                          <div className="bg-white border-2 border-emerald-50 rounded-3xl p-6 flex items-start gap-4 shadow-sm group-hover:border-emerald-100 transition-colors">
                            <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-lg shadow-emerald-100 mt-0.5">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="space-y-1.5 flex-1">
                              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Diagnostic Lead & Therapeutics</p>
                              <p className="text-sm font-bold text-slate-900 leading-snug">{medication}</p>
                              <p className="text-[10px] text-slate-400 font-medium italic">Consult a licensed physician before consuming any medication.</p>
                            </div>
                          </div>
                        )}

                        {citations.length > 0 && (
                          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Evidence Sources</p>
                            <div className="space-y-1.5">
                              {citations.map((citation: any, citationIndex: number) => (
                                <a
                                  key={`${i}-${citationIndex}`}
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between gap-3 text-xs text-slate-700 hover:text-rose-600 transition-colors"
                                >
                                  <span>{citation.publisher}: {citation.title}</span>
                                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  }) : (
                    <p className="text-slate-400 text-xs italic">Processing suggestions...</p>
                  )}
                </div>
              </div>

              <div className="p-8 bg-slate-100 rounded-3xl border border-slate-200 flex gap-6">
                <div className="bg-white p-3 rounded-2xl h-fit border border-slate-200 shadow-sm"><Info className="w-5 h-5 text-slate-400" /></div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider italic">Important Notice</h4>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                    This health assessment is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a doctor for any medical concerns.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
