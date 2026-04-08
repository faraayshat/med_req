import Link from "next/link";
import { Heart, ShieldCheck, Lock, Database } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | MedReq",
  description: "How MedReq collects, uses, and protects personal and health-related data.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-rose-600">
          <Heart className="h-3.5 w-3.5" />
          Back To Home
        </Link>

        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">
            <ShieldCheck className="h-3.5 w-3.5" />
            Privacy Policy
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Privacy Policy</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Effective date: April 8, 2026. This policy explains what information MedReq processes, why it is processed, and how users can control that data.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">1. Information We Process</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Account data: email address, authentication identifiers, and session metadata.</li>
            <li>Clinical input: symptoms, vitals, demographic context, and submitted assessment details.</li>
            <li>System telemetry: request identifiers, rate-limit events, and operational metrics required for reliability and abuse prevention.</li>
          </ul>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">2. How Data Is Used</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>To provide health assessment workflows and structured recommendation outputs.</li>
            <li>To secure the platform, including session verification, anomaly monitoring, and abuse controls.</li>
            <li>To improve reliability through diagnostics and service-level quality monitoring.</li>
          </ul>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">3. Data Protection Controls</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Lock className="h-4 w-4" />
                Access Security
              </p>
              <p className="text-sm text-slate-600">Server-verified sessions, secure cookie controls, and route-level authorization checks protect account access.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Database className="h-4 w-4" />
                Data Handling
              </p>
              <p className="text-sm text-slate-600">Clinical records are stored with strict ownership checks and controlled read/write security rules.</p>
            </article>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">4. Retention, Rights, And Contact</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Data is retained only as needed for service operation, legal obligations, and user-requested continuity. Users may request account and data review or deletion in accordance with applicable law.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            For privacy requests or concerns, contact the project owner through the repository security reporting channel documented in SECURITY.md.
          </p>
        </section>
      </div>
    </main>
  );
}
