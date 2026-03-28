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
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

export default function VitalsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }
    setLoading(false);
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
    { label: "Heart Rate", value: "72", unit: "BPM", trend: "+2", icon: Heart, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Blood Oxygen", value: "98", unit: "%", trend: "Stable", icon: Wind, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Glucose Level", value: "110", unit: "mg/dL", trend: "-5", icon: Droplets, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Body Temp", value: "98.6", unit: "°F", trend: "0.0", icon: Thermometer, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

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
            { icon: FileText, label: "Records", active: false, href: "/dashboard/records" },
            { icon: Activity, label: "Vitals", active: true, href: "/dashboard/vitals" },
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
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-sm xl:text-base italic uppercase tracking-widest font-black">Vitals</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 xl:gap-6">
            <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-white text-[10px] font-black ring-2 ring-slate-100 ring-offset-2">
              {authUser?.displayName?.substring(0, 2).toUpperCase() || "PT"}
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 xl:p-12 space-y-12 lg:max-w-6xl xl:max-w-[1400px]">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full w-fit">
                <Zap className="w-3 h-3 text-rose-600 animate-pulse" />
                <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest">Live Bio-Stream</span>
              </div>
              <h2 className="text-4xl xl:text-5xl font-[1000] text-slate-950 tracking-tighter leading-tight italic uppercase decoration-rose-100 decoration-8 underline-offset-[-2px]">
                Real-time <span className="text-rose-600 underline">Vitals</span>.
              </h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest max-w-lg">Monitoring physiological telemetry via secure clinical uplink.</p>
            </div>
          </div>

          {/* Vitals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {vitals.map((vital, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group overflow-hidden relative"
              >
                <div className={`absolute -right-4 -top-4 w-24 h-24 ${vital.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 opacity-50`} />
                <div className="relative z-10 flex flex-col gap-6">
                  <div className={`w-12 h-12 ${vital.bg} rounded-2xl flex items-center justify-center`}>
                    <vital.icon className={`w-6 h-6 ${vital.color}`} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{vital.label}</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-4xl font-[1000] text-slate-950 tracking-tighter">{vital.value}</span>
                       <span className="text-xs font-black text-slate-300 uppercase">{vital.unit}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full w-fit border border-slate-100">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{vital.trend} Threshold</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed Activity Graph Placeholder */}
          <div className="bg-slate-950 p-10 rounded-[3rem] text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-rose-600/20 rounded-full blur-[120px] group-hover:bg-rose-600/30 transition-all duration-1000" />
            <div className="relative z-10 space-y-8">
               <div className="flex items-center justify-between">
                  <div className="space-y-1">
                     <h3 className="text-2xl font-[1000] tracking-tighter uppercase italic">Telemetry Graph</h3>
                     <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">24-hour physiological variance</p>
                  </div>
                  <div className="flex gap-2">
                     {['1H', '6H', '24H', '1W'].map(t => (
                        <button key={t} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${t === '24H' ? 'bg-rose-600 text-white' : 'bg-white/10 text-white/40 hover:bg-white/20'}`}>
                           {t}
                        </button>
                     ))}
                  </div>
               </div>
               
               <div className="h-64 w-full flex items-end gap-2 px-4 shadow-inner">
                  {[40, 60, 45, 70, 85, 55, 65, 50, 75, 90, 60, 80, 70, 60, 50, 55, 75, 65, 45, 80].map((h, i) => (
                    <motion.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-rose-600/50 to-rose-500 rounded-t-lg group-hover:from-rose-500 group-hover:to-rose-400 transition-colors"
                    />
                  ))}
               </div>
               
               <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Active Rate</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-white/20" />
                        <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Resting Phase</span>
                     </div>
                  </div>
                  <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Clock className="w-3 h-3" /> Last Sync: Just Now
                  </p>
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}