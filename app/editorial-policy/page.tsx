import { FooterLinks } from "../footer-links";
import { GlobalNav } from "../global-nav";

const policyPoints = [
  "My3DPrintNews aggregates and organises source-linked updates from publishers, manufacturers, creators and industry experts.",
  "We do not republish full articles.",
  "Feed cards may show a headline, summary or excerpt, attribution, an image if one is available in the feed, and a clear source link.",
  "Copyright remains with the original publishers, creators and rights holders.",
  "Publishers can request corrections, attribution updates, feed changes or removal at any time.",
];

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <header>
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Editorial Policy
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Attribution-first 3D printing coverage
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              My3DPrintNews is built to help readers discover useful specialist
              coverage while preserving attribution and sending readers back to
              original sources.
            </p>
          </header>

          <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-6">
            <div className="space-y-3">
              {policyPoints.map((point) => (
                <p
                  className="rounded-md border border-slate-100 bg-slate-50/80 p-4 text-base font-semibold leading-7 text-slate-800"
                  key={point}
                >
                  {point}
                </p>
              ))}
            </div>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
