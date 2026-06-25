import Link from "next/link";
import { verticalBySlug, verticals, type Vertical } from "@/config/verticals";
import { FooterLinks } from "../footer-links";
import { GlobalNav } from "../global-nav";

const currentVerticalSlug = "my3dprintnews";

function VerticalCard({ vertical }: { vertical: Vertical }) {
  const isComingSoon = vertical.status === "coming-soon";

  return (
    <article className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-blue-700">{vertical.sector}</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-950">
            {vertical.name}
          </h3>
        </div>
        <span
          className={[
            "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold",
            isComingSoon
              ? "border-slate-200 bg-slate-50 text-slate-500"
              : "border-emerald-100 bg-emerald-50 text-emerald-700",
          ].join(" ")}
        >
          {isComingSoon ? "Coming soon" : "Live"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {vertical.description}
      </p>
      <Link
        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
        href={vertical.publicUrl}
      >
        {isComingSoon ? "View preview" : "Open platform"}
      </Link>
    </article>
  );
}

export default function NetworkPage() {
  const currentVertical = verticalBySlug(currentVerticalSlug);
  const relatedVerticals =
    currentVertical?.relatedVerticalIds
      .map((id) => verticals.find((vertical) => vertical.id === id))
      .filter((vertical): vertical is Vertical => Boolean(vertical)) ?? [];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />

        <div className="flex-1 py-10">
          <header>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Network
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              MyNews Network
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Discover other personalised news platforms across specialist
              sectors.
            </p>
          </header>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950">
              You might also like
            </h2>
            <div className="mt-4 grid gap-5 lg:grid-cols-3">
              {relatedVerticals.map((vertical) => (
                <VerticalCard key={vertical.id} vertical={vertical} />
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              Other MyNews platforms
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {verticals
                .filter((vertical) =>
                  [
                    "my3dprintnews",
                    "mybmxnews",
                    "mycyclingnews",
                    "mydronenews",
                    "myrcnews",
                    "myphotographynews",
                    "myfishingnews",
                  ].includes(vertical.id),
                )
                .map((vertical) => (
                  <VerticalCard key={vertical.id} vertical={vertical} />
                ))}
            </div>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
