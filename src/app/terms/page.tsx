import Link from "next/link";
import { Heart, FileText, Scale, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Terms Of Use | MedReq",
  description: "Terms governing the use of MedReq services and outputs.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-rose-600">
          <Heart className="h-3.5 w-3.5" />
          Back To Home
        </Link>

        <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-700">
            <FileText className="h-3.5 w-3.5" />
            Terms Of Use
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight">Terms And Conditions</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            Effective date: April 8, 2026. These terms govern access to and use of the MedReq platform and related services.
          </p>
        </header>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">1. Service Scope</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            MedReq provides digital health intake, structured analysis support, and report generation. Outputs are informational and do not replace licensed medical judgment.
          </p>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">2. User Responsibilities</h2>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-slate-600">
            <li>Provide accurate and lawful data when using the service.</li>
            <li>Protect account credentials and avoid unauthorized access attempts.</li>
            <li>Use generated reports responsibly and consult qualified clinicians for diagnosis or treatment decisions.</li>
          </ul>
        </section>

        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">3. Limitations And Liability</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <Scale className="h-4 w-4" />
                No Medical Substitution
              </p>
              <p className="text-sm text-slate-600">The platform does not provide emergency or definitive clinical care and must not be treated as a substitute for professional services.</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <AlertTriangle className="h-4 w-4" />
                Operational Limits
              </p>
              <p className="text-sm text-slate-600">Service interruptions, delays, or third-party dependencies may affect availability. Reasonable best efforts are applied for continuity.</p>
            </article>
          </div>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-xl font-bold">4. Changes To Terms</h2>
          <p className="text-sm leading-relaxed text-slate-600">
            Terms may be updated for legal, security, or operational reasons. Continued use after updates constitutes acceptance of the revised terms.
          </p>
        </section>
      </div>
    </main>
  );
}
