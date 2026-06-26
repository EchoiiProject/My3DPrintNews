import Link from "next/link";
import { FooterLinks } from "../footer-links";

const policyPoints = [
  "MyNewsNetwork aggregates RSS feeds from publishers, platforms, and creator sources.",
  "We do not republish full articles.",
  "Feed cards may show a headline, summary or excerpt, attribution, an image if one is available in the feed, and a clear source link.",
  "Copyright remains with the original publishers, creators, and rights holders.",
  "Publishers can request corrections, attribution updates, feed changes, or removal at any time.",
];

export default function PublisherPolicyPage() {
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
          <Link className="text-sm font-medium text-slate-600 hover:text-blue-700" href="/contact?reason=publisher">
            Publisher Contact
          </Link>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <header>
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Publisher Policy
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Attribution-first feed aggregation
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              MyNewsNetwork is built to help readers discover specialist
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
            <Link
              className="mt-6 inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              href="/contact?reason=publisher"
            >
              Contact Publisher Support
            </Link>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
