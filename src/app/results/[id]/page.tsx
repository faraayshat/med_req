"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { 
  FileText, 
  Activity, 
  Download, 
  ShieldCheck, 
  ExternalLink, 
  Loader2,
  Info,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/dashboard/Sidebar";

export default function Results() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const docRef = doc(db, "reports", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setReport(docSnap.data());
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

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
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Assessment Complete</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Health Analysis Report</h1>
              <p className="text-slate-500 text-sm font-medium">Reference ID: <span className="text-slate-900 font-bold">{(id as string)?.slice(0, 8).toUpperCase()}</span> • {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-2xl text-xs font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200">
                Share with Doctor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Stats & Vitals */}
            <div className="lg:col-span-4 space-y-6">
              {/* Profile Card */}
              <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-bold">
                    {report.gender === 'male' ? 'M' : report.gender === 'female' ? 'F' : 'O'}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User Profile</p>
                    <h3 className="text-lg font-bold text-slate-900 capitalize">{report.gender}, {report.age} Years</h3>
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

              {/* BMI Card */}
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

              {/* Attached Prescription/Record */}
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

            {/* Right Column: Findings & Advice */}
            <div className="lg:col-span-8 space-y-8">
              {/* Analysis Section */}
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

              {/* Recommendations Section */}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(report.recommendations && Array.isArray(report.recommendations)) ? report.recommendations.map((rec: any, i: number) => {
                    const title = typeof rec === 'string' ? rec : (rec.title || "Recommendation");
                    const desc = typeof rec === 'object' ? rec.desc : "";
                    
                    return (
                      <div key={i} className="group p-6 rounded-3xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/10 transition-all duration-300 flex flex-col gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black shrink-0">
                          {i + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{title}</p>
                          {desc && <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>}
                        </div>
                      </div>
                    );
                  }) : (
                    <p className="text-slate-400 text-xs italic">Processing suggestions...</p>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
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
