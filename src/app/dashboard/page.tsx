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
  ShieldCheck,
  ChevronRight,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion } from "framer-motion";
import { deleteCookie } from "cookies-next";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Dashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    const fetchReports = async () => {
      try {
        const q = query(
          collection(db, "reports"),
          where("userId", "==", authUser.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [authUser, authLoading, router]);

  const handleLogout = async () => {
    await auth.signOut();
    deleteCookie("__session");
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <div className="relative">
          <Activity className="w-12 h-12 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Medical Vault...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-rose-100 selection:text-rose-900 flex flex-col lg:flex-row antialiased">
      {/* Precision Sidebar */}
      <aside className="hidden lg:flex w-20 xl:w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen transition-all duration-500 ease-in-out group/sidebar">
        <div className="p-6 xl:p-8 flex items-center gap-4">
          <div className="bg-rose-600 p-2.5 rounded-xl shadow-lg shadow-rose-200 group-hover/sidebar:rotate-[10deg] transition-transform">
            <Heart className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="hidden xl:block text-base font-black text-slate-950 tracking-tighter uppercase italic">Health<span className="text-rose-600">Med</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {[
            { icon: LayoutDashboard, label: "Overview", active: true, href: "/dashboard" },
            { icon: FileText, label: "Records", active: false, href: "/dashboard/records" },
            { icon: Activity, label: "Vitals", active: false, href: "/dashboard/vitals" },
            { icon: User, label: "Identity", active: false, href: "/dashboard/profile" },
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className={`w-full flex items-center justify-center xl:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'}`}>
              <item.icon className={`w-5 h-5 ${item.active ? 'text-rose-500' : ''}`} />
              <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {item.active && <div className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 xl:p-6 mt-auto">
          <div className="bg-slate-50 rounded-3xl p-4 xl:p-6 border border-slate-100 relative overflow-hidden group/card">
            <div className="hidden xl:block relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol v4</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold mb-4 leading-tight">Your medical data is encrypted via AES-256.</p>
              <button onClick={handleLogout} className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:gap-3 transition-all">
                Logout <LogOut className="w-3 h-3" />
              </button>
            </div>
            <button onClick={handleLogout} className="xl:hidden flex items-center justify-center w-full p-2 text-rose-600">
               <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Interface */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Navigation / Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 xl:px-12 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="lg:hidden bg-rose-600 p-2 rounded-lg">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl xl:text-2xl font-[1000] text-slate-950 tracking-tighter flex items-center gap-3">
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-sm xl:text-base italic uppercase tracking-widest font-black">Overview</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 xl:gap-6">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-2 border border-slate-200 focus-within:border-rose-200 focus-within:bg-white transition-all group">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input type="text" placeholder="Search records..." className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-slate-900 w-48 placeholder:text-slate-400 uppercase tracking-wider ml-2" />
            </div>
            
            <button className="relative p-2.5 rounded-full bg-white border border-slate-200 hover:border-rose-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-600 rounded-full border-2 border-white shadow-sm" />
            </button>

            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-white text-[10px] font-black ring-2 ring-slate-100 ring-offset-2">
              {authUser?.displayName?.substring(0, 2).toUpperCase() || "PT"}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-12 space-y-10 xl:space-y-16 lg:max-w-6xl xl:max-w-[1400px]">
          
          {/* Welcome & Quick Action */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full w-fit">
                <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Active Session</span>
              </div>
              <h2 className="text-4xl xl:text-6xl font-[1000] text-slate-950 tracking-tighter leading-tight balance">
                Welcome back, <br/> <span className="text-rose-600 uppercase italic underline decoration-rose-100 decoration-8 underline-offset-[-2px]">{authUser?.displayName?.split(' ')[0] || "Patient"}</span>.
              </h2>
            </div>
            <Link href="/dashboard/new" className="hospital-button-primary px-8 py-4 text-sm font-black rounded-3xl shadow-2xl shadow-rose-200 flex items-center justify-center gap-3 active:scale-95 transition-transform shrink-0">
               <Plus className="w-5 h-5" /> Identify Anomaly
            </Link>
          </div>

          {/* Vitals & Status Row */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-rose-600/20 rounded-full blur-[60px] group-hover:bg-rose-600/30 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="flex items-center justify-between">
                  <div className="bg-white/10 p-3 rounded-2xl"><TrendingUp className="w-6 h-6 text-rose-500" /></div>
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Update: Just Now</span>
                </div>
                <div>
                   <p className="text-4xl xl:text-5xl font-[1000] tracking-tighter mb-2 italic">Optimal <span className="text-rose-600">Sync.</span></p>
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">All Systems Nominal</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 relative overflow-hidden group hover:border-rose-100 transition-colors">
              <div className="flex flex-col h-full justify-between gap-12">
                <div className="flex items-center justify-between">
                  <div className="bg-rose-50 p-3 rounded-2xl group-hover:bg-rose-600 transition-colors duration-500 group"><FileText className="w-6 h-6 text-rose-600 group-hover:text-white transition-colors" /></div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />)}
                  </div>
                </div>
                <div>
                   <p className="text-4xl xl:text-5xl font-[1000] text-slate-950 tracking-tighter mb-2">{reports.length} <span className="text-slate-200 italic">LOGS</span></p>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Verified Artifacts</p>
                </div>
              </div>
            </div>

            <div className="bg-rose-600 p-8 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-rose-200">
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-[60px]" />
               <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                <div className="flex items-center justify-between">
                   <div className="bg-white/20 p-3 rounded-2xl"><Activity className="w-6 h-6" /></div>
                   <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest">Shield Active</div>
                </div>
                <div>
                   <p className="text-4xl xl:text-5xl font-[1000] tracking-tighter mb-2">Health <span className="text-white/50">Med</span></p>
                   <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Standard Protocol v4.0</p>
                </div>
               </div>
            </div>
          </section>

          {/* Records History Table-Style */}
          <section className="space-y-8 pb-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-2xl xl:text-3xl font-[1000] text-slate-950 tracking-tighter">Clinical Log History.</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Chronological archive of verified events</p>
              </div>
              <button className="bg-white px-5 py-2.5 rounded-full border border-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                Export Full Dossier
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white p-20 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] shadow-inner">
                  <ClipboardList className="w-12 h-12 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-[1000] text-slate-400 tracking-tighter">No Artifacts Detected.</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Sync required to populate clinical data</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.005, backgroundColor: '#ffffff' }}
                    className="group bg-white/20 border border-slate-100 p-6 xl:p-8 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-6">
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] group-hover:bg-rose-50 transition-colors duration-500 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-slate-400 group-hover:text-rose-600 transition-all" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-rose-100">Verified</span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {report.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-xl xl:text-2xl font-[1000] text-slate-950 tracking-tighter group-hover:text-rose-600 transition-colors">{report.reason || "General Assessment"}</p>
                        <div className="flex items-center gap-4 mt-2">
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             <Clock className="w-3.5 h-3.5" /> {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}
                           </span>
                           <div className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Clinical Artifact</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <Link 
                        href={`/results/${report.id}`}
                        className="bg-slate-50 text-slate-950 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all flex items-center gap-2 group/btn"
                      >
                        Analyze <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <button className="p-3 rounded-full border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 transition-all">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
