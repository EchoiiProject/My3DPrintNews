export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <div className="text-lg font-bold tracking-tight text-slate-950">
            My3DPrintNews
          </div>
          <div className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
            <span>Technology</span>
            <span>Materials</span>
            <span>Industry</span>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Personalised additive manufacturing intelligence
            </p>
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              My3DPrintNews
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700 sm:text-2xl">
              Your Personalised 3D Printing News
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Track the latest breakthroughs, printer launches, materials,
              business moves, and maker stories in one focused professional
              feed.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#feed"
                className="inline-flex min-h-14 items-center justify-center rounded-md bg-blue-600 px-7 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
              >
                Build My Feed
              </a>
              <span className="text-sm font-medium text-slate-500">
                Curated for engineers, makers, founders, and print teams.
              </span>
            </div>
          </div>

          <div
            id="feed"
            className="relative rounded-lg border border-slate-200 bg-white/88 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-5"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Morning Brief
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  3D printing signal, sorted
                </h2>
              </div>
              <div className="rounded-md bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                Live
              </div>
            </div>

            <div className="space-y-3">
              {[
                ["Hardware", "Desktop SLS systems move closer to production teams"],
                ["Materials", "New high-temp polymers target aerospace brackets"],
                ["Business", "Service bureaus expand local manufacturing capacity"],
              ].map(([category, title]) => (
                <article
                  className="rounded-md border border-slate-100 bg-slate-50/80 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
                  key={title}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    {category}
                  </p>
                  <h3 className="mt-2 text-base font-semibold leading-6 text-slate-900">
                    {title}
                  </h3>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
