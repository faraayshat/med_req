"use client";

import { useState } from "react";
import { auth, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  Dna, 
  User, 
  Activity, 
  MessageSquare, 
  Loader2, 
  CheckCircle2, 
  ShieldCheck, 
  Heart,
  ChevronRight,
  ChevronLeft,
  Zap,
  ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Unified Clinical Assessment"];

export default function NewReport() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    height: "",
    weight: "",
    reason: "",
    symptoms: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    setLoading(true);

    try {
      let fileUrl = "";
      if (file) {
        const fileRef = ref(storage, `medical-files/${auth.currentUser.uid}/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        fileUrl = await getDownloadURL(fileRef);
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.currentUser.uid,
          formData,
          fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Clinical transmission failed.");
      }

      const result = await response.json();
      router.push(`/results/${result.id}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Portal failure: Transmission interrupted.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-rose-50/20 flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-100 p-6 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.push("/dashboard")}
            className="p-3 bg-slate-50 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="space-y-1">
            <h1 className="text-xl font-[1000] text-slate-950 tracking-tight uppercase">Ingestion Portal</h1>
            <p className="text-[10px] font-black text-rose-500 tracking-[0.2em] uppercase">Clinical Data Processing</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <ShieldCheck className="w-5 h-5 text-emerald-500" />
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TLS 1.3 Encryption Active</span>
        </div>
      </nav>

      <div className="flex-1 w-full flex flex-col items-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Progress Tracker (Sidebar) - Simplified */}
          <div className="lg:col-span-4 space-y-8 sticky top-0 h-fit">
            <div className="bg-slate-950 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden shadow-2xl shadow-slate-200">
               <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 blur-[60px] rounded-full" />
               <div className="space-y-2 relative z-10">
                 <h3 className="text-white text-[10px] font-black uppercase tracking-[0.3em] opacity-50">Protocol Status</h3>
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-sm font-black text-white uppercase tracking-wider italic">Awaiting Transmission</span>
                 </div>
               </div>
               
               <div className="space-y-4 relative z-10 border-t border-white/10 pt-6">
                  <div className="flex gap-4">
                    <div className="bg-white/5 p-2 rounded-lg"><Activity className="w-4 h-4 text-rose-500" /></div>
                    <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Ensure all vitals (Height/Weight) are from recent clinical recordings for precision.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/5 p-2 rounded-lg"><ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                    <p className="text-slate-400 text-[11px] font-medium leading-relaxed">Your data is processed in a HIPAA-compliant environment with AES-256 logic.</p>
                  </div>
               </div>
            </div>

            <div className="bg-white border-slate-100 border p-8 rounded-[2.5rem] space-y-4 shadow-sm">
              <div className="bg-rose-50 w-fit p-3 rounded-2xl"><Dna className="w-6 h-6 text-rose-600" /></div>
              <h4 className="text-xs font-black text-slate-950 uppercase tracking-widest italic">Clinical Logic.</h4>
              <p className="text-slate-500 text-[11px] font-bold leading-relaxed">This ingestion portal synchronizes your physiological telemetry directly with our physician network.</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8">
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white border border-slate-100 rounded-[3rem] p-8 lg:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative space-y-12"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 rounded-full w-fit">
                  <Zap className="w-3 h-3 text-rose-600" />
                  <span className="text-[9px] font-black text-rose-600 uppercase tracking-[0.2em]">Live Clinical Ingestion</span>
                </div>
                <h2 className="text-4xl lg:text-5xl font-[1000] text-slate-950 tracking-tighter italic uppercase">Unified <span className="text-rose-600">Assessment</span>.</h2>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest leading-relaxed">Synchronize your biographic parameters into the healthcare stream.</p>
              </div>

              {/* Step 1: Patient Profile */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white flex items-center justify-center text-xs font-black">01</div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Patient Demographic</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Age</label>
                    <input type="number" name="age" value={formData.age} onChange={handleChange} className="hospital-input w-full p-5 text-sm lg:text-base" placeholder="E.g. 28" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Biological Identity</label>
                    <div className="relative group">
                      <select name="gender" value={formData.gender} onChange={handleChange} className="hospital-input w-full p-5 text-sm lg:text-base appearance-none bg-white">
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Vital Statistics */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">02</div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Vital Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                  <div className="space-y-4 text-rose-600">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Stature (CM)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="hospital-input w-full p-5 border-rose-100 focus:border-rose-400" placeholder="E.g. 175" required />
                  </div>
                  <div className="space-y-4 text-rose-600">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Body Mass (KG)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="hospital-input w-full p-5 border-rose-100 focus:border-rose-400" placeholder="E.g. 70" required />
                  </div>
                </div>
              </div>

              {/* Step 3: Clinical Rationale */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">03</div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Anomaly Rationale</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Consultation Reason</label>
                    <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="hospital-input w-full p-5 text-sm" placeholder="Summarize your visit rationale" required />
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Precise Symptom Manifestation</label>
                    <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="hospital-input w-full p-5 min-h-[120px] text-sm leading-relaxed" placeholder="Logging specific condition metadata..." required />
                  </div>
                </div>
              </div>

              {/* Step 4: Documentation (Optional) */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-black">04</div>
                  <h3 className="text-xs font-black text-slate-950 uppercase tracking-[0.3em]">Clinical Artifacts <span className="text-slate-400 font-medium lowercase italic">(Optional)</span></h3>
                </div>
                <div className="border-4 border-dashed border-rose-50 bg-rose-50/10 rounded-[2.5rem] p-10 text-center group hover:border-rose-200 hover:bg-rose-50/20 transition-all cursor-pointer relative overflow-hidden">
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" aria-label="Upload documentation" />
                  <div className="space-y-6 relative z-10 flex flex-col items-center">
                    <div className={`p-6 rounded-[1.5rem] text-white shadow-xl transition-all group-hover:scale-110 ${file ? 'bg-emerald-500 shadow-emerald-500/20' : 'bg-rose-600 shadow-rose-600/20'}`}>
                      {file ? <CheckCircle2 className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </div>
                    <div>
                      <p className="text-lg font-[1000] text-slate-950 tracking-tight">{file ? file.name : "Secure Artifact Uplink"}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{file ? "Medical Artifact Quantized" : "PDF / DICOM / HL7 Compatible"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-[2.5rem] p-10 flex flex-col sm:flex-row items-center justify-between gap-8 group/footer overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-rose-600/10 blur-[80px] group-hover/footer:bg-rose-600/20 transition-all duration-700" />
                 <div className="flex items-center gap-5 relative z-10">
                   <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md"><ShieldCheck className="w-6 h-6 text-emerald-500" /></div>
                   <div className="space-y-1">
                      <p className="text-white text-[10px] font-[1000] uppercase tracking-[0.2em]">Privacy Protocol Active</p>
                      <p className="text-white/30 text-[9px] font-bold">End-to-End Cryptography Standard</p>
                   </div>
                 </div>
                 <button type="submit" disabled={loading} className="hospital-button-primary w-full sm:w-auto py-5 px-12 text-sm uppercase tracking-[0.2em] font-black group/btn relative z-10 overflow-hidden">
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : file ? "Synchronize with Artifacts" : "Analyze Bio-Streams"}
                 </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}

