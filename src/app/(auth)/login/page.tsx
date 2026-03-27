"use client";

import { useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { setCookie } from "cookies-next";
import { Heart, Mail, Lock, Languages, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuthSuccess = async (user: any) => {
    setCookie("__session", user.uid, { maxAge: 60 * 60 * 24 * 7 });
    router.push("/dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      await handleAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await handleAuthSuccess(user);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white relative overflow-hidden">
      {/* Branding Side - Hidden on Mobile */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 p-20 flex-col justify-between relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-rose-600/10 rounded-full blur-[120px] -z-0" />
         
         <div className="relative z-10 flex items-center gap-3">
            <div className="bg-white/10 p-3 rounded-2xl">
               <Heart className="w-8 h-8 text-rose-500 fill-rose-500/20" />
            </div>
            <span className="text-3xl font-[1000] text-white tracking-widest italic uppercase">HealthDesk</span>
         </div>

         <div className="relative z-10 space-y-8">
            <h1 className="text-7xl font-[1000] text-white leading-[1.05] tracking-tighter">Secure <br/> Patient <br/> <span className="text-rose-600">Portal.</span></h1>
            <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">Access your medical history, vitals log, and physician-reviewed reports in one unified dashboard.</p>
         </div>

         <div className="relative z-10 flex gap-4 bg-white/5 border border-white/10 p-4 rounded-3xl w-fit">
            <div className="bg-rose-500/10 p-3 rounded-2xl">
               <ShieldCheck className="w-7 h-7 text-rose-500" />
            </div>
            <div>
               <p className="text-white font-black text-sm uppercase tracking-widest">Metabolic Shield</p>
               <p className="text-slate-500 font-bold text-xs uppercase underline">Active Protection</p>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-20 relative bg-rose-50/50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-12"
        >
          <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-950 tracking-tighter">Welcome Back.</h2>
            <p className="text-slate-500 text-lg font-bold">Please enter your credentials to access your portal</p>
          </div>

          <div className="hospital-card p-10 space-y-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Email System ID</label>
                <div className="relative group/input">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="patient@id.com"
                    className="hospital-input pl-14"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Medical Password</label>
                  <Link href="#" className="text-xs font-black text-rose-600 uppercase hover:underline">Forgot?</Link>
                </div>
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="hospital-input pl-14"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && <div className="p-5 bg-rose-50 text-rose-600 rounded-2xl text-sm font-black border-2 border-rose-100 flex items-center gap-3"><Activity className="w-5 h-5" /> {error}</div>}

              <button type="submit" className="hospital-button-primary w-full py-6 text-xl group">
                Enter Portal
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-100/50"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-6 text-slate-400 font-black tracking-widest">Third Party Auth</span></div>
            </div>

            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-slate-900 hover:bg-white hover:border-rose-100 hover:shadow-xl transition-all group">
              <div className="bg-white p-2 rounded-xl shadow-sm"><Languages className="w-5 h-5 text-rose-600" /></div>
              Google Health Sync
            </button>

            <p className="text-center mt-12 text-slate-500 font-bold">
              New patient?{" "}
              <Link href="/signup" className="text-rose-600 font-black hover:underline underline-offset-8">Register Portal</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
