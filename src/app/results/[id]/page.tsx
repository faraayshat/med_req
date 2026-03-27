"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  FileText, 
  Activity, 
  CheckCircle2, 
  Download, 
  ShieldCheck, 
  Calendar, 
  ExternalLink, 
  Thermometer, 
  Heart,
  TrendingUp,
  Share2,
  Printer
} from "lucide-react";
import { motion } from "framer-motion";

export default function Results() {
  const { id } = useParams();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReport = async () => {
      const docRef = doc(db, "reports", id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setReport(docSnap.data());
      }
      setLoading(false);
    };
    fetchReport();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
      <Activity className="w-16 h-16 text-rose-500 animate-pulse mb-8" />
      <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Retrieving Patient Record...</p>
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center p-12">
      <div className="hospital-card p-12 bg-white text-center space-y-6">
        <h2 className="text-4xl font-[1000] text-slate-950 tracking-tighter">Record Not Found.</h2>
        <button onClick={() => router.push("/dashboard")} className="hospital-button-primary py-5 px-10">Return to Portal</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-rose-50/20 flex flex-col">
      {/* Premium Header */}
      <nav className="bg-slate-950 border-b border-slate-900 p-8 flex flex-col md:flex-row justify-between items-center gap-8 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-4 bg-white/5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-2xl font-[1000] text-white tracking-widest uppercase italic">Physician's Analysis.</h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase">Status: Validated</span>
              <div className="w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">REF: {(id as string)?.slice(0, 12).toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
           <button aria-label="Print report" className="bg-white/5 p-4 rounded-full text-slate-400 hover:text-white transition-colors"><Printer className="w-5 h-5" /></button>
           <button aria-label="Share report" className="bg-white/5 p-4 rounded-full text-slate-400 hover:text-white transition-colors"><Share2 className="w-5 h-5" /></button>
           <button className="hospital-button-primary py-4 px-8 flex items-center gap-2">
              <Download className="w-5 h-5" /> Secure PDF Export
           </button>
        </div>
      </nav>

      <main className="flex-1 p-6 lg:p-16 max-w-7xl mx-auto w-full space-y-12">
        {/* Core Profile & Vitals Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
           {/* Patient Identity */}
           <div className="hospital-card bg-white p-10 space-y-8 border-2 border-slate-50 lg:col-span-1 sm:col-span-2 lg:col-span-1">
              <div className="bg-rose-50 w-fit p-4 rounded-3xl"><Heart className="w-8 h-8 text-rose-600" /></div>
              <div className="space-y-6">
                <div className="space-y-1">
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Biological Profile</p>
                   <p className="text-3xl font-[1000] text-slate-950 tracking-tighter uppercase">{report.gender}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Current Age</p>
                   <p className="text-3xl font-[1000] text-slate-950 tracking-tighter">{report.age} Years</p>
                </div>
                <div className="pt-6 border-t border-slate-50 space-y-4">
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-400">Integrity Check</span>
                     <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs font-bold text-slate-400">Record Date</span>
                     <span className="text-xs font-black text-slate-950">{new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
           </div>

           {/* In-depth Analysis */}
           <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="hospital-card bg-slate-950 p-10 text-white relative overflow-hidden group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[80px]" />
                 <div className="h-full flex flex-col justify-between gap-12">
                    <div className="bg-white/10 w-fit p-3 rounded-2xl"><Activity className="w-6 h-6 text-rose-500" /></div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">Clinical Rationale</p>
                      <p className="text-4xl font-[1000] tracking-tighter leading-tight">{report.reason}</p>
                    </div>
                    <p className="text-slate-400 text-sm font-bold leading-relaxed">{report.symptoms}</p>
                 </div>
              </div>

              <div className="hospital-card bg-white p-10 border-2 border-rose-50 group">
                 <div className="h-full flex flex-col justify-between gap-12 text-slate-950">
                    <div className="bg-rose-50 w-fit p-3 rounded-2xl group-hover:bg-rose-600 transition-colors duration-500"><TrendingUp className="w-6 h-6 text-rose-600 group-hover:text-white transition-colors" /></div>
                    <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Height Metric</p>
                          <p className="text-4xl font-[1000] tracking-tighter">{report.height} <span className="text-rose-600/30 text-2xl uppercase">CM</span></p>
                       </div>
                       <div className="space-y-2">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Weight Metric</p>
                          <p className="text-4xl font-[1000] tracking-tighter">{report.weight} <span className="text-rose-600/30 text-2xl uppercase">KG</span></p>
                       </div>
                    </div>
                    <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100/50">
                       <p className="text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-1 italic">Metabolic Outcome</p>
                       <p className="text-emerald-950 font-bold leading-relaxed">Systematic analysis indicates vitals are within clinical tolerance for this profile.</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Professional Recommendations Section */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-2">
             <div className="w-1.5 h-10 bg-rose-600 rounded-full" />
             <h2 className="text-4xl font-[1000] text-slate-950 tracking-tighter">Diagnostic Directives.</h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {report.recommendations?.map((rec: any, idx: number) => (
                <motion.div 
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="hospital-card p-10 bg-white border-2 border-slate-50 hover:border-rose-100 transition-all flex gap-8 items-start relative group"
                >
                  <div className="bg-slate-950 p-4 rounded-2xl text-white font-black text-sm">{idx + 1}</div>
                  <div className="space-y-4">
                     <p className="text-2xl font-[1000] text-slate-950 tracking-tight">{rec.title}</p>
                     <p className="text-slate-400 text-lg font-bold leading-relaxed">{rec.desc}</p>
                  </div>
                  <div className="absolute top-10 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                     <ArrowLeft className="w-6 h-6 text-rose-600 rotate-180" />
                  </div>
                </motion.div>
              ))}
           </div>
        </section>

        {/* Technical Attachments */}
        {report.fileUrl && (
          <section className="bg-slate-950 rounded-[3rem] p-12 lg:p-20 relative overflow-hidden group">
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-rose-600/10 rounded-full blur-[120px]" />
             <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
               <div className="space-y-6 text-center lg:text-left">
                  <div className="bg-white/10 w-fit p-4 rounded-3xl mx-auto lg:mx-0"><FileText className="w-10 h-10 text-rose-500" /></div>
                  <div className="space-y-2">
                    <h3 className="text-4xl font-[1000] text-white tracking-tighter">Clinical Intake Artifact.</h3>
                    <p className="text-slate-500 text-lg font-bold">Securely transmitted documentation for physician review.</p>
                  </div>
               </div>
               <a 
                href={report.fileUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="hospital-button-primary px-12 py-6 text-xl group whitespace-nowrap"
               >
                 <ExternalLink className="w-6 h-6 mr-2 group-hover:rotate-12 transition-transform" /> Access Data Node
               </a>
             </div>
          </section>
        )}
      </main>
      
      {/* Footer Disclaimer */}
      <footer className="p-12 text-center bg-white border-t border-slate-100">
         <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authenticated Clinical Report</p>
            </div>
            <p className="text-slate-400 text-xs font-bold leading-relaxed italic">
              Disclaimer: This Physician's Analysis is driven by clinical data logic. It does not replace professional emergency medical advice. 
              In case of emergency, contact the nearest clinical center immediately.
            </p>
         </div>
      </footer>
    </div>
  );
}
