"use client";

import Link from "next/link";
import { ArrowLeft, Home, Activity, ShieldCheck, Timer } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 antialiased">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.2),transparent_38%),radial-gradient(circle_at_50%_90%,rgba(239,68,68,0.16),transparent_36%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-4xl items-center justify-center p-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full rounded-3xl border border-white/20 bg-slate-900/80 p-6 shadow-2xl shadow-teal-900/30 backdrop-blur-xl md:p-10"
        >
          <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-teal-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                <Activity className="h-3.5 w-3.5" />
                Critical Route Alert
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl">404: Patient Record Not Found</h1>
                <p className="max-w-xl text-sm leading-relaxed text-slate-300 md:text-base">
                  This endpoint is not responding to current triage requests. The page may have moved, or the record link is outdated.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300"
                >
                  <Home className="h-4 w-4" />
                  Return To Dashboard
                </Link>
                <button
                  onClick={() => window.history.back()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-slate-800/60 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700/70"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go Back
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-slate-950/70 p-5">
              <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                <span>ER Console</span>
                <span>Node 04</span>
              </div>

              <div className="space-y-4">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700"
                >
                  <div className="h-full w-2/3 rounded-full bg-rose-400" />
                </motion.div>

                <div className="grid gap-3 text-sm text-slate-300">
                  <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-teal-300" />
                      Session Integrity
                    </span>
                    <span className="font-semibold text-teal-300">Verified</span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2">
                    <span className="inline-flex items-center gap-2">
                      <Timer className="h-4 w-4 text-amber-300" />
                      Route Availability
                    </span>
                    <span className="font-semibold text-amber-300">Unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
