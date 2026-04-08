"use client";

import { useState } from "react";
import { auth, db, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { syncSessionForUser } from "@/lib/auth-client";
import { Heart, User, Mail, Lock, Phone, MapPin, Languages, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuthSuccess = async (user: any, extraData: any = {}) => {
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: extraData.fullName || user.displayName || "Patient",
        phone: extraData.phone || "",
        address: extraData.address || "",
        createdAt: new Date()
      }, { merge: true });

      await syncSessionForUser(user);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Firestore Error:", err);
      setError("Failed to create medical profile. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await handleAuthSuccess(user, { 
        fullName: formData.fullName, 
        phone: formData.phone, 
        address: formData.address 
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const inputClasses = "hospital-input pl-12";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-rose-500 transition-colors";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 p-12 xl:p-20 flex-col justify-between relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-[120%] h-[120%] bg-rose-600/5 rounded-full blur-[150px] -z-0" />
         <div className="absolute -bottom-20 -left-20 w-[60%] h-[60%] bg-emerald-500/5 rounded-full blur-[100px] -z-0" />
         
         <div className="relative z-10 flex items-center gap-4">
            <div className="bg-rose-600 p-2.5 rounded-2xl shadow-2xl shadow-rose-900/50">
               <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <span className="text-xl xl:text-2xl font-[1000] text-white tracking-[0.2em] italic uppercase">Health<span className="text-rose-600">Med</span></span>
         </div>

         <div className="relative z-10 space-y-6">
            <h1 className="text-5xl xl:text-7xl font-[1000] text-white leading-[0.9] tracking-tighter uppercase italic">
              Create <br/> Medical <br/> <span className="text-rose-600">Profile.</span>
            </h1>
            <p className="text-slate-400 text-base xl:text-xl font-bold max-w-md leading-relaxed">
              Join the universal standard for <span className="text-white">clinical history</span>, real-time vitals, and physician directives.
            </p>
         </div>

         <div className="relative z-10 flex items-center gap-4 bg-white/5 border-2 border-white/10 p-4 rounded-[1.5rem] w-fit backdrop-blur-md">
            <div className="bg-rose-500/20 p-2.5 rounded-xl">
               <Activity className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
               <p className="text-white font-[1000] text-[9px] uppercase tracking-[0.3em]">System Level</p>
               <p className="text-emerald-500 font-black text-[9px] uppercase tracking-widest mt-0.5 italic flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                 Operational Global
               </p>
            </div>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-10 xl:p-16 relative bg-rose-50/10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl space-y-6 xl:space-y-8 my-auto"
        >
          <div className="space-y-3 xl:space-y-4 lg:text-left text-center">
            <h2 className="text-3xl xl:text-5xl font-[1000] text-slate-950 tracking-tighter uppercase italic">Register Account.</h2>
            <div className="w-12 xl:w-16 h-1.5 bg-rose-600 rounded-full lg:mx-0 mx-auto" />
          </div>

          <div className="hospital-card p-6 xl:p-8 border-2 border-slate-50 bg-white/50 backdrop-blur-xl shadow-2xl shadow-slate-100 transition-all duration-500 hover:shadow-rose-100/50 space-y-6">
            <form onSubmit={handleSignup} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Name</p>
                <div className="relative group/input group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter Name"
                    className="hospital-input pl-11 py-3 text-[11px] xl:text-xs rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Email</p>
                <div className="relative group/input group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="hospital-input pl-11 py-3 text-[11px] xl:text-xs rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Mobile No</p>
                <div className="relative group/input group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="tel"
                    placeholder="Enter Mobile No"
                    className="hospital-input pl-11 py-3 text-[11px] xl:text-xs rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Password</p>
                <div className="relative group/input group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="hospital-input pl-11 py-3 text-[11px] xl:text-xs rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Confirm Pass</p>
                <div className="relative group/input group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="hospital-input pl-11 py-3 text-[11px] xl:text-xs rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              <div className="space-y-1 sm:col-span-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Residential Address</p>
                <div className="relative group/input group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="text"
                    placeholder="Enter Address"
                    className="hospital-input pl-11 py-3 text-[11px] xl:text-xs rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all font-bold text-slate-900"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    suppressHydrationWarning
                  />
                </div>
              </div>

              {error && (
                <div className="sm:col-span-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-[9px] font-black uppercase text-center italic flex items-center justify-center gap-2">
                  <div className="w-1 h-1 bg-rose-600 rounded-full animate-pulse" />
                  {error}
                </div>
              )}

              <button type="submit" 
                className="sm:col-span-2 hospital-button-primary py-4 text-lg mt-2 group rounded-full shadow-2xl shadow-rose-200 hover:shadow-rose-400/40"
                suppressHydrationWarning
              >
                Register Profile
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </form>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[8px] uppercase font-black tracking-[0.3em]"><span className="bg-white/80 px-4 text-slate-300 italic backdrop-blur-sm">Quick Sync</span></div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={handleGoogleSignup} 
                className="flex items-center justify-center py-3 border-2 border-slate-100 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-all group"
                title="Sync with Google"
                suppressHydrationWarning
              >
                <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              </button>
              <button 
                className="flex items-center justify-center py-3 border-2 border-slate-100 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-all group opacity-50 cursor-not-allowed"
                title="Apple ID Sync coming soon"
                suppressHydrationWarning
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.11.78.9-.04 2.02-.82 3.39-.7 1.25.07 2.51.62 3.19 1.63-2.67 1.55-2.04 5.09.68 6.22-.54 1.34-1.28 2.68-2.37 3.04zM12.03 7.25c-.09-2.22 1.74-4.14 4.01-4.24.23 2.22-1.95 4.31-4.01 4.24z"/>
                </svg>
              </button>
              <button 
                className="flex items-center justify-center py-3 border-2 border-slate-100 rounded-full hover:bg-slate-50 hover:border-slate-200 transition-all group opacity-50 cursor-not-allowed"
                title="Microsoft Sync coming soon"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#f35323" d="M1 1h10v10H1z"/><path fill="#80bb03" d="M13 1h10v10H13z"/><path fill="#05a6f0" d="M1 13h10v10H1z"/><path fill="#ffba08" d="M13 13h10v10H13z"/>
                </svg>
              </button>
            </div>

            <p className="text-center mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              Already a Member?{" "}
              <Link href="/login" className="text-rose-600 hover:text-rose-700 transition-colors underline decoration-2 underline-offset-8">Login</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
    );
}
