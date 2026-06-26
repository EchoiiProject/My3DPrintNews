import Link from "next/link";
import { FooterLinks } from "../footer-links";

const terms = [
  "MyNewsNetwork is provided as-is as a personalised discovery and briefing service.",
  "External links and original articles belong to their respective publishers, platforms, or creators.",
  "MyNewsNetwork does not guarantee that feeds, summaries, links, videos, or availability will be complete, accurate, current, or uninterrupted.",
  "Users are responsible for how they use the information, external links, products, offers, downloads, models, and guidance they discover through the service.",
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            MyNewsNetwork
          </Link>
          <Link className="text-sm font-medium text-slate-600 hover:text-blue-700" href="/">
            Publications
          </Link>
        </nav>

        <div className="flex-1 py-12 lg:py-16">
          <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            Terms
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Terms of Use
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            These terms set the baseline for using MyNewsNetwork while the
            product is being prepared for a public launch.
          </p>

          <div className="mt-8 space-y-3 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-6">
            {terms.map((term) => (
              <p
                className="rounded-md border border-slate-100 bg-slate-50/80 p-4 text-base font-semibold leading-7 text-slate-800"
                key={term}
              >
                {term}
              </p>
            ))}
          </div>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
