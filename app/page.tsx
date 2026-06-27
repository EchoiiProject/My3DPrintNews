import Link from "next/link";
import { getArticleArchive } from "@/lib/articles";
import { getPublications, publicationPath } from "@/lib/publications";
import { publicationSlugForVertical, type Vertical } from "@/config/verticals";
import { BuildVersionBadge } from "./build-version-badge";
import { FooterLinks } from "./footer-links";
import { GlobalNav } from "./global-nav";

function statusLabel(vertical: Vertical) {
  if (vertical.visibility === "public" && vertical.publicationStatus === "live") {
    return "Live";
  }

  if (vertical.visibility === "demo") {
    return "Demo";
  }

  return vertical.publicationStatus === "draft" ? "Prepared preview" : "Private";
}

export default async function Home() {
  const publications = (await getPublications()).filter((publication) =>
    ["my3dprintnews", "mybmxnews"].includes(publication.slug),
  );
  const articleCounts = new Map<string, number>();

  await Promise.all(
    publications.map(async (publication) => {
      const articles = await getArticleArchive({
        publicOnly: true,
        verticalSlug: publication.slug,
      });
      articleCounts.set(publication.id, articles.length);
    }),
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav
          brandName="MyNewsNetwork"
          links={[
            { href: "/", label: "Home" },
            { href: "/discover-more", label: "Discover More" },
            { href: "/admin", label: "Platform Admin" },
          ]}
        />

        <div className="flex-1 py-10">
          <header className="max-w-4xl">
            <div className="mb-4">
              <BuildVersionBadge />
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Specialist publication network
            </p>
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              MyNewsNetwork
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-8 text-slate-700 sm:text-2xl">
              Discover personalised specialist news publications across focused
              communities.
            </p>
          </header>

          <section className="mt-8 grid gap-4 lg:grid-cols-3">
            {[
              "Each publication is curated for a specialist community.",
              "Readers can follow one publication or build a wider network of interests.",
              "Licence holders can grow audience, referrals, newsletters, and sponsorships.",
            ].map((copy) => (
              <div
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                key={copy}
              >
                <p className="text-sm font-semibold leading-6 text-slate-700">
                  {copy}
                </p>
              </div>
            ))}
          </section>

          <section className="mt-10">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Publications
                </p>
                <h2 className="mt-1 text-3xl font-bold text-slate-950">
                  Explore the network
                </h2>
              </div>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-4 text-sm font-bold text-amber-800"
                href="/admin"
              >
                Platform Admin
              </Link>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              {publications.map((publication) => {
                const publicSlug = publicationSlugForVertical(publication);
                const articleCount = articleCounts.get(publication.id) ?? 0;

                return (
                  <article
                    className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                    key={publication.id}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-bold text-blue-700">
                          {publication.sector}
                        </p>
                        <h3 className="mt-1 text-2xl font-bold text-slate-950">
                          {publication.publicationName ?? publication.name}
                        </h3>
                      </div>
                      <span className="inline-flex shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        {statusLabel(publication)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {publication.publicationDescription ??
                        publication.description}
                    </p>
                    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50/70 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Article archive
                      </p>
                      <p className="mt-1 text-2xl font-bold text-slate-950">
                        {articleCount}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                        href={publicationPath(publication)}
                      >
                        View Publication
                      </Link>
                      <Link
                        className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                        href={`/publications/${publicSlug}/feed`}
                      >
                        Latest News
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
