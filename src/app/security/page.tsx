import Link from "next/link";
import { Heart, ShieldCheck, Lock, Activity } from "lucide-react";

export const metadata = {
  title: "Security | MedReq",
  description: "Security controls and vulnerability reporting for MedReq.",
};

export default function SecurityPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-rose-600">
          <Heart className="h-3.5 w-3.5" />
          Back To Home
        </Link>

        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Security Program
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Security At MedReq</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            MedReq is designed with defense-in-depth controls for authentication, data access, request safety, and operational monitoring.
          </p>
        </header>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">1. Core Security Controls</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Server-side session verification for protected routes and APIs.</li>
            <li>Same-origin checks, secure headers, payload limits, and anti-abuse request controls.</li>
            <li>Rate limiting and idempotency handling on sensitive workflows.</li>
            <li>Structured observability for incident tracing and response.</li>
          </ul>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">2. Operational Security</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Lock className="h-4 w-4" />
                Access And Sessions
              </p>
              <p className="text-sm text-slate-600">Authentication sessions use hardened cookie controls and are validated on the server for every protected operation.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Activity className="h-4 w-4" />
                Monitoring
              </p>
              <p className="text-sm text-slate-600">Security-relevant failures are logged with request IDs to speed up triage and containment.</p>
            </article>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">3. Vulnerability Reporting</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Report vulnerabilities privately and include affected routes, reproducible steps, and impact details. Do not disclose high-risk findings publicly before coordination.
          </p>
          <p className="text-sm leading-relaxed text-slate-600">
            Response workflows, support windows, and release guidance are maintained in SECURITY.md.
          </p>
        </section>
      </div>
    </main>
  );
}
