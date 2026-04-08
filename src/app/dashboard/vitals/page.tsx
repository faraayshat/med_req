"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  Heart, 
  TrendingUp, 
  ArrowLeft,
  LayoutDashboard,
  FileText,
  User,
  Zap,
  Droplets,
  Wind,
  Thermometer,
  Clock,
  ChevronRight,
  LogOut,
  Bell,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOutUser } from "@/lib/auth-client";

export default function VitalsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lastReport, setLastReport] = useState<any>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Health Analysis Complete', desc: 'Your latest biometric sync shows optimal heart rate stability.', time: '2 mins ago', icon: CheckCircle2, color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { id: 2, type: 'alert', title: 'Prescription Reminder', desc: 'Evening dosage for Vitamin D3 is due in 15 minutes.', time: '1 hour ago', icon: AlertCircle, color: 'bg-rose-100', iconColor: 'text-rose-600' }
  ]);
  const router = useRouter();

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id));

  const handleLogout = async () => {
    try {
      await signOutUser();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }
    
    const fetchLatestVitals = async () => {
      try {
        const q = query(
          collection(db, "reports"),
          where("userId", "==", authUser.uid),
          orderBy("createdAt", "desc"),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setLastReport(querySnapshot.docs[0].data());
        }
      } catch (err) {
        console.error("Error fetching vitals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestVitals();
  }, [authUser, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <div className="relative">
          <Activity className="w-12 h-12 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Vital Streams...</p>
      </div>
    );
  }

  const vitals = [
    { label: "Pulse Rate", value: lastReport?.heartRate || "72", unit: "BPM", trend: lastReport?.heartRate ? "Recent" : "Normal", icon: Heart, color: "text-rose-500", bg: "bg-rose-50", status: lastReport?.heartRate ? "Verified" : "Baseline" },
    { label: "SpO2 Level", value: lastReport?.bloodOxygen || "98", unit: "%", trend: lastReport?.bloodOxygen ? "Recent" : "Optimal", icon: Wind, color: "text-blue-500", bg: "bg-blue-50", status: lastReport?.bloodOxygen ? "Verified" : "Baseline" },
    { label: "Glucose", value: "110", unit: "mg/dL", trend: "Stable", icon: Droplets, color: "text-amber-500", bg: "bg-amber-50", status: "Pending" },
    { label: "Core Temp", value: lastReport?.temperature || "98.6", unit: "°F", trend: lastReport?.temperature ? "Recent" : "Baseline", icon: Thermometer, color: "text-emerald-500", bg: "bg-emerald-50", status: lastReport?.temperature ? "Verified" : "Baseline" },
  ];

  const recentAssessments = [
    { date: "Oct 24, 2023", type: "Full Physical", doctor: "Dr. Sarah Chen", status: "Completed", icon: FileText },
    { date: "Aug 12, 2023", type: "Cardiac Stress Test", doctor: "Cardiology Dept", status: "Analyzed", icon: Activity },
    { date: "May 05, 2023", type: "Bio-Marker Screening", doctor: "Lab Direct", status: "Archived", icon: Zap }
  ];

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
            { icon: FileText, label: "Records", active: false, href: "/dashboard/records" },
            { icon: Activity, label: "Vitals", active: true, href: "/dashboard/vitals" },
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
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-xs xl:text-sm italic uppercase tracking-widest font-black">Vitals</span>
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
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-slate-900 border border-slate-800 rounded-full w-fit">
                <FileText className="w-2.5 h-2.5 text-rose-500" />
                <span className="text-[8px] font-black text-white/70 uppercase tracking-widest">Clinical History Uplink</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-[1000] text-slate-950 tracking-tighter leading-tight italic uppercase decoration-rose-100 decoration-8 underline-offset-[-2px]">
                Health <span className="text-rose-600 underline">Vitals</span>.
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-lg">Aggregated repository of clinical metrics and historical assessments.</p>
            </div>
            <Link href="/dashboard/new" className="hospital-button-primary px-6 py-3.5 text-[10px] font-black rounded-2xl shadow-xl shadow-rose-200 flex items-center justify-center gap-2.5 active:scale-95 transition-transform shrink-0 uppercase tracking-widest">
               <Plus className="w-4 h-4" /> Log Manual Vitals
            </Link>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {vitals.map((vital, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
              >
                <div className={`absolute -right-3 -top-3 w-20 h-20 ${vital.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 opacity-50`} />
                <div className="relative z-10 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 ${vital.bg} rounded-xl flex items-center justify-center`}>
                      <vital.icon className={`w-5 h-5 ${vital.color}`} />
                    </div>
                    <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md border ${vital.status === 'Verified' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100 italic'}`}>{vital.status}</span>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{vital.label}</p>
                    <div className="flex items-baseline gap-1.5">
                       <span className="text-3xl font-[1000] text-slate-950 tracking-tighter">{vital.value}</span>
                       <span className="text-[10px] font-black text-slate-300 uppercase">{vital.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-full w-fit border border-slate-100">
                    <div className={`w-1 h-1 rounded-full ${vital.trend === 'Normal' || vital.trend === 'Optimal' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{vital.trend} Threshold</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Detailed Activity Graph Placeholder */}
            <div className="lg:col-span-2 bg-slate-950 p-8 rounded-[2.5rem] text-white relative overflow-hidden group h-fit">
              <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-rose-600/20 rounded-full blur-[100px] group-hover:bg-rose-600/30 transition-all duration-1000" />
              <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-[1000] tracking-tighter uppercase italic">Recent Bio-History</h3>
                      <p className="text-white/40 text-[9px] font-black uppercase tracking-widest">Aggregated physiological variance</p>
                    </div>
                    <div className="flex gap-2">
                      {['1M', '3M', '6M', '1Y'].map(t => (
                          <button key={t} className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${t === '3M' ? 'bg-rose-600 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                            {t}
                          </button>
                      ))}
                    </div>
                </div>
                
                <div className="h-48 w-full flex items-end gap-1.5 px-3 shadow-inner">
                    {[40, 60, 45, 70, 85, 55, 65, 50, 75, 90, 60, 80, 70, 60, 50, 55, 75, 65, 45, 80].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1 }}
                        className="flex-1 bg-gradient-to-t from-rose-600/50 to-rose-500 rounded-t-md group-hover:from-rose-500 group-hover:to-rose-400 transition-colors"
                      />
                    ))}
                </div>
                
                <div className="flex items-center justify-between pt-5 border-t border-white/10">
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">Baseline</span>
                      </div>
                    </div>
                    <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-2.5 h-2.5" /> Last Update: Oct 2024
                    </p>
                </div>
              </div>
            </div>

            {/* Recent Assessments Sidebar */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Timeline</h3>
                  <button className="text-[9px] font-black text-rose-600 uppercase tracking-widest">View All</button>
               </div>
               <div className="space-y-4">
                  {recentAssessments.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-100 p-5 rounded-2xl hover:border-rose-100 transition-all group flex items-center gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-rose-50 transition-colors">
                           <item.icon className="w-4 h-4 text-slate-400 group-hover:text-rose-600" />
                        </div>
                        <div className="flex-1">
                           <p className="text-[10px] font-black text-slate-950 uppercase tracking-tight">{item.type}</p>
                           <p className="text-[9px] font-bold text-slate-400">{item.doctor}</p>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black text-slate-950">{item.date}</p>
                           <span className="text-[7px] font-black text-emerald-600 uppercase">{item.status}</span>
                        </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}