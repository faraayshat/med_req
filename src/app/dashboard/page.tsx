"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { deleteCookie } from "cookies-next";
import { 
  Activity, 
  PlusCircle, 
  LogOut, 
  ChevronRight, 
  ClipboardList,
  Calendar,
  Weight
} from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchSubmissions = async () => {
        try {
          const q = query(
            collection(db, "health_data"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
          );
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSubmissions(data);
        } catch (error) {
          console.error("Error fetching submissions:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    deleteCookie("__session");
    router.push("/login");
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Loading your health desk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 font-bold">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 border-none">HealthMed</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight border-none">Welcome, {user?.email?.split('@')[0]}</h1>
          <p className="text-slate-500 mt-1">Manage your health records and get medical insights.</p>
        </header>

        {/* Action Cards */}
        <section className="grid sm:grid-cols-2 gap-6 mb-12">
          <motion.div whileHover={{ y: -4 }}>
            <Link
              href="/dashboard/new"
              className="group block bg-primary p-6 rounded-2xl shadow-lg shadow-blue-100 hover:shadow-blue-200 transition-all border-none"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <PlusCircle className="w-8 h-8 text-white" />
                </div>
                <ChevronRight className="text-white/50 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-xl font-bold text-white border-none">New Health Assessment</h3>
              <p className="text-blue-50 mt-1 opacity-90 border-none">Fill out your symptoms and get instant feedback.</p>
            </Link>
          </motion.div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-none">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-100 p-3 rounded-xl">
                <ClipboardList className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 border-none">Summary</h3>
                <p className="text-slate-500 text-sm border-none">{submissions.length} Total Assessments</p>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-2/3"></div>
            </div>
          </div>
        </section>

        {/* History Table */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight border-none">History</h2>
          </div>

          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 p-12 rounded-3xl text-center">
                <p className="text-slate-500 font-medium">No records found. Start your first assessment!</p>
              </div>
            ) : (
              submissions.map((sub, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={sub.id} 
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:border-primary transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-full group-hover:bg-blue-100 transition-colors">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 border-none">{sub.fullName}</span>
                          <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full uppercase border-none">
                            {sub.symptoms?.split(',')[0]}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-1 border-none">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(sub.createdAt?.seconds * 1000).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 border-none">
                            <Weight className="w-3.5 h-3.5" />
                            BMI: {sub.bmi?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/results/${sub.id}`}
                      className="flex items-center justify-center gap-2 bg-slate-50 text-slate-700 font-bold px-4 py-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all text-sm"
                    >
                      View Report
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
