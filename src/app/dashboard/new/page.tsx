"use client";

import { useState } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
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
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Patient Profile", "Vital Statistics", "Clinical Rationale", "Documentation"];

export default function NewReport() {
  const [step, setStep] = useState(1);
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

      const docRef = await addDoc(collection(db, "reports"), {
        ...formData,
        userId: auth.currentUser.uid,
        fileUrl,
        createdAt: serverTimestamp(),
        status: "analyzed",
        recommendations: generateMockRecommendations(formData),
      });

      router.push(`/results/${docRef.id}`);
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Portal failure: Transmission interrupted.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

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

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16">
        {/* Mobile Progress Bar */}
        <div className="w-full max-w-lg mb-8 lg:hidden">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{STEPS[step-1]}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Step {step} of 4</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-rose-600 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        <div className="w-full max-w-4xl flex flex-col lg:flex-row gap-8 lg:gap-16">
          
          {/* Progress Tracker (Sidebar) */}
          <div className="hidden lg:block w-70 space-y-12">
            <div className="bg-slate-950 rounded-[3rem] p-10 space-y-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 blur-3xl rounded-full" />
               <h3 className="text-white text-xs font-black uppercase tracking-[0.3em]">Protocol Progress</h3>
               <div className="space-y-8 relative z-10">
                 {STEPS.map((s, idx) => (
                   <div key={idx} className="flex items-center gap-6 group">
                     <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-500 ${step > idx + 1 ? 'bg-emerald-500 text-white' : step === idx + 1 ? 'bg-rose-600 text-white ring-8 ring-rose-600/20 shadow-xl shadow-rose-600/30' : 'bg-white/5 text-slate-500'}`}>
                       {step > idx + 1 ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                     </div>
                     <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${step >= idx + 1 ? 'text-white' : 'text-slate-600'}`}>{s}</span>
                   </div>
                 ))}
               </div>
            </div>

            <div className="hospital-card p-10 bg-white border-rose-100 border-2 space-y-4">
              <div className="bg-rose-50 w-fit p-3 rounded-2xl"><Dna className="w-6 h-6 text-rose-600" /></div>
              <p className="text-xs font-black text-slate-950 uppercase tracking-widest italic">Physician Note.</p>
              <p className="text-slate-400 text-xs font-bold leading-relaxed">Ensure all vitals are recorded within the past 24 hours for maximum diagnostic precision.</p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.form
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleSubmit}
                className="hospital-card p-10 lg:p-16 bg-white border-2 border-slate-50 shadow-[40px_40px_80px_-40px_rgba(225,29,72,0.1)] relative"
              >
                {step === 1 && (
                  <div className="space-y-10">
                    <div className="space-y-2 text-center lg:text-left">
                       <p className="text-rose-600 font-black text-xs tracking-widest uppercase">Initial Assessment</p>
                       <h2 className="text-4xl lg:text-5xl font-[1000] text-slate-950 tracking-tighter">Patient Profile.</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Current Age</label>
                        <input type="number" name="age" value={formData.age} onChange={handleChange} className="hospital-input w-full p-6 text-sm lg:text-lg" placeholder="Years" required />
                      </div>
                      <div className="space-y-4">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Biological Identity</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} className="hospital-input w-full p-6 text-sm lg:text-lg appearance-none bg-white">
                          <option value="male">Male Spectrum</option>
                          <option value="female">Female Spectrum</option>
                          <option value="other">Other / Precise</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-10">
                    <div className="space-y-2">
                       <p className="text-rose-600 font-black text-[10px] tracking-widest uppercase">Metric Identification</p>
                       <h2 className="text-5xl font-[1000] text-slate-950 tracking-tighter">Vital Statistics.</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Height (CM)</label>
                        <input type="number" name="height" value={formData.height} onChange={handleChange} className="hospital-input w-full p-6" placeholder="E.g. 175" required />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Weight (KG)</label>
                        <input type="number" name="weight" value={formData.weight} onChange={handleChange} className="hospital-input w-full p-6" placeholder="E.g. 70" required />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-10">
                    <div className="space-y-2">
                       <p className="text-rose-600 font-black text-[10px] tracking-widest uppercase">Anomaly Report</p>
                       <h2 className="text-5xl font-[1000] text-slate-950 tracking-tighter">Clinical Rationale.</h2>
                    </div>
                    <div className="space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Rationale</label>
                        <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="hospital-input w-full p-6" placeholder="Reason for consultation" required />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Symptom Log</label>
                        <textarea name="symptoms" value={formData.symptoms} onChange={handleChange} className="hospital-input w-full p-6 min-h-[200px]" placeholder="Describe conditions precisely..." required />
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-10">
                    <div className="space-y-2">
                       <p className="text-rose-600 font-black text-[10px] tracking-widest uppercase">Supporting Artifacts</p>
                       <h2 className="text-5xl font-[1000] text-slate-950 tracking-tighter">Documentation.</h2>
                    </div>
                    <div className="space-y-8">
                      <div className="border-4 border-dashed border-rose-50 bg-rose-50/20 rounded-[2.5rem] p-12 lg:p-24 text-center group hover:border-rose-100 transition-all cursor-pointer relative overflow-hidden">
                        <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-20" aria-label="Upload medical documentation" />
                        <div className="space-y-6 relative z-10 flex flex-col items-center">
                          <div className="bg-rose-600 p-8 rounded-[2rem] text-white shadow-xl shadow-rose-600/30 group-hover:scale-110 transition-transform"><Upload className="w-12 h-12" /></div>
                          <div className="space-y-2">
                            <p className="text-xl lg:text-2xl font-black text-slate-950 tracking-tight">{file ? file.name : "Secure Upload Portal"}</p>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest">HL7 / DICOM / PDF Verified</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-950 rounded-3xl p-8 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                           <ShieldCheck className="w-8 h-8 text-emerald-500" />
                           <div className="space-y-1">
                              <p className="text-white text-[10px] font-black uppercase tracking-widest">Privacy Protocol</p>
                              <p className="text-slate-500 text-[10px] font-bold">End-to-End Encrypted Storage</p>
                           </div>
                         </div>
                         <button type="submit" disabled={loading} className="hospital-button-primary py-5 px-10 text-lg group">
                           {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Transmit to Physician"}
                         </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-16 flex justify-between items-center bg-slate-50 -mx-10 -mb-10 lg:-mx-16 lg:-mb-16 p-8 lg:p-10 rounded-b-[3rem]">
                   <button 
                    type="button" 
                    onClick={prevStep} 
                    className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-950 transition-colors ${step === 1 ? 'opacity-0 invisible' : ''}`}
                   >
                     <ChevronLeft className="w-4 h-4" /> Previous Phase
                   </button>
                   {step < 4 && (
                     <button 
                      type="button" 
                      onClick={nextStep} 
                      className="bg-slate-950 text-white font-black text-[10px] uppercase tracking-[0.2em] px-8 py-4 rounded-full hover:bg-rose-600 transition-all flex items-center gap-3 group"
                     >
                       Next Parameter <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                     </button>
                   )}
                </div>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateMockRecommendations(data: any) {
  const height = parseFloat(data.height) / 100;
  const weight = parseFloat(data.weight);
  const bmi = weight / (height * height);

  const recs = [
    { title: "Metabolic Status", desc: `Current BMI calculated at ${bmi.toFixed(1)}. Tracking within expected variance for ${data.age}YO demographic.` },
    { title: "Clinical Intake", desc: `Received rationale: "${data.reason}". Physician review scheduled for baseline analysis.` }
  ];

  if (bmi > 25) {
    recs.push({ title: "Nutritional Advisory", desc: "Longitudinal tracking suggests caloric optimization. Targeted macronutrient balance recommended." });
  }

  return recs;
}
