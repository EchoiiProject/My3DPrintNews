import { FooterLinks } from "../footer-links";
import { GlobalNav } from "../global-nav";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />

        <div className="flex-1 py-12 lg:py-16">
          <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            About
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Personalised 3D Printing News
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            My3DPrintNews helps readers follow the manufacturers, creators,
            reviewers, materials, platforms and technologies shaping additive
            manufacturing.
          </p>
          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              "Latest source-linked articles from the 3D printing sector.",
              "Reader preferences for brands, creators, topics and technology.",
              "Newsletter tools for turning a broad industry feed into a useful briefing.",
            ].map((copy) => (
              <section
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                key={copy}
              >
                <p className="text-base font-semibold leading-7 text-slate-700">
                  {copy}
                </p>
              </section>
            ))}
          </div>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
