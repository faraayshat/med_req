"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { 
  ArrowLeft, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Stethoscope, 
  Download, 
  ShieldCheck,
  Info
} from "lucide-react";
import { motion } from "framer-motion";

interface ResultData {
  id: string;
  fullName: string;
  symptoms: string;
  bmi: number;
  height: number;
  weight: number;
  medicalHistory: string;
  prescriptionUrl?: string;
  reportUrl?: string;
}

export default function ResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id && user) {
      const fetchData = async () => {
        const docRef = doc(db, "health_data", id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() } as ResultData);
        }
        setLoading(false);
      };
      fetchData();
    }
  }, [id, user]);

  const getRecommendations = (symptoms: string) => {
    const s = symptoms.toLowerCase();
    const matches: { condition: string; suggestion: string }[] = [];

    if (s.includes("fever") || s.includes("headache")) {
      matches.push({
        condition: "Possible viral infection or common cold",
        suggestion: "Rest, stay hydrated, and monitor temperature. Consider over-the-counter paracetamol for fever relief.",
      });
    }
    if (s.includes("cough") || s.includes("sore throat")) {
      matches.push({
        condition: "Upper respiratory tract irritation",
        suggestion: "Gentle gargling with warm salt water and adequate hydration. Avoid cold environments.",
      });
    }
    if (s.includes("stomach") || s.includes("nausea")) {
      matches.push({
        condition: "Gastrointestinal upset",
        suggestion: "Focus on light, easily digestible foods. Increase intake of oral rehydration salts.",
      });
    }

    if (matches.length === 0) {
      matches.push({
        condition: "Assessment Inconclusive",
        suggestion: "Your symptoms don't match our basic rule-set. Please monitor changes carefully.",
      });
    }

    return matches;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-600", bg: "bg-blue-50" };
    if (bmi < 25) return { label: "Normal weight", color: "text-green-600", bg: "bg-green-50" };
    if (bmi < 30) return { label: "Overweight", color: "text-orange-600", bg: "bg-orange-50" };
    return { label: "Obese", color: "text-red-600", bg: "bg-red-50" };
  };

  if (authLoading || loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-slate-500 font-bold">Analyzing your health profile...</p>
    </div>
  );
  
  if (!data) return <div className="p-8 text-center text-red-500 font-bold">Record not found.</div>;

  const recommendations = getRecommendations(data.symptoms);
  const bmiInfo = getBMICategory(data.bmi);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 shadow-none">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-primary font-bold transition-colors mb-6 group border-none"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Dashboard
        </Link>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden"
        >
          {/* Header Banner */}
          <div className="bg-primary px-8 py-10 text-white border-none underline-none">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-sm">
                  <Stethoscope className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight border-none underline-none">Health Assessment Result</h1>
                  <p className="text-blue-100 opacity-90 font-medium">For: {data.fullName}</p>
                </div>
              </div>
              <div className={`px-5 py-2 rounded-full ${bmiInfo.bg} ${bmiInfo.color} font-extrabold text-sm border-none underline-none`}>
                BMI: {data.bmi.toFixed(1)} — {bmiInfo.label}
              </div>
            </div>
          </div>

          <div className="p-8 space-y-10 shadow-none border-none">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 underline-none">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 underline-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 border-none underline-none">Height</span>
                <p className="text-lg font-extrabold text-slate-900 border-none underline-none">{data.height} cm</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 underline-none">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1 border-none underline-none">Weight</span>
                <p className="text-lg font-extrabold text-slate-900 border-none underline-none">{data.weight} kg</p>
              </div>
              {data.prescriptionUrl && (
                <a href={data.prescriptionUrl} target="_blank" className="flex items-center justify-center gap-2 bg-blue-50 p-4 rounded-2xl border border-blue-100 group transition-colors hover:bg-blue-100">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-bold text-blue-700 underline-none">Prescription</span>
                </a>
              )}
               {data.reportUrl && (
                <a href={data.reportUrl} target="_blank" className="flex items-center justify-center gap-2 bg-green-50 p-4 rounded-2xl border border-green-100 group transition-colors hover:bg-green-100">
                  <Download className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-bold text-green-700 underline-none">Blood Report</span>
                </a>
              )}
            </div>

            {/* Analysis Section */}
            <div className="space-y-6 underline-none">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight border-none underline-none">Medical Analysis</h2>
              </div>

              <div className="grid gap-4 underline-none">
                {recommendations.map((rec, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    key={idx} 
                    className="flex gap-4 p-6 rounded-2xl bg-slate-50 border border-slate-100 underline-none"
                  >
                    <div className="bg-white p-2 h-fit rounded-lg shadow-sm">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 mb-1 border-none underline-none">{rec.condition}</h4>
                      <p className="text-slate-600 leading-relaxed border-none underline-none">{rec.suggestion}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4 transition-all hover:shadow-lg hover:shadow-amber-100 underline-none">
              <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
              <div className="underline-none">
                <h4 className="font-extrabold text-amber-900 border-none underline-none mb-1">Medical Disclaimer</h4>
                <p className="text-amber-800 text-sm leading-relaxed border-none underline-none">
                  This system is a tool for basic information and does not provide an official medical diagnosis. 
                  The recommendations provided are purely suggestive. **Please consult a qualified healthcare professional** 
                  for accurate medical advice and treatment.
                </p>
              </div>
            </div>
            
            <div className="pt-6 border-t border-slate-100 flex justify-center underline-none">
                <button
                   onClick={() => window.print()} 
                   className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all border-none underline-none"
                >
                    <Download className="w-4 h-4" />
                    Print Summary Report
                </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

  const recommendations = getRecommendations(data.symptoms);
  const bmiCategory = getBMICategory(data.bmi);

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-3xl mx-auto border p-8 rounded shadow-lg bg-white">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-800">Health Assessment Result</h1>

        <section className="mb-6 space-y-2">
          <p className="border-b pb-2"><span className="font-bold text-black border-none">Patient Name:</span> {data.fullName}</p>
          <p className="border-b pb-2"><span className="font-bold text-black border-none">BMI:</span> {data.bmi.toFixed(2)} ({bmiCategory})</p>
          <p className="border-b pb-2"><span className="font-bold text-black border-none">Reported Symptoms:</span> {data.symptoms}</p>
        </section>

        <div className="bg-blue-50 p-6 rounded-lg mb-8 border-l-4 border-blue-600">
          <h2 className="text-xl font-bold mb-4 text-blue-900 border-none">Analysis & Recommendations</h2>
          {recommendations.map((rec, idx) => (
            <div key={idx} className="mb-4">
              <p className="font-semibold text-blue-800">{rec.condition}</p>
              <p className="text-blue-700 mt-1">{rec.suggestion}</p>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-lg mb-8">
          <p className="text-yellow-800 font-bold text-center">
            ⚠️ MEDICAL DISCLAIMER: This is only a suggestion based on basic logic. This system does not provide official medical diagnoses. Please consult a qualified doctor for any medical concerns.
          </p>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard" className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
