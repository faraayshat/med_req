"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Plus, 
  History, 
  TrendingUp, 
  User, 
  ArrowRight, 
  Heart, 
  ClipboardList,
  Calendar,
  LogOut,
  Bell,
  Search,
  LayoutDashboard,
  FileText,
  Settings,
  ShieldCheck
} from "lucide-react";
import { motion } from "framer-motion";
import { deleteCookie } from "cookies-next";

export default function Dashboard() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Patient");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUserName(user.displayName || "Patient");
        const q = query(
          collection(db, "reports"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await auth.signOut();
    deleteCookie("__session");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <Activity className="w-16 h-16 text-rose-500 animate-pulse mb-8" />
        <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-sm animate-pulse">Initializing Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rose-50/30 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-80 bg-slate-950 flex-col p-8 border-r border-slate-900 sticky top-0 h-screen">
        <div className="flex items-center gap-4 mb-16">
          <div className="bg-rose-600 p-2.5 rounded-2xl">
            <Heart className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-[1000] text-white tracking-widest italic uppercase">HealthDesk</span>
        </div>

        <nav className="flex-1 space-y-4">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true },
            { icon: FileText, label: "Physician Reports", active: false },
            { icon: Activity, label: "Vitals History", active: false },
            { icon: Calendar, label: "Appointments", active: false },
            { icon: Settings, label: "Portal Settings", active: false },
          ].map((item, idx) => (
            <button key={idx} className={`w-full flex items-center gap-4 p-5 rounded-3xl font-black text-sm uppercase tracking-widest transition-all ${item.active ? 'bg-rose-600 text-white shadow-xl shadow-rose-600/20' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-slate-900 space-y-6">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
             <div className="flex items-center gap-3 mb-4">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">System Online</span>
             </div>
             <p className="text-slate-400 text-xs font-bold leading-relaxed mb-4">HIPAA-compliant Secure Portal v4.2</p>
             <button onClick={handleLogout} className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-widest hover:text-rose-500 transition-colors">
               <LogOut className="w-4 h-4" /> Terminate Session
             </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-16 max-w-7xl mx-auto space-y-12 overflow-y-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-6xl font-[1000] text-slate-950 tracking-tighter">Portal Overview.</h1>
            <p className="text-slate-400 text-lg font-bold flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-rose-600" />
              Welcome, <span className="text-slate-950 uppercase tracking-widest">{userName}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button aria-label="View notifications" className="bg-white border-2 border-slate-100 p-3 rounded-xl hover:bg-slate-50 transition-colors relative">
                <Bell className="w-5 h-5 text-slate-950" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-600 rounded-full border-2 border-white" />
             </button>
             <Link href="/dashboard/new" className="hospital-button-primary px-6 py-4 h-fit text-base">
                <Plus className="w-5 h-5" /> Identify Anomaly
             </Link>
          </div>
        </header>

        {/* Vital Metrics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="hospital-card p-10 bg-slate-950 text-white relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-rose-600/20 rounded-full blur-3xl -z-0" />
             <div className="relative z-10 flex flex-col h-full justify-between gap-8">
               <div className="bg-white/10 w-fit p-3 rounded-2xl"><TrendingUp className="w-6 h-6 text-rose-500" /></div>
               <div>
                  <p className="text-slate-500 font-black text-xs uppercase tracking-widest mb-1">Metabolic Baseline</p>
                  <p className="text-5xl font-[1000] tracking-tighter">Healthy <span className="text-rose-600">Range</span></p>
               </div>
               <p className="text-slate-400 font-medium italic">Vitals within 2% deviation of clinical normal.</p>
             </div>
          </div>

          <div className="hospital-card p-10 bg-white group hover:border-rose-200 transition-all">
             <div className="flex flex-col h-full justify-between gap-8">
               <div className="bg-rose-50 w-fit p-3 rounded-2xl"><ClipboardList className="w-6 h-6 text-rose-600" /></div>
               <div>
                  <p className="text-slate-400 font-black text-xs uppercase tracking-widest mb-1">Physician Analysis</p>
                  <p className="text-5xl font-[1000] tracking-tighter text-slate-950">{reports.length} <span className="text-rose-600/40 text-3xl">REPORTS</span></p>
               </div>
               <p className="text-slate-400 font-medium">Archived logs and diagnostic summaries.</p>
             </div>
          </div>

          <div className="hospital-card p-10 bg-rose-600 text-white relative overflow-hidden group">
             <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
             <div className="relative z-10 flex flex-col h-full justify-between gap-8">
               <div className="bg-white/20 w-fit p-3 rounded-2xl"><Activity className="w-6 h-6 text-white" /></div>
               <div>
                  <p className="text-white/60 font-black text-xs uppercase tracking-widest mb-1">Anomaly Engine</p>
                  <p className="text-5xl font-[1000] tracking-tighter">Shield <span className="text-white/40">Active</span></p>
               </div>
               <p className="text-white/80 font-medium">Real-time health optimization active.</p>
             </div>
          </div>
        </section>

        {/* Clinical Archive */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-3xl font-[1000] text-slate-950 tracking-tighter">Clinical Log History.</h3>
            <button className="text-rose-600 font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-2">
              View All Archives <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="hospital-card p-24 flex flex-col items-center text-center space-y-8 bg-white/50 border-dashed border-2 border-rose-100">
              <div className="bg-rose-50 p-8 rounded-[2.5rem]"><Plus className="w-12 h-12 text-rose-200" /></div>
              <div className="space-y-4">
                <p className="text-3xl font-[1000] text-slate-950 tracking-tighter">No Artifacts Detected.</p>
                <p className="text-slate-400 font-bold max-w-sm mx-auto">Initiate your first clinical intake to begin longitudinal tracking.</p>
              </div>
              <Link href="/dashboard/new" className="hospital-button-primary py-5 px-10">Start Clinical Ingestion</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  whileHover={{ y: -5, scale: 1.01 }}
                  className="hospital-card p-8 bg-white border-2 border-slate-50 hover:border-rose-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-8 group"
                >
                  <div className="flex items-center gap-8">
                    <div className="bg-rose-50 p-6 rounded-3xl group-hover:bg-rose-600 transition-colors duration-500">
                      <FileText className="w-8 h-8 text-rose-600 group-hover:text-white transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-3xl font-[1000] text-slate-950 tracking-tighter">{report.reason || "General Assessment"}</p>
                      <div className="flex items-center gap-4 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2 border border-slate-100 px-3 py-1.5 rounded-full"><Calendar className="w-3 h-3" /> {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        <span className="text-rose-600 font-black">REF: {report.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href={`/results/${report.id}`}
                    className="flex items-center gap-3 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-600 transition-colors group/btn"
                  >
                    Physician Analysis <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-3 transition-transform duration-500" />
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
