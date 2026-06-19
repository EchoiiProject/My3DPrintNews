import Link from "next/link";

const publisherPrinciples = [
  "We aggregate RSS feeds.",
  "We summarise and attribute clearly.",
  "We link back to the original source.",
  "Publishers can request correction, attribution updates, or opt out/removal at any time.",
];

export default function PublishersPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            My3DPrintNews
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
            <Link className="hover:text-blue-700" href="/">
              Preferences
            </Link>
            <Link className="hover:text-blue-700" href="/feed">
              Feed
            </Link>
            <Link className="hover:text-blue-700" href="/contact">
              Contact
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          <header>
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Publisher policy
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Clear attribution for 3D printing news
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              My3DPrintNews is designed to help readers discover useful
              additive manufacturing coverage while sending attention back to
              the original publisher.
            </p>
          </header>

          <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-6">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="text-sm font-semibold text-blue-700">
                How we work
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Publisher commitments
              </h2>
            </div>

            <div className="space-y-3">
              {publisherPrinciples.map((principle) => (
                <div
                  className="rounded-md border border-slate-100 bg-slate-50/80 p-4"
                  key={principle}
                >
                  <p className="text-base font-semibold leading-7 text-slate-800">
                    {principle}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-md bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-900">
              Correction, attribution, and removal requests can be handled at
              any time as part of the publisher workflow.
            </div>
          </section>
        </div>

        <section className="mb-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-6">
          <p className="text-sm font-semibold text-blue-700">
            Publisher Support
          </p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            We want publishers to have full visibility and control.
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
            For corrections, attribution updates, feed changes, removal
            requests, or partnership discussions, please contact us directly.
          </p>
          <Link
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            href="/contact?reason=publisher"
          >
            Contact Publisher Support
          </Link>
        </section>
      </section>
    </main>
  );
}
