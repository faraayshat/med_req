'use client';

import Link from 'next/link';
import { Heart, Activity, ShieldCheck, ClipboardPlus, Stethoscope, ChevronRight, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import ThemeSelector from '@/components/theme/ThemeSelector';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden antialiased dark:bg-slate-950 dark:text-slate-100">
      <nav className="fixed top-0 inset-x-0 z-[100] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto grid grid-cols-[auto_1fr_auto] items-center gap-3 bg-white/90 backdrop-blur-md border border-slate-200/50 p-2 rounded-full shadow-sm dark:bg-slate-900/90 dark:border-slate-700/70 dark:shadow-none">
          <div className="flex items-center gap-2 group px-4">
            <div className="bg-rose-600 p-1.5 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white/20" />
            </div>
            <span className="text-sm font-bold tracking-tighter uppercase italic text-slate-900 dark:text-slate-100">Health<span className="text-rose-600 dark:text-rose-400">Med</span></span>
          </div>
          
          <div className="hidden md:flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-300">
             <Link href="#features" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">Features</Link>
             <Link href="#vitals" className="hover:text-rose-600 dark:hover:text-rose-400 transition-colors">Vitals</Link>
          </div>

          <div className="flex items-center justify-end gap-2 pr-1">
            <div className="hidden lg:block">
              <ThemeSelector compact />
            </div>
            {!loading && (
              user ? (
                <Link href="/dashboard" className="bg-rose-600 text-white px-4 py-2 text-[10px] font-bold rounded-full hover:bg-rose-700 transition-all flex items-center gap-2">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-[10px] font-bold uppercase text-slate-500 px-3 py-2 hover:text-rose-600 dark:hover:text-rose-400 transition-colors dark:text-slate-300">
                    Login
                  </Link>
                  <Link href="/signup" className="bg-rose-600 text-white px-5 py-2 text-[10px] font-bold rounded-full hover:bg-rose-700 transition-all">
                    Join
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      <main className="relative min-h-[85vh] flex flex-col items-center justify-center pt-20 px-6">
        <div className="max-w-3xl w-full flex flex-col items-center text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
            <div className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 italic">Enterprise Medical Standard</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-8xl font-black text-slate-950 tracking-tight leading-[1.1] uppercase italic">
            Medical <span className="text-rose-600">Standard.</span> <br/> Digital Vault.
          </h1>

          <p className="text-sm sm:text-base text-slate-500 font-medium max-w-xl leading-relaxed">
            The universal infrastructure for <span className="text-slate-950 font-bold">clinical records</span> and real-time vitals. Optimized for professional provider access.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs pt-4">
            {!loading && (
              user ? (
                <Link href="/dashboard" className="bg-rose-600 text-white py-3 px-6 text-sm font-bold rounded-full shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all text-center flex items-center justify-center gap-2 w-full">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="bg-rose-600 text-white py-3 px-6 text-sm font-bold rounded-full shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all text-center w-full">
                    Get Started
                  </Link>
                  <Link href="/login" className="bg-slate-950 text-white py-3 px-6 text-sm font-bold rounded-full hover:bg-slate-900 transition-all text-center w-full">
                    Sign In
                  </Link>
                </>
              )
            )}
          </div>

          <div id="vitals" className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
             {[
               { label: "Precision", value: "70%", sub: "Verified" },
               { label: "Latency", value: "<1ms", sub: "Instant" },
               { label: "Security", value: "AES-256", sub: "Standard" },
               { label: "Uptime", value: "99.9%", sub: "Active" }
             ].map((v, i) => (
               <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">{v.label}</p>
                  <p className="text-xl font-black text-slate-950 tracking-tighter">{v.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                     <div className="w-1 h-1 rounded-full bg-emerald-500" />
                     <span className="text-[8px] font-bold uppercase text-emerald-600">{v.sub}</span>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </main>

      <section id="features" className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase italic tracking-tight">Clinical <span className="text-rose-600">Artifacts.</span></h2>
            <p className="text-sm text-slate-500 font-medium max-w-md">Secure, longitudinal analysis for modern healthcare environments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-rose-100 transition-colors flex flex-col items-center text-center">
               <div className="bg-rose-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                  <ShieldCheck className="w-6 h-6 text-rose-600" />
               </div>
               <h3 className="text-lg font-bold text-slate-950 mb-2">Encrypted Vault</h3>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">AES-256 bit encryption for all patient record archives.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-rose-100 transition-colors flex flex-col items-center text-center">
               <div className="bg-rose-50 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                  <ClipboardPlus className="w-6 h-6 text-rose-600" />
               </div>
               <h3 className="text-lg font-bold text-slate-950 mb-2">Data Synthesis</h3>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">Standardized analysis for critical medical events.</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-rose-100 shadow-sm flex flex-col items-center text-center">
               <div className="bg-rose-600 w-12 h-12 flex items-center justify-center rounded-xl mb-4">
                  <Stethoscope className="w-6 h-6 text-white" />
               </div>
               <h3 className="text-lg font-bold text-slate-950 mb-2">Clinical Export</h3>
               <p className="text-xs text-slate-500 font-medium leading-relaxed">Professional structured PDF reports for physician review.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-100 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col items-center space-y-8">
           <div className="flex items-center gap-2">
              <div className="bg-rose-600 p-1.5 rounded-lg flex items-center justify-center">
                 <Heart className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tighter uppercase italic">Health<span className="text-rose-600">Med</span></span>
           </div>
           <div className="flex gap-8 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <Link href="/privacy" className="hover:text-rose-600">Privacy</Link>
              <Link href="/security" className="hover:text-rose-600">Security</Link>
              <Link href="/terms" className="hover:text-rose-600">Terms</Link>
           </div>
           <p className="text-slate-400 text-[9px] font-medium italic">&copy; 2026 HealthMed. Clinical Standards Verified.</p>
        </div>
      </footer>
    </div>
  );
}
