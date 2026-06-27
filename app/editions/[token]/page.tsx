import Link from "next/link";
import { getCampaignsForPlacement, type Campaign } from "@/lib/campaigns";
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

function CampaignSlot({
  campaign,
  fallback = false,
}: {
  campaign?: Campaign;
  fallback?: boolean;
}) {
  if (!campaign && !fallback) return null;

  return (
    <aside className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
      {campaign ? (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            Partner message
          </p>
          <h2 className="mt-1 text-xl font-bold text-blue-950">
            {campaign.title}
          </h2>
          {campaign.description ? (
            <p className="mt-2 text-sm leading-6 text-blue-900">
              {campaign.description}
            </p>
          ) : null}
          {campaign.destinationUrl ? (
            <a
              className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white hover:bg-blue-700"
              href={campaign.destinationUrl}
              rel="noreferrer"
              target="_blank"
            >
              Learn more
            </a>
          ) : null}
        </>
      ) : (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            MyNewsNetwork
          </p>
          <h2 className="mt-1 text-xl font-bold text-blue-950">
            Specialist news editions for focused communities
          </h2>
        </>
      )}
    </aside>
  );
}

export default async function EditionPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const edition = await getNewsletterEditionByToken(token);
  const [networkCampaign, publicationCampaign, midEditionCampaign] = edition
    ? await Promise.all([
        getCampaignsForPlacement({ placementKey: "network_header" }),
        getCampaignsForPlacement({
          verticalId: edition.verticalId,
          placementKey: "publication_header",
        }),
        getCampaignsForPlacement({
          verticalId: edition.verticalId,
          placementKey: "mid_edition",
        }),
      ])
    : [[], [], []];
  const liveFeedHref = edition?.publicationSlug
    ? `/publications/${edition.publicationSlug}/feed`
    : "/feed";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        <div className="flex-1 py-12">
          {edition ? (
            <>
              <CampaignSlot campaign={networkCampaign[0]} fallback />
              <p className="mt-8 mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
                Saved edition
              </p>
              <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-6xl">
                {edition.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
                {edition.publicationName} {edition.frequency ?? "edition"} for{" "}
                {formatDate(edition.editionDate)}. This saved browser edition
                is the same source of truth future email delivery will render.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white hover:bg-blue-700"
                  href={liveFeedHref}
                >
                  Switch to live feed
                </Link>
                <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-500">
                  Manage subscription coming soon
                </span>
              </div>
              <div className="mt-8">
                <CampaignSlot campaign={publicationCampaign[0]} />
              </div>
              <div className="mt-8 space-y-4">
                {edition.items.length ? (
                  edition.items.map((item, index) =>
                    item.article ? (
                      <div key={item.id}>
                        {index === 4 ? (
                          <div className="mb-4">
                            <CampaignSlot campaign={midEditionCampaign[0]} />
                          </div>
                        ) : null}
                        <article className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 sm:p-5">
                          <div className="grid gap-4 md:grid-cols-[12rem_minmax(0,1fr)]">
                            {item.article.imageUrl ? (
                              <div className="aspect-video overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  alt={item.article.title}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  src={item.article.imageUrl}
                                />
                              </div>
                            ) : null}
                            <div>
                              <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                {item.section ?? "Story"}{" "}
                                {item.position ? `#${item.position}` : ""}
                              </p>
                              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                                {item.article.title}
                              </h2>
                              <p className="mt-2 text-sm font-semibold text-slate-500">
                                {item.article.sourceName ?? "Unknown source"} -{" "}
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
                            </div>
                          </div>
                        </article>
                      </div>
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
