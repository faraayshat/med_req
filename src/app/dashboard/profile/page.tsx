"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs, limit } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  ArrowLeft, 
  Save, 
  Activity,
  Heart,
  LayoutDashboard,
  Bell,
  Lock,
  Loader2,
  Clock,
  History, 
  FileText, 
  ChevronRight, 
  UserCircle,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Plus
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";
import { signOutUser } from "@/lib/auth-client";

export default function ProfileSettings() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    bio: "",
    phone: ""
  });
  const [history, setHistory] = useState<any[]>([]);
  const [updating, setUpdating] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', title: 'Health Analysis Complete', desc: 'Your latest biometric sync shows optimal heart rate stability.', time: '2 mins ago', icon: CheckCircle2, color: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { id: 2, type: 'alert', title: 'Prescription Reminder', desc: 'Evening dosage for Vitamin D3 is due in 15 minutes.', time: '1 hour ago', icon: AlertCircle, color: 'bg-rose-100', iconColor: 'text-rose-600' }
  ]);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  const clearNotifications = () => setNotifications([]);
  const removeNotification = (id: number) => setNotifications(notifications.filter(n => n.id !== id));

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    const fetchProfileData = async () => {
      try {
        // Fetch User Profile
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            fullName: data.fullName || authUser.displayName || "",
            email: authUser.email || "",
            bio: data.bio || "",
            phone: data.phone || ""
          });
        } else {
          setFormData({
            fullName: authUser.displayName || "",
            email: authUser.email || "",
            bio: "",
            phone: ""
          });
        }

        // Fetch History (Simplified: fetching recent reports as history)
        const q = query(
          collection(db, "reports"),
          where("userId", "==", authUser.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const querySnapshot = await getDocs(q);
        setHistory(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      } catch (err) {
        console.error("Error fetching profile data:", err);
      }
    };

    fetchProfileData();
  }, [authUser, authLoading, router]);

  const handleLogout = async () => {
    await signOutUser();
    router.push("/");
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    setUpdating(true);
    setMessage({ type: "", text: "" });

    try {
      // 1. Update Firebase Auth Profile
      await updateProfile(authUser, {
        displayName: formData.fullName
      });

      // 2. Update Firestore User Document
      await updateDoc(doc(db, "users", authUser.uid), {
        fullName: formData.fullName,
        bio: formData.bio,
        phone: formData.phone,
        updatedAt: new Date()
      });

      setMessage({ type: "success", text: "Identity parameters updated successfully." });
    } catch (err: any) {
      console.error("Update error:", err);
      setMessage({ type: "error", text: err.message || "Failed to sync updates." });
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12">
        <div className="relative">
          <Activity className="w-12 h-12 text-rose-500 animate-pulse" />
          <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full animate-pulse" />
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Accessing Secure Identity...</p>
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
            { icon: FileText, label: "Records", active: false, href: "/dashboard/records" },
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
              <p className="text-[11px] text-slate-500 font-bold mb-3 leading-tight">Your medical data is encrypted via AES-256.</p>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-[10px] font-black text-rose-600 uppercase tracking-widest hover:gap-3 transition-all"
              >
                Logout <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="xl:hidden flex items-center justify-center w-full p-2 text-rose-600"
            >
               <LogOut className="w-5 h-5" />
            </button>
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
              Dashboard <span className="text-slate-200 font-light">/</span> <span className="text-rose-600 text-xs xl:text-sm italic uppercase tracking-widest font-black">Identity</span>
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

        <div className="flex-1 overflow-y-auto p-6 xl:p-10 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Profile Editing Section */}
            <div className="xl:col-span-2 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-2.5 py-0.5 bg-rose-50 border border-rose-100 rounded-full w-fit">
                  <ShieldCheck className="w-2.5 h-2.5 text-rose-600" />
                  <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Medical Standard Protocol</span>
                </div>
                <h2 className="text-3xl xl:text-4xl font-[1000] text-slate-950 tracking-tighter leading-tight italic uppercase decoration-rose-100 decoration-8 underline-offset-[-2px]">
                   Clinical <span className="text-rose-600 underline">Identity</span>.
                </h2>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest max-w-lg">Synchronize your biographic parameters across the secure healthcare network.</p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-[2rem] p-6 xl:p-10 shadow-2xl shadow-slate-200/40 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 rounded-bl-[4rem] -mr-8 -mt-8" />
                
                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-5">
                    {/* Name Field */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Full Legal Name</p>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-rose-600 transition-colors" />
                        <input
                          type="text"
                          className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 transition-all font-bold text-slate-900 text-xs placeholder:text-slate-300"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="e.g. John Doe"
                          required
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Emergency Contact</p>
                      <div className="relative group">
                        <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-rose-600 transition-colors" />
                        <input
                          type="text"
                          className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 transition-all font-bold text-slate-900 text-xs placeholder:text-slate-300"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="+1 234 567 890"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Bio/Description */}
                    <div className="space-y-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-3">Medical Note / Bio</p>
                      <div className="relative group">
                        <UserCircle className="absolute left-4 top-4 w-4 h-4 text-slate-300 group-focus-within:text-rose-600 transition-colors" />
                        <textarea
                          rows={4}
                          className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-500 transition-all font-bold text-slate-900 text-xs placeholder:text-slate-300 resize-none"
                          value={formData.bio}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          placeholder="Brief medical history or personal bio..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-6 pt-2">
                    {message.text && (
                      <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-wide flex items-center gap-3 ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                      }`}>
                        {message.type === 'success' ? <ShieldCheck className="w-4 h-4" /> : <Activity className="w-4 h-4 animate-pulse" />}
                        {message.text}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={updating}
                      className="bg-rose-600 hover:bg-rose-700 text-white w-full py-5 rounded-3xl shadow-2xl shadow-rose-200 flex items-center justify-center gap-3 group active:scale-[0.98] transition-all disabled:opacity-50"
                    >
                      {updating ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                          <span className="text-xs font-black uppercase tracking-widest">Verify & Sync Updates</span>
                        </>
                      )}
                    </button>
                    
                    <div className="pt-6 border-t border-slate-100 flex items-center gap-4 opacity-50">
                       <Lock className="w-4 h-4 text-slate-400" />
                       <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Your email ({formData.email}) is locked to this vault. Contact admin for recovery.</p>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* History Section */}
            <div className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-[1000] text-slate-950 tracking-tighter uppercase italic flex items-center gap-3">
                  <History className="w-6 h-6 text-rose-600" /> History
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recent interactions logged</p>
              </div>

              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-[2rem] p-8 text-center">
                    <History className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No previous logs</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <Link 
                      key={item.id} 
                      href={`/results/${item.id}`}
                      className="group block bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-rose-200 hover:shadow-xl hover:shadow-rose-100 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[8px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 uppercase">Verified</span>
                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-300 uppercase">
                          <Clock className="w-3 h-3" /> {new Date(item.createdAt?.seconds * 1000).toLocaleDateString()}
                        </div>
                      </div>
                      <p className="text-sm font-black text-slate-950 tracking-tight group-hover:text-rose-600 transition-colors">{item.reason || "General Assessment"}</p>
                      <div className="mt-4 flex items-center justify-between">
                         <span className="text-[9px] font-black text-slate-300 uppercase italic">ID: {item.id.slice(0, 8)}</span>
                         <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-rose-500 transition-colors" />
                      </div>
                    </Link>
                  ))
                )}
                
                <div className="p-8 bg-slate-950 rounded-[2.5rem] text-white relative overflow-hidden group mt-12">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-rose-600/20 rounded-full blur-3xl group-hover:bg-rose-600/40 transition-all" />
                   <h4 className="text-lg font-black tracking-tighter mb-2 italic">Vault <span className="text-rose-500">Analytics</span></h4>
                   <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-6">Aggregate health scores over time.</p>
                   <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-rose-500 rounded-full" />
                   </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
