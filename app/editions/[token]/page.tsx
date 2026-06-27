import Link from "next/link";
import { getNewsletterEditionByToken } from "@/lib/editions";
import { FooterLinks } from "@/app/footer-links";
import { GlobalNav } from "@/app/global-nav";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "Date TBC";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const edition = await getNewsletterEditionByToken(token);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        <div className="flex-1 py-12">
          {edition ? (
            <>
              <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
                Saved edition
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-6xl">
                {edition.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {edition.publicationName} edition for{" "}
                {formatDate(edition.editionDate)}.
              </p>
              <div className="mt-8 space-y-4">
                {edition.items.length ? (
                  edition.items.map((item) =>
                    item.article ? (
                      <article
                        className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8"
                        key={item.id}
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          {item.section ?? "Story"}{" "}
                          {item.position ? `#${item.position}` : ""}
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-950">
                          {item.article.title}
                        </h2>
                        <p className="mt-2 text-sm font-semibold text-slate-500">
                          {item.article.sourceName ?? "Unknown source"} ·{" "}
                          {formatDate(
                            item.article.publishedAt ??
                              item.article.createdAt,
                          )}
                        </p>
                        {item.article.summary ? (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {item.article.summary}
                          </p>
                        ) : null}
                        <a
                          className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                          href={item.article.url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Read original
                        </a>
                      </article>
                    ) : null,
                  )
                ) : (
                  <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8">
                    <h2 className="text-2xl font-bold text-slate-950">
                      This edition has no items yet.
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Edition generation is ready for future newsletter
                      delivery, but no articles have been attached to this
                      edition.
                    </p>
                  </section>
                )}
              </div>
            </>
          ) : (
            <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8">
              <h1 className="text-4xl font-bold text-slate-950">
                Edition not found
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This saved edition is not available yet, or the link has not
                been generated.
              </p>
              <Link
                className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
                href="/"
              >
                Go to MyNewsNetwork
              </Link>
            </section>
          )}
        </div>
        <FooterLinks />
      </section>
    </main>
  );
}
