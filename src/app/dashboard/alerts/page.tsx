"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Bell,
  Heart,
  LayoutDashboard,
  FileText,
  Activity,
  ArrowLeft,
  Search,
  Clock,
  Trash2,
  MoreVertical,
  LogOut,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOutUser } from "@/lib/auth-client";
import { useRealtimeNotifications } from "@/lib/notifications";
import { getNotificationUi } from "@/lib/notification-ui";

export default function AlertsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const router = useRouter();
  const { notifications, clearAllNotifications, dismissNotification } = useRealtimeNotifications(authUser?.uid, 100);

  const clearNotifications = () => {
    void clearAllNotifications();
  };

  const removeNotification = (id: string) => {
    void dismissNotification(id);
  };

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
    setLoading(false);
  }, [authUser, authLoading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <div className="relative">
          <Activity className="w-12 h-12 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Accessing Alert Stream...</p>
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
          <span className="hidden xl:block text-sm font-black text-slate-950 tracking-tighter uppercase italic">Health<span className="text-rose-600">Med</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {[
            { icon: LayoutDashboard, label: "Overview", active: false, href: "/dashboard" },
            { icon: FileText, label: "Records", active: false, href: "/dashboard/records" },
            { icon: Activity, label: "Vitals", active: false, href: "/dashboard/vitals" },
          ].map((item, idx) => (
            <Link key={idx} href={item.href} className={`w-full flex items-center justify-center xl:justify-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 group ${item.active ? 'bg-slate-950 text-white shadow-xl shadow-slate-200' : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50/50'}`}>
              <item.icon className={`w-5 h-5 ${item.active ? 'text-rose-500' : ''}`} />
              <span className="hidden xl:block text-xs font-black uppercase tracking-widest">{item.label}</span>
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
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 xl:px-10 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-1.5 hover:bg-slate-100 rounded-full transition-colors lg:hidden">
              <ArrowLeft className="w-4.5 h-4.5 text-slate-950" />
            </Link>
            <h1 className="text-lg xl:text-xl font-[1000] text-slate-950 tracking-tighter flex items-center gap-2.5">
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-xs xl:text-sm italic uppercase tracking-widest font-black">Alerts</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 xl:gap-5">
            <Link href="/dashboard/profile" className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white text-[9px] font-black ring-2 ring-slate-100 ring-offset-2">
              {authUser?.displayName?.substring(0, 2).toUpperCase() || "PT"}
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 xl:p-10 space-y-8 lg:max-w-4xl">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full w-fit">
                <Bell className="w-2.5 h-2.5 text-rose-600" />
                <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Notification History</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-[1000] text-slate-950 tracking-tighter leading-tight italic uppercase decoration-rose-100 decoration-8 underline-offset-[-2px]">
                Full <span className="text-rose-600 underline">Alerts</span>.
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-lg">View and manage the complete history of medical alerts and system notifications.</p>
            </div>
            
            {notifications.length > 0 && (
              <button 
                onClick={clearNotifications}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm"
              >
                Clear All Notifications <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {notifications.length > 0 ? (
              notifications.map((n) => (
                <div key={n.id} className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative">
                  <div className="flex gap-6 items-start">
                    <div className={`${getNotificationUi(n.type).color} p-4 rounded-[1.25rem] h-fit shadow-inner`}>
                      {(() => {
                        const Icon = getNotificationUi(n.type).icon;
                        return <Icon className={`w-6 h-6 ${getNotificationUi(n.type).iconColor}`} />;
                      })()}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-950 uppercase tracking-tight">{n.title}</p>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-bold leading-relaxed max-w-2xl">{n.desc}</p>
                      <div className="pt-3 flex items-center gap-4">
                        <button className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline">Mark as read</button>
                        <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-950">Details</button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeNotification(n.id)}
                      className="p-2 opacity-0 group-hover:opacity-100 hover:bg-slate-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-slate-300 hover:text-rose-600" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-20 bg-white border border-dashed border-slate-200 rounded-[3rem] space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                  <Bell className="w-8 h-8 text-slate-200" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-black text-slate-950 uppercase tracking-widest">Inbox Clean</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">No pending medical alerts at this time.</p>
                </div>
                <Link href="/dashboard" className="px-6 py-2.5 bg-slate-950 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:shadow-lg transition-all">
                  Return to Dashboard
                </Link>
              </div>
            )}
          </motion.div>

        </div>
      </main>
    </div>
  );
}
