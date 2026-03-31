"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
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
import { useAuth } from "@/components/providers/AuthProvider";

const STEPS = ["Unified Clinical Assessment"];

export default function NewReport() {
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male",
    height: "",
    weight: "",
    reason: "",
    symptoms: "",
    heartRate: "",
    bloodOxygen: "",
    temperature: "",
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
    if (!authUser) {
      alert("Authentication required for transmission.");
      return;
    }
    setLoading(true);

    try {
      const idToken = await authUser.getIdToken();
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: authUser.uid,
          formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Clinical transmission failed.");
      }

      const result = await response.json();
      router.push(`/results/${result.id}`);
    } catch (error: any) {
      console.error("Submission failed:", error);
      alert(`Portal failure: ${error.message || "Transmission interrupted."}`);
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
            suppressHydrationWarning
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
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Info Sidebar */}
          <div className="lg:col-span-4 space-y-6 sticky top-0 h-fit">
            <div className="bg-white border-slate-200 border rounded-3xl p-8 space-y-6 shadow-sm">
               <div className="space-y-1">
                 <h3 className="text-slate-900 text-sm font-bold">New Assessment</h3>
                 <p className="text-slate-500 text-xs">Fill in your current health details for analysis.</p>
               </div>
               
               <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="bg-rose-50 p-2 rounded-lg h-fit"><Activity className="w-4 h-4 text-rose-500" /></div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">Please ensure your height and weight are accurate for the best medical insight.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-emerald-50 p-2 rounded-lg h-fit"><ShieldCheck className="w-4 h-4 text-emerald-500" /></div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">Your data is stored securely and only shared with your healthcare provider.</p>
                  </div>
               </div>
            </div>

            <div className="bg-slate-50 border-slate-200 border p-8 rounded-3xl space-y-3">
              <div className="bg-white w-fit p-3 rounded-xl border border-slate-100 shadow-sm"><Dna className="w-5 h-5 text-rose-500" /></div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Medical Standards</h4>
              <p className="text-slate-500 text-[11px] leading-relaxed">We use clinical-grade algorithms to process your information and provide relevant health suggestions.</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-8">
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 lg:p-10 shadow-sm relative space-y-10"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Health Assessment Form</h2>
                <p className="text-slate-500 text-sm">Please provide your details for a personalized medical review.</p>
              </div>

              {/* Patient Profile */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="text-sm font-bold text-slate-800">Basic Information</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30 text-sm" placeholder="Patient Full Name" required suppressHydrationWarning />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Current Age</label>
                      <input type="number" name="age" value={formData.age} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30" placeholder="Years" required suppressHydrationWarning />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Gender</label>
                      <div className="relative">
                        <select name="gender" value={formData.gender} onChange={handleChange} className="hospital-input w-full p-4 appearance-none bg-slate-50/30 border-slate-200 focus:border-rose-500" suppressHydrationWarning>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="text-sm font-bold text-slate-800">Physiological Metrics</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Height (CM)</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30" placeholder="e.g. 175" required suppressHydrationWarning />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Weight (KG)</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30" placeholder="e.g. 70" required suppressHydrationWarning />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1 flex items-center gap-1.5"><Heart className="w-3 h-3 text-rose-500" /> Pulse (BPM)</label>
                    <input type="number" name="heartRate" value={formData.heartRate} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30 text-sm" placeholder="e.g. 72" suppressHydrationWarning />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1 flex items-center gap-1.5"><Zap className="w-3 h-3 text-blue-500" /> SpO2 (%)</label>
                    <input type="number" name="bloodOxygen" value={formData.bloodOxygen} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30 text-sm" placeholder="e.g. 98" suppressHydrationWarning />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1 flex items-center gap-1.5"><Activity className="w-3 h-3 text-emerald-500" /> Temp (°F)</label>
                    <input type="number" step="0.1" name="temperature" value={formData.temperature} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30 text-sm" placeholder="e.g. 98.6" suppressHydrationWarning />
                  </div>
                </div>
              </div>

              {/* Rationale */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="text-sm font-bold text-slate-800">Reason for Visit</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Main Reason</label>
                    <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="hospital-input w-full p-4 border-slate-200 focus:border-rose-500 bg-slate-50/30 text-sm" placeholder="Why are you visiting today?" required suppressHydrationWarning />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600 ml-1">Describe Symptoms</label>
                    <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="hospital-input w-full p-4 min-h-[100px] border-slate-200 focus:border-rose-500 bg-slate-50/30 text-sm leading-relaxed" placeholder="Please list any symptoms you're feeling..." required suppressHydrationWarning />
                  </div>
                </div>
              </div>

              {/* Upload - Disabled for Free Tier (No Storage) */}
              <div className="space-y-6 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">4</div>
                  <h3 className="text-sm font-bold text-slate-800">Past Records or Prescription <span className="text-slate-400 font-normal ml-1">(Unavailable on Free Tier)</span></h3>
                </div>
                <div className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-3xl p-8 text-center cursor-not-allowed relative overflow-hidden">
                  <div className="space-y-4 relative z-10 flex flex-col items-center">
                    <div className="p-5 rounded-2xl bg-slate-200 text-slate-500">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-base font-bold text-slate-800 italic">File Uploading Disabled</p>
                      <p className="text-xs text-slate-500 italic">Connect a Storage Bucket to enable this feature</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                   <div className="bg-white p-2.5 rounded-xl shadow-sm"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div>
                   <div className="space-y-0.5">
                      <p className="text-slate-900 text-[10px] font-bold uppercase tracking-wider">Secure Submission</p>
                      <p className="text-slate-500 text-[9px]">Your data is protected by industry standard encryption.</p>
                   </div>
                 </div>
                 <button type="submit" disabled={loading} className="hospital-button-primary w-full sm:w-auto py-4 px-10 text-sm font-bold group shadow-md shadow-rose-200" suppressHydrationWarning>
                   {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Analyze Health Details"}
                 </button>
              </div>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}

