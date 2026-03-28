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
  Download,
  LogOut,
  Bell,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { deleteCookie } from "cookies-next";

export default function RecordsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Health Analysis Complete', desc: 'Your latest biometric sync shows optimal heart rate stability.', time: '2 mins ago', icon: CheckCircle2, color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { id: 2, type: 'alert', title: 'Prescription Reminder', desc: 'Evening dosage for Vitamin D3 is due in 15 minutes.', time: '1 hour ago', icon: AlertCircle, color: 'bg-rose-100', iconColor: 'text-rose-600' }
  ]);
  const router = useRouter();

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id));

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
    (report.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <span className="hidden xl:block text-sm font-black text-slate-950 tracking-tighter uppercase italic">Health<span className="text-rose-600">Med</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {[
            { icon: LayoutDashboard, label: "Overview", active: false, href: "/dashboard" },
            { icon: FileText, label: "Records", active: true, href: "/dashboard/records" },
            { icon: Activity, label: "Vitals", active: false, href: "/dashboard/vitals" },
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className={`w-full flex items-center justify-center xl:justify-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'}`}>
              <item.icon className={`w-5 h-5 ${item.active ? 'text-rose-500' : ''}`} />
              <span className="hidden xl:block text-xs font-black uppercase tracking-widest">{item.label}</span>
              {item.active && <div className="hidden xl:block ml-auto w-2 h-2 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />}
            </Link>
          ))}
        </nav>

        <div className="p-4 xl:p-6 mt-auto">
          <div className="bg-slate-50 rounded-2xl p-5 xl:p-6 border border-slate-100 relative overflow-hidden group/card shadow-sm">
            <div className="hidden xl:block relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol v4</span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-tight">Your medical data is encrypted via AES-256.</p>
            </div>
            <div className="xl:hidden flex items-center justify-center w-full p-2 text-emerald-500">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Interface */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Navigation / Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 xl:px-10 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
              <ArrowLeft className="w-4.5 h-4.5 text-slate-950" />
            </Link>
            <h1 className="text-lg xl:text-xl font-[1000] text-slate-950 tracking-tighter flex items-center gap-2.5">
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-xs xl:text-sm italic uppercase tracking-widest font-black">Records</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 xl:gap-5">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 rounded-full border transition-all ${showNotifications ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-white border-slate-200 text-slate-400 hover:border-rose-100 hover:bg-rose-50 hover:text-rose-600'}`}
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-600 rounded-full border border-white shadow-sm" />}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden z-50"
                    >
                      <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-950">Notifications</h3>
                          {notifications.length > 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black rounded-full uppercase">{notifications.length} New</span>}
                        </div>
                        {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-[8px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-colors">Clear All</button>
                        )}
                      </div>
                      
                      <div className="max-h-[350px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n.id} className="p-5 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer group border-b border-slate-50 relative">
                              <div className={`${n.color} p-2 rounded-xl h-fit`}>
                                <n.icon className={`w-4 h-4 ${n.iconColor}`} />
                              </div>
                              <div className="flex-1 pr-4">
                                <p className="text-[10px] font-bold text-slate-950 leading-tight mb-1">{n.title}</p>
                                <p className="text-[9px] text-slate-500 font-medium leading-relaxed">{n.desc}</p>
                                <p className="text-[8px] text-slate-400 font-black uppercase mt-2 tracking-tighter">{n.time}</p>
                              </div>
                              <button onClick={() => removeNotification(n.id)} className="absolute right-4 top-5 opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-200 rounded-lg transition-all">
                                <Plus className="w-3 h-3 text-slate-400 rotate-45" />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center space-y-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                               <Bell className="w-5 h-5 text-slate-300" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Alerts</p>
                          </div>
                        )}
                      </div>

                      <Link 
                        href="/dashboard/alerts"
                        className="w-full p-4 text-[9px] font-black text-slate-400 text-center uppercase tracking-widest hover:text-rose-600 hover:bg-rose-50 transition-all border-t border-slate-50 block"
                      >
                        View All Alerts
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white text-[9px] font-black ring-2 ring-slate-100 ring-offset-2">
              {authUser?.displayName?.substring(0, 2).toUpperCase() || "PT"}
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-10 space-y-8 lg:max-w-6xl xl:max-w-[1400px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full w-fit">
                <FileText className="w-2.5 h-2.5 text-rose-600" />
                <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Clinical Archive</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-[1000] text-slate-950 tracking-tighter leading-tight italic uppercase decoration-rose-100 decoration-8 underline-offset-[-2px]">
                Medical <span className="text-rose-600 underline">Records</span>.
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-lg">Access and manage your complete history of diagnostic artifacts and clinical syncs.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white rounded-xl px-3.5 py-2.5 border border-slate-200 focus-within:border-rose-200 transition-all group shadow-sm">
                <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Filter by ID or Reason..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-900 w-40 md:w-56 placeholder:text-slate-400 uppercase tracking-wider ml-2" 
                />
              </div>
              <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          <section className="space-y-5 pb-10">
            <div className="flex items-center justify-between px-3">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Showing {filteredReports.length} Artifacts</p>
              <button className="flex items-center gap-2 text-[9px] font-black text-rose-600 uppercase tracking-widest hover:opacity-70 transition-opacity">
                <Download className="w-3 h-3" /> Export All
              </button>
            </div>

            {filteredReports.length === 0 ? (
              <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5 shadow-sm">
                <div className="bg-slate-50 p-6 rounded-[2rem] shadow-inner">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xl font-[1000] text-slate-400 tracking-tighter">No Matches Found.</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Adjust your search parameters or sync new data</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredReports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.005, backgroundColor: '#ffffff' }}
                    className="group bg-white/40 border border-slate-100 p-5 xl:p-6 rounded-[2rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/30 rounded-bl-[3rem] translate-x-8 -translate-y-8 group-hover:translate-x-6 group-hover:-translate-y-6 transition-transform" />
                    
                    <div className="flex items-center gap-5 relative z-10">
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm group-hover:bg-rose-50 transition-colors duration-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-rose-600 transition-all" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                           <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[7px] font-black uppercase tracking-widest rounded-md border border-rose-100">Verified</span>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ID: {report.id}</span>
                        </div>
                        <p className="text-lg xl:text-xl font-[1000] text-slate-950 tracking-tighter group-hover:text-rose-600 transition-colors uppercase italic">{report.name || report.reason || "General Assessment"}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{report.reason || "Health Assessment Prototype"}</p>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                             <Clock className="w-3 h-3" /> {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}
                           </span>
                           <div className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Encrypted Artifact</span>
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