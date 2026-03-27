"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { 
  ArrowLeft, 
  Upload, 
  User, 
  Calendar, 
  Thermometer, 
  Activity, 
  History,
  FileText,
  AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const formSchema = z.object({
  fullName: z.string().min(2, "Full Name is required"),
  dob: z.string().min(1, "Date of Birth is required"),
  age: z.coerce.number().min(0),
  height: z.coerce.number().min(0, "Height must be positive"),
  weight: z.coerce.number().min(0, "Weight must be positive"),
  symptoms: z.string().min(3, "Please describe your symptoms"),
  medicalHistory: z.string().optional(),
});

export default function NewSubmissionPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    if (!user?.uid) return;
    setUploading(true);

    try {
      let prescriptionUrl = "";
      let reportUrl = "";

      if (prescriptionFile) {
        const pRef = ref(storage, `prescriptions/${user.uid}/${Date.now()}_${prescriptionFile.name}`);
        const snapshot = await uploadBytes(pRef, prescriptionFile);
        prescriptionUrl = await getDownloadURL(snapshot.ref);
      }

      if (reportFile) {
        const rRef = ref(storage, `reports/${user.uid}/${Date.now()}_${reportFile.name}`);
        const snapshot = await uploadBytes(rRef, reportFile);
        reportUrl = await getDownloadURL(snapshot.ref);
      }

      const bmi = data.weight / ((data.height / 100) ** 2);

      const docRef = await addDoc(collection(db, "health_data"), {
        userId: user.uid,
        ...data,
        bmi,
        prescriptionUrl,
        reportUrl,
        createdAt: serverTimestamp(),
      });

      router.push(`/results/${docRef.id}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Submission failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors mb-6 group border-none"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Desk
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <ClipboardList className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight border-none">Patient Assessment</h1>
              <p className="text-slate-500 font-medium">Please provide accurate health details for better analysis.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Basic Info */}
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 border-none">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 border-none">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input 
                      {...register("fullName")} 
                      placeholder="Enter Full Name"
                      className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 bg-white transition-all focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 border-none">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input 
                      type="date" 
                      {...register("dob")} 
                      className="pl-10 w-full border border-slate-200 rounded-xl py-2.5 bg-white transition-all focus:ring-2 focus:ring-primary focus:border-transparent outline-none" 
                    />
                  </div>
                  {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob.message as string}</p>}
                </div>
              </div>
            </div>

            {/* Section 2: Vitals */}
            <div className="bg-slate-50 p-6 rounded-2xl">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6 border-none">Vital Stats</h3>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 border-none">Age</label>
                  <input type="number" {...register("age")} className="w-full border border-slate-200 rounded-xl py-2.5 bg-white transition-all focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 border-none underline-none">Height (cm)</label>
                  <input type="number" step="0.1" {...register("height")} className="w-full border border-slate-200 rounded-xl py-2.5 bg-white transition-all focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 border-none underline-none">Weight (kg)</label>
                  <input type="number" step="0.1" {...register("weight")} className="w-full border border-slate-200 rounded-xl py-2.5 bg-white transition-all focus:ring-2 focus:ring-primary focus:border-transparent outline-none" />
                </div>
              </div>
            </div>

            {/* Symptoms & History */}
            <div className="space-y-6 underline-none">
              <div>
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2 border-none underline-none">
                  <Thermometer className="w-4 h-4" /> Current Symptoms
                </label>
                <textarea 
                  {...register("symptoms")} 
                  className="w-full border border-slate-200 rounded-2xl py-3 px-4 bg-white min-h-[120px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" 
                  placeholder="E.g., Mild fever, headache since 2 days..."
                ></textarea>
                {errors.symptoms && <p className="text-red-500 text-xs mt-1">{errors.symptoms.message as string}</p>}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2 border-none underline-none">
                  <History className="w-4 h-4" /> Medical History
                </label>
                <textarea 
                  {...register("medicalHistory")} 
                  className="w-full border border-slate-200 rounded-2xl py-3 px-4 bg-white min-h-[100px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="List any past chronic illnesses or surgeries..."
                ></textarea>
              </div>
            </div>

            {/* File Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 underline-none">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <label className="text-sm font-bold text-slate-700 block mb-1 border-none underline-none">Prescription</label>
                <input type="file" onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500" />
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:bg-slate-50 transition-colors">
                <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <label className="text-sm font-bold text-slate-700 block mb-1 border-none underline-none">Blood Report</label>
                <input type="file" onChange={(e) => setReportFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-primary text-white font-extrabold rounded-2xl py-4 shadow-xl shadow-blue-100 hover:shadow-blue-200 hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-3 text-lg"
            >
              {uploading ? (
                <>
                  <Activity className="w-6 h-6 animate-spin" />
                  Processing Submission...
                </>
              ) : (
                <>
                  Generate Results
                  <PlusCircle className="w-6 h-6" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Patient Information Form</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Full Name</label>
              <input {...register("fullName")} className="w-full p-2 border rounded" />
              {errors.fullName && <p className="text-red-500 text-xs">{errors.fullName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Date of Birth</label>
              <input type="date" {...register("dob")} className="w-full p-2 border rounded" />
              {errors.dob && <p className="text-red-500 text-xs">{errors.dob.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Age</label>
              <input type="number" {...register("age")} className="w-full p-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium">Height (cm)</label>
              <input type="number" step="0.1" {...register("height")} className="w-full p-2 border rounded" />
              {errors.height && <p className="text-red-500 text-xs">{errors.height.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium">Weight (kg)</label>
              <input type="number" step="0.1" {...register("weight")} className="w-full p-2 border rounded" />
              {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Symptoms</label>
            <textarea {...register("symptoms")} className="w-full p-2 border rounded h-24" placeholder="Describe symptoms (e.g., headache, fever, cough)"></textarea>
            {errors.symptoms && <p className="text-red-500 text-xs">{errors.symptoms.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Previous Medical History / Illnesses</label>
            <textarea {...register("medicalHistory")} className="w-full p-2 border rounded h-20"></textarea>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Previous Prescriptions (Optional)</label>
            <input type="file" onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Blood Test Reports (Optional)</label>
            <input type="file" onChange={(e) => setReportFile(e.target.files?.[0] || null)} className="w-full text-sm" />
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white rounded py-3 font-semibold hover:bg-blue-700 disabled:bg-blue-300"
          >
            {uploading ? "Submitting..." : "Submit and View Results"}
          </button>
        </form>
      </div>
    </div>
  );
}
