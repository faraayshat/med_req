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
  ExternalLink,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRealtimeNotifications } from "@/lib/notifications";
import { getNotificationUi } from "@/lib/notification-ui";

export default function Dashboard() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const { notifications, clearAllNotifications, dismissNotification } = useRealtimeNotifications(authUser?.uid);

  const clearNotifications = () => {
    void clearAllNotifications();
  };

  const removeNotification = (id: string) => {
    void dismissNotification(id);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    const fetchReports = async () => {
      try {
        const q = query(
          collection(db, "reportSummaries"),
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
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className={`w-full flex items-center justify-center xl:justify-start gap-4 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'}`}>
              <item.icon className={`w-5 h-5 ${item.active ? 'text-rose-500' : ''}`} />
              <span className="hidden xl:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {item.active && <div className="hidden xl:block ml-auto w-1.5 h-1.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />}
            </Link>
          ))}
        </nav>

        
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 xl:px-10 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <div className="lg:hidden bg-rose-600 p-1.5 rounded-lg">
              <Heart className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-lg xl:text-xl font-[1000] text-slate-950 tracking-tighter flex items-center gap-2.5">
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-xs xl:text-sm italic uppercase tracking-widest font-black">Overview</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 xl:gap-5">
            <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200 focus-within:border-rose-200 focus-within:bg-white transition-all group">
              <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
              <input type="text" placeholder="Search..." className="bg-transparent border-none focus:ring-0 text-[10px] font-bold text-slate-900 w-36 placeholder:text-slate-400 uppercase tracking-wider ml-1.5" />
            </div>
            
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
                              <div className={`${getNotificationUi(n.type).color} p-2 rounded-xl h-fit`}>
                                {(() => {
                                  const Icon = getNotificationUi(n.type).icon;
                                  return <Icon className={`w-4 h-4 ${getNotificationUi(n.type).iconColor}`} />;
                                })()}
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

            <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white text-[9px] font-black ring-2 ring-slate-100 ring-offset-2 hover:ring-rose-500 transition-all overflow-hidden">
              {authUser?.displayName?.substring(0, 2).toUpperCase() || "PT"}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 xl:p-10 space-y-8 xl:space-y-12 lg:max-w-6xl xl:max-w-[1400px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full w-fit">
                <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Active Session</span>
              </div>
              <h2 className="text-3xl xl:text-5xl font-[1000] text-slate-950 tracking-tighter leading-tight balance">
                Welcome back, <br/> <span className="text-rose-600 uppercase italic underline decoration-rose-100 decoration-8 underline-offset-[-2px]">{authUser?.displayName?.split(' ')[0] || "Patient"}</span>.
              </h2>
            </div>
            <Link href="/dashboard/new" className="hospital-button-primary px-6 py-3.5 text-xs font-black rounded-2xl shadow-2xl shadow-rose-200 flex items-center justify-center gap-2.5 active:scale-95 transition-transform shrink-0">
               <Plus className="w-4.5 h-4.5" /> Identify Anomaly
            </Link>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-950 p-6 xl:p-8 rounded-[2rem] text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-rose-600/20 rounded-full blur-[60px] group-hover:bg-rose-600/30 transition-all duration-700" />
              <div className="relative z-10 flex flex-col h-full justify-between gap-4">
                <div className="flex items-center justify-between">
                  <div className="bg-white/10 p-2.5 rounded-xl"><TrendingUp className="w-5 h-5 text-rose-500" /></div>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Recovery Rate</span>
                </div>
                <div className="flex-1 flex items-end gap-1.5 h-16 xl:h-20">
                  {[40, 70, 45, 90, 65, 80, 95].map((height, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="flex-1 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-sm opacity-80"
                    />
                  ))}
                </div>
                <div>
                   <p className="text-3xl xl:text-4xl font-[1000] tracking-tighter mb-1 italic">94% <span className="text-rose-600">Recovery.</span></p>
                   <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em]">+2.4% from last session</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 xl:p-8 rounded-[2rem] border border-slate-200 relative overflow-hidden group hover:border-rose-100 transition-colors">
              <div className="flex flex-col h-full justify-between gap-8 xl:gap-12">
                <div className="flex items-center justify-between">
                  <div className="bg-rose-50 p-2.5 rounded-xl group-hover:bg-rose-600 transition-colors duration-500 group"><FileText className="w-5 h-5 text-rose-600 group-hover:text-white transition-colors" /></div>
                  <div className="flex -space-x-1.5">
                    {[1,2,3].map(i => <div key={i} className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white" />)}
                  </div>
                </div>
                <div>
                   <p className="text-3xl xl:text-4xl font-[1000] text-slate-950 tracking-tighter mb-1">{reports.length} <span className="text-slate-200 italic">LOGS</span></p>
                   <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.2em]">Verified Artifacts</p>
                </div>
              </div>
            </div>

            <div className="bg-rose-600 p-6 xl:p-8 rounded-[2rem] text-white relative overflow-hidden group shadow-2xl shadow-rose-200">
               <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-[60px]" />
               <div className="relative z-10 flex flex-col h-full justify-between gap-8 xl:gap-12">
                <div className="flex items-center justify-between">
                   <div className="bg-white/20 p-2.5 rounded-xl"><ShieldCheck className="w-5 h-5" /></div>
                   <div className="px-2.5 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest">Emergency Help</div>
                </div>
                <div>
                   <p className="text-3xl xl:text-4xl font-[1000] tracking-tighter mb-1 uppercase italic">SOS <span className="text-white/50">Ready.</span></p>
                   <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.2em]">Immediate clinical responder</p>
                </div>
               </div>
            </div>
          </section>

          <section className="space-y-6 pb-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl xl:text-2xl font-[1000] text-slate-950 tracking-tighter">Clinical Log History.</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Chronological archive of verified events</p>
              </div>
              <button className="bg-white px-4 py-2 rounded-full border border-slate-200 text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm">
                Export Full Dossier
              </button>
            </div>

            {reports.length === 0 ? (
              <div className="bg-white p-16 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center space-y-5">
                <div className="bg-slate-50 p-6 rounded-[2rem] shadow-inner">
                  <ClipboardList className="w-10 h-10 text-slate-300" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xl font-[1000] text-slate-400 tracking-tighter">No Artifacts Detected.</p>
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Sync required to populate clinical data</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    whileHover={{ scale: 1.005 }}
                    className="group bg-white/20 border border-slate-100 p-5 xl:p-7 rounded-[1.8rem] hover:shadow-2xl hover:shadow-slate-200/50 hover:border-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-center gap-5">
                      <div className="bg-slate-50 p-4 rounded-[1.2rem] group-hover:bg-rose-50 transition-colors duration-500 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-400 group-hover:text-rose-600 transition-all" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2.5 mb-1">
                           <span className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[7px] font-black uppercase tracking-widest rounded-md border border-rose-100">Verified</span>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ID: {report.id.slice(0, 8)}</span>
                        </div>
                        <p className="text-lg xl:text-xl font-[1000] text-slate-950 tracking-tighter group-hover:text-rose-600 transition-colors uppercase italic">{report.reason || "General Assessment"}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                           <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                             <Clock className="w-3 h-3" /> {new Date(report.createdAt?.seconds * 1000).toLocaleDateString()}
                           </span>
                           <div className="w-1 h-1 rounded-full bg-slate-200" />
                           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Clinical Artifact</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                       <Link 
                        href={`/results/${report.id}`}
                        className="bg-slate-50 text-slate-950 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-slate-950 hover:text-white transition-all flex items-center gap-2 group/btn"
                      >
                        Analyze <ChevronRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      <button className="p-2.5 rounded-full border border-slate-100 text-slate-300 hover:text-rose-600 hover:border-rose-100 transition-all">
                        <ExternalLink className="w-3.5 h-3.5" />
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
