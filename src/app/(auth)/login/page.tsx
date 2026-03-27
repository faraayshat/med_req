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
              Secure <br/> Patient <br/> <span className="text-rose-600">Access.</span>
            </h1>
            <p className="text-slate-400 text-base xl:text-xl font-bold max-w-md leading-relaxed">
              The universal standard for <span className="text-white">clinical history</span>, real-time vitals, and physician directives.
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

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 lg:p-10 xl:p-16 relative bg-rose-50/10 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-6 xl:space-y-8 my-auto"
        >
          <div className="space-y-3 xl:space-y-4 lg:text-left text-center">
            <h2 className="text-3xl xl:text-5xl font-[1000] text-slate-950 tracking-tighter uppercase italic">Welcome Back.</h2>
            <div className="w-12 xl:w-16 h-1.5 bg-rose-600 rounded-full lg:mx-0 mx-auto" />
          </div>

          <div className="hospital-card p-6 xl:p-10 border-2 border-slate-50 bg-white/50 backdrop-blur-xl shadow-2xl shadow-slate-100 transition-all duration-500 hover:shadow-rose-100/50 space-y-6 xl:space-y-8">
            <form onSubmit={handleLogin} className="space-y-5 xl:space-y-6">
              <div className="space-y-1.5">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Patient ID (Email)</p>
                <div className="relative group/input group">
                  <Mail className="absolute left-4 xl:left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 xl:w-5 xl:h-5 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="email"
                    placeholder="physician@id.com"
                    className="hospital-input pl-12 xl:pl-14 py-3.5 xl:py-4.5 text-xs xl:text-sm rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Vault Access</p>
                  <Link href="#" className="text-[9px] font-black text-rose-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Passkey Reset</Link>
                </div>
                <div className="relative group/input group">
                  <Lock className="absolute left-4 xl:left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 xl:w-5 xl:h-5 text-slate-300 group-focus-within/input:text-rose-600 transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="hospital-input pl-12 xl:pl-14 py-3.5 xl:py-4.5 text-xs xl:text-sm rounded-full bg-slate-50/50 border-slate-100 hover:border-rose-200 focus:border-rose-500 transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 xl:p-4 bg-rose-50 border border-rose-100 rounded-xl xl:rounded-2xl text-rose-600 text-[9px] xl:text-[10px] font-black uppercase tracking-tight text-center italic flex items-center justify-center gap-3">
                  <div className="w-1 h-1 bg-rose-600 rounded-full animate-pulse" />
                  Authorization Error: {error}
                </div>
              )}

              <button type="submit" className="hospital-button-primary w-full py-4 xl:py-5 text-lg xl:text-xl group rounded-full shadow-2xl shadow-rose-200 hover:shadow-rose-400/40">
                Login
                <ArrowRight className="w-5 h-5 xl:w-6 xl:h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </button>
            </form>

            <div className="relative py-1 xl:py-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
              <div className="relative flex justify-center text-[8px] xl:text-[9px] uppercase font-black tracking-[0.3em]"><span className="bg-white/80 px-4 xl:px-6 text-slate-300 italic backdrop-blur-sm">Other Platforms</span></div>
            </div>

            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 xl:gap-4 p-3.5 xl:p-5 border-2 border-slate-100 rounded-full font-[1000] text-slate-950 uppercase tracking-[0.2em] text-[9px] xl:text-[11px] hover:bg-slate-50 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 group">
              <svg className="w-3.5 h-3.5 xl:w-4.5 xl:h-4.5 transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>

            <p className="text-center mt-12 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
              New to HealthMed?{" "}
              <Link href="/signup" className="text-rose-600 hover:text-rose-700 transition-colors underline decoration-2 underline-offset-8">Register Profile</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
