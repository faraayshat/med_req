"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

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
