"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
  Loader2
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/AuthProvider";

export default function ProfileSettings() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: ""
  });
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!authUser) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", authUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFormData({
            fullName: data.fullName || authUser.displayName || "",
            email: authUser.email || ""
          });
        } else {
          setFormData({
            fullName: authUser.displayName || "",
            email: authUser.email || ""
          });
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [authUser, authLoading, router]);

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
        <Activity className="w-12 h-12 text-rose-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row antialiased">
      {/* Sidebar - Reusing Dashboard Aesthetic */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen transition-all">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-rose-600 p-2.5 rounded-xl">
            <Heart className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="text-base font-black text-slate-950 tracking-tighter uppercase italic">Health<span className="text-rose-600">Med</span></span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link href="/dashboard" className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-all">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest">Overview</span>
          </Link>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-950 text-white shadow-xl shadow-slate-200">
            <User className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Profile Identity</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-8 xl:px-12 flex items-center justify-between shrink-0 sticky top-0 z-50">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-950" />
            </Link>
            <h1 className="text-xl xl:text-2xl font-[1000] text-slate-950 tracking-tighter">Identity Management.</h1>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 xl:p-12">
          <div className="max-w-2xl">
            <div className="space-y-2 mb-10">
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full w-fit">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Medical Standard Protocol</span>
              </div>
              <h2 className="text-3xl xl:text-4xl font-[1000] text-slate-950 tracking-tighter uppercase italic">Account Parameters.</h2>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Synchronize your clinical identity across the network</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] p-8 xl:p-12 shadow-2xl shadow-slate-200/40"
            >
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="space-y-6">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Legal Name</p>
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-rose-600 transition-colors" />
                      <input
                        type="text"
                        className="hospital-input pl-14 py-4.5 rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field - Read Only */}
                  <div className="space-y-2 opacity-60">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Patient Email (Unique ID)</p>
                    <div className="relative">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input
                        type="email"
                        className="hospital-input pl-14 py-4.5 rounded-full bg-slate-50/10 border-slate-100 cursor-not-allowed font-bold text-slate-400"
                        value={formData.email}
                        readOnly
                      />
                    </div>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-4 italic">Encrypted IDs cannot be changed through this portal</p>
                  </div>
                </div>

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
                  className="hospital-button-primary w-full py-5 rounded-full shadow-2xl shadow-rose-200 flex items-center justify-center gap-3 group active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {updating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Verify & Sync Updates
                    </>
                  )}
                </button>
              </form>
            </motion.div>

            <div className="mt-12 p-8 border border-slate-100 rounded-[2rem] bg-slate-50/50 flex items-start gap-4">
               <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <Lock className="w-5 h-5 text-slate-400" />
               </div>
               <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Vault Security</h4>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
                    Changes to your clinical identity are logged and broadcasted to authorized healthcare nodes. 
                    Standard AES-256 bit encryption is applied to all transit packets.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
