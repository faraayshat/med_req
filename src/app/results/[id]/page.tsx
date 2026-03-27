"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

interface ResultData {
  id: string;
  fullName: string;
  symptoms: string;
  bmi: number;
  height: number;
  weight: number;
  medicalHistory: string;
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
        suggestion: "Rest, hydration, and over-the-counter paracetamol for fever.",
      });
    }
    if (s.includes("cough") || s.includes("sore throat")) {
      matches.push({
        condition: "Upper respiratory tract irritation",
        suggestion: "Saltwater gargles, honey, and hydration.",
      });
    }
    if (s.includes("stomach") || s.includes("nausea")) {
      matches.push({
        condition: "Gastrointestinal upset",
        suggestion: "Light diet (BRAT: Bananas, Rice, Applesauce, Toast) and hydration.",
      });
    }

    if (matches.length === 0) {
      matches.push({
        condition: "Inconclusive based on symptoms provided",
        suggestion: "Monitor your symptoms and consult a healthcare professional.",
      });
    }

    return matches;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal weight";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  if (authLoading || loading) return <div className="p-8 text-center text-black">Loading results...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Record not found.</div>;

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
