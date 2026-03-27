import Link from 'next/link';
import { Heart, Activity, ShieldCheck, Plus, ArrowRight, ClipboardPlus, Stethoscope, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white selection:bg-rose-100 selection:text-rose-900">
      {/* Dynamic Navigation */}
      <nav className="fixed top-0 inset-x-0 z-[100] p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between bg-white/70 backdrop-blur-2xl border border-rose-100/50 p-4 rounded-[2rem] shadow-2xl shadow-rose-600/5">
          <div className="flex items-center gap-3 group px-4">
            <div className="bg-rose-600 p-2 rounded-xl group-hover:rotate-[15deg] transition-transform duration-500">
              <Heart className="w-6 h-6 text-white fill-white/20" />
            </div>
            <span className="text-2xl font-[1000] text-slate-950 tracking-tighter uppercase italic">HealthDesk</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-black text-xs uppercase tracking-[0.2em] text-slate-500">
             <Link href="#" className="hover:text-rose-600 transition-colors">Shield Protocol</Link>
             <Link href="#" className="hover:text-rose-600 transition-colors">Lab Access</Link>
             <Link href="#" className="hover:text-rose-600 transition-colors">Diagnostics</Link>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-600 px-6 py-3 hover:text-rose-600 transition-colors pt-5">
              Member Vault
            </Link>
            <Link href="/signup" className="hospital-button-primary px-6 py-3 text-sm h-fit">
              Portal Access
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Masterpiece */}
      <main className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Decorative Light Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-100/40 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-hospital-100/30 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto relative">
          <div className="flex flex-col items-center text-center space-y-12">
            <div className="inline-flex items-center gap-3 bg-white border border-rose-100 px-6 py-2.5 rounded-full shadow-xl shadow-rose-600/5 animate-bounce-slow">
               <div className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-600">Vitals Transmission Active</span>
            </div>

            <h1 className="hospital-heading text-center max-w-5xl balance">
              Physician-Grade <span className="text-rose-600">Health Insights</span> <br className="hidden md:block"/> In Your Pocket.
            </h1>

            <p className="text-xl md:text-2xl text-slate-500 font-bold max-w-2xl leading-relaxed">
              The world's most sophisticated personal health data vault. Encrypted, AI-optimized, and ready for clinical review.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg pt-4">
              <Link href="/signup" className="hospital-button-primary flex-1 py-5 text-lg group">
                Register Portal <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/login" className="flex-1 bg-slate-950 text-white rounded-full font-black text-lg px-8 py-5 hover:bg-slate-900 transition-all flex items-center justify-center gap-3">
                Secure Vault
              </Link>
            </div>

            {/* Vitals Ribbon */}
            <div className="pt-20 grid grid-cols-2 lg:grid-cols-4 gap-12 w-full max-w-5xl">
               {[
                 { label: "Patient Normal Ref", value: "98.6°F", sub: "Normal" },
                 { label: "Resting Heart Beat", value: "72 BPM", sub: "Stable" },
                 { label: "Blood Saturation", value: "99%", sub: "Optimal" },
                 { label: "Neural Recovery", value: "A+", sub: "Peak" }
               ].map((v, i) => (
                 <div key={i} className="text-center group">
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 group-hover:text-rose-600 transition-colors">{v.label}</p>
                    <p className="text-4xl font-[1000] text-slate-950 tracking-tighter mb-1">{v.value}</p>
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">{v.sub}</span>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </main>

      {/* Feature Section: The Hospital Standard */}
      <section className="py-32 px-6 bg-rose-50/30">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="space-y-6">
              <h2 className="text-6xl font-[1000] text-slate-950 tracking-tighter leading-none">Clinical Artifacts. <br/> <span className="text-rose-600/40 italic">Zero Compromise.</span></h2>
              <p className="text-slate-500 text-xl font-bold max-w-xl">Every data point we ingest is verified through our proprietary Shield Protocol, ensuring your records meet clinical standards.</p>
            </div>
            <Link href="#" className="hidden md:flex items-center gap-3 font-black text-xs uppercase tracking-[0.3em] text-rose-600 hover:gap-6 transition-all pt-5 pb-5 px-10 border-2 border-rose-200 rounded-full">
               System Architecture <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hospital-card p-12 group hover:bg-rose-600 transition-all duration-700">
               <div className="bg-rose-50 w-fit p-5 rounded-3xl mb-12 group-hover:scale-flag group-hover:bg-white transition-all">
                  <ShieldCheck className="w-10 h-10 text-rose-600" />
               </div>
               <h3 className="text-3xl font-[1000] text-slate-950 group-hover:text-white tracking-tighter mb-6">Encrypted Vault</h3>
               <p className="text-slate-500 group-hover:text-white/80 font-bold leading-relaxed mb-8">Physician-grade AES-256 bit encryption for every lab result, imaging archive, and clinical note stored.</p>
               <div className="h-[2px] w-12 bg-rose-200 group-hover:bg-white/40 transition-all" />
            </div>

            <div className="hospital-card p-12 group hover:bg-slate-950 transition-all duration-700">
               <div className="bg-rose-50 w-fit p-5 rounded-3xl mb-12 group-hover:bg-white transition-all">
                  <ClipboardPlus className="w-10 h-10 text-rose-600" />
               </div>
               <h3 className="text-3xl font-[1000] text-slate-950 group-hover:text-white tracking-tighter mb-6">Data Synthesis</h3>
               <p className="text-slate-500 group-hover:text-white/80 font-bold leading-relaxed mb-8">AI-driven longitudinal analysis that identifies anomalies before they become critical medical events.</p>
               <div className="h-[2px] w-12 bg-rose-200 group-hover:bg-rose-600 transition-all" />
            </div>

            <div className="hospital-card p-12 group hover:bg-rose-50 transition-all duration-700 hover:border-rose-300">
               <div className="bg-rose-50 w-fit p-5 rounded-3xl mb-12 group-hover:bg-rose-600 transition-all">
                  <Stethoscope className="w-10 h-10 text-rose-600 group-hover:text-white" />
               </div>
               <h3 className="text-3xl font-[1000] text-slate-950 tracking-tighter mb-6">Clinical Export</h3>
               <p className="text-slate-500 font-bold leading-relaxed mb-8">Instantly generate structured PDF reports optimized for review by board-certified primary care physicians.</p>
               <div className="h-[2px] w-12 bg-rose-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer System */}
      <footer className="py-32 px-6 border-t border-rose-100 bg-white relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center space-y-12">
           <div className="flex items-center gap-3 grayscale opacity-30">
              <Heart className="w-6 h-6 text-rose-600" />
              <span className="text-2xl font-[1000] text-slate-950 tracking-tighter uppercase italic">HealthDesk</span>
           </div>
           
           <div className="text-center space-y-4">
              <p className="text-xs font-[900] text-slate-500 uppercase tracking-[1em] ml-[1em]">Universal Health Interface</p>
              <p className="text-slate-500 font-bold max-w-sm mx-auto">Providing unified healthcare data standards for the next generation of patient care.</p>
           </div>

           <div className="pt-20 border-t border-slate-50 w-full flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
                 <Link href="#" className="hover:text-rose-600 transition-colors">Compliance</Link>
                 <Link href="#" className="hover:text-rose-600 transition-colors">Privacy Vault</Link>
                 <Link href="#" className="hover:text-rose-600 transition-colors">System Status</Link>
              </div>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">&copy; 2026 HealthDesk Global Inc. All rights reserved.</p>
           </div>
        </div>
      </footer>
    </div>
  );
}
