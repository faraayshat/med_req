"use client";

import Link from "next/link";
import { 
  AlertCircle, 
  ArrowLeft, 
  Search, 
  Home, 
  Activity,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 antialiased">
      <div className="max-w-md w-full text-center space-y-8">
        
        {/* Animated Icon Section */}
        <div className="relative mx-auto w-32 h-32">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-rose-100 rounded-[2.5rem] rotate-12"
          />
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute inset-0 bg-white border-2 border-slate-200 rounded-[2.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center"
          >
            <div className="relative">
              <Activity className="w-12 h-12 text-rose-500" />
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5] 
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full">Error 404</span>
          </div>
          <h1 className="text-4xl font-[1000] text-slate-950 tracking-tighter">Clinical Link <span className="text-rose-600 italic">Severed.</span></h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed px-4">
            The medical record or clinical portal you are trying to access cannot be located on this node. It may have been relocated or archived.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 pt-4">
          <Link href="/dashboard" className="hospital-button-primary py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black shadow-2xl shadow-rose-200 hover:scale-[1.02] active:scale-95 transition-all">
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 hover:text-slate-950 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous Diagnostic State
          </button>
        </div>

        {/* Footer Branding */}
        <div className="pt-8 flex items-center justify-center gap-2 opacity-30 grayscale">
          <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-950">Health Med Precision Node</span>
        </div>
      </div>
    </div>
  );
}
