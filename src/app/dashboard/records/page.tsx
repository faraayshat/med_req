"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Plus, 
  Heart, 
  FileText,
  Search,
  LayoutDashboard,
  User,
  ChevronRight,
  Clock,
  ExternalLink,
  ArrowLeft,
  Filter,
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

export default function RecordsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        setReports(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (err) {
        console.error("Records error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [authUser, authLoading, router]);

  const filteredReports = reports.filter(report => 
    (report.reason || "General Assessment").toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <div className="relative">
          <Activity className="w-12 h-12 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Accessing Medical Archive...</p>
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
            { icon: LayoutDashboard, label: "Overview", active: false, href: "/dashboard" },
            { icon: FileText, label: "Records", active: true, href: "/dashboard/records" },
            { icon: Activity, label: "Vitals", active: false, href: "/dashboard" },
            { icon: User, label: "Identity", active: false, href: "/dashboard/profile" },
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className={`w-full flex items-center justify-center xl:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'}`}>
              <item.icon className={`w-5 h-5 ${item.active ? 'text-rose-500' : ''}`} />
              <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {item.active && <div className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Interface */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Navigation / Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 xl:px-12 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
              <ArrowLeft className="w-5 h-5 text-slate-950" />
            </Link>
            <h1 className="text-xl xl:text-2xl font-[1000] text-slate-950 tracking-tighter flex items-center gap-3">
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-sm xl:text-base italic uppercase tracking-widest font-black">Records</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 xl:gap-6">
            <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-white text-[10px] font-black ring-2 ring-slate-100 ring-offset-2">
              {authUser?.displayName?.substring(0, 2).toUpperCase() || "PT"}
            </div>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-12 space-y-10 lg:max-w-6xl xl:max-w-[1400px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full w-fit">
                <FileText className="w-3 h-3 text-rose-600" />
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Clinical Archive</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-[1000] text-slate-950 tracking-tighter leading-tight italic uppercase decoration-rose-100 decoration-8 underline-offset-[-2px]">
                Medical <span className="text-rose-600 underline">Records</span>.
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-lg">Access and manage your complete history of diagnostic artifacts and clinical syncs.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-2xl px-4 py-3 border border-slate-200 focus-within:border-rose-200 transition-all group shadow-sm">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by ID or Reason..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[11px] font-bold text-slate-900 w-48 md:w-64 placeholder:text-slate-400 uppercase tracking-wider ml-2" 
                />
              </div>
              <button className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                <Filter className="w-5 h-5" />
              </button>
            </div>
          </div>

          <section className="space-y-6 pb-12">
            <div className="flex items-center justify-between px-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing {filteredReports.length} Artifacts</p>
              <button className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:opacity-70 transition-opacity">
                <Download className="w-3.5 h-3.5" /> Export All
              </button>
            </div>

            {filteredReports.length === 0 ? (
              <div className="bg-white p-24 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
                <div className="bg-slate-50 p-8 rounded-[2.5rem] shadow-inner">
                  <Search className="w-12 h-12 text-slate-300" />
                </div>
                <div className="space-y-2">
                  <p className="text-2xl font-[1000] text-slate-400 tracking-tighter">No Matches Found.</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Adjust your search parameters or sync new data</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005, backgroundColor: '#ffffff' }}
                    className="group bg-white/40 border border-slate-100 p-6 xl:p-8 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/30 rounded-bl-[4rem] translate-x-10 -translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-8 transition-transform" />
                    
                    <div className="flex items-center gap-6 relative z-10">
                      <div className="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm group-hover:bg-rose-50 transition-colors duration-500 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-slate-400 group-hover:text-rose-600 transition-all" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                           <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest rounded-md border border-rose-100">Verified</span>
                           <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: {report.id}</span>
                        </div>
                        <p className="text-xl xl:text-2xl font-[1000] text-slate-950 tracking-tighter group-hover:text-rose-600 transition-colors uppercase italic">{report.reason || "General Assessment"}</p>
                        <div className="flex items-center gap-4 mt-3">
                           <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                             <Clock className="w-3.5 h-3.5" /> {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}
                           </span>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Encrypted Artifact</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 relative z-10">
                       <Link 
                        href={`/results/${report.id}`}
                        className="bg-slate-950 text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 transition-all flex items-center gap-2 group/btn shadow-xl shadow-slate-200"
                      >
                        Deep Scan <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <button className="p-4 rounded-3xl bg-white border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                        <ExternalLink className="w-4.5 h-4.5" />
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