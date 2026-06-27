import Link from "next/link";
import { getCampaignsForPlacement, type Campaign } from "@/lib/campaigns";
import {
  getNewsletterEditionByToken,
  type NewsletterEditionItem,
} from "@/lib/editions";
import { displayMediaType } from "@/lib/media-types";
import { EditorialReportButton } from "@/app/editorial-report-button";
import { FooterLinks } from "@/app/footer-links";
import { GlobalNav } from "@/app/global-nav";
import {
  EditionItemShareActions,
  EditionShareActions,
  ReaderHiddenItem,
} from "./edition-share-actions";

export const dynamic = "force-dynamic";

type DisplayMode = "compact" | "standard" | "visual";

const displayModes: DisplayMode[] = ["compact", "standard", "visual"];

function normaliseDisplayMode(value: string | undefined): DisplayMode {
  return displayModes.includes(value as DisplayMode)
    ? (value as DisplayMode)
    : "standard";
}

function formatDate(value: string | null): string {
  if (!value) return "Date TBC";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function frequencyLabel(value: string | null): string {
  if (!value) return "Edition";

  return `${value[0].toUpperCase()}${value.slice(1)} Edition`;
}

function readingMinutes(items: NewsletterEditionItem[]): number {
  const wordCount = items.reduce((total, item) => {
    const article = item.article;

    if (!article) return total;

    return (
      total +
      `${article.title} ${article.summary ?? ""}`.split(/\s+/).filter(Boolean)
        .length
    );
  }, 0);

  return Math.max(1, Math.ceil(wordCount / 220));
}

function sectionTitle(section: string | null): string {
  if (section === "Videos") return "Latest Videos";
  if (section === "Reviews") return "Reviews";
  if (section === "Products") return "Products";
  if (section === "Favourites") return "Your Favourites";
  if (section === "News") return "Top Stories";
  return "Other Content";
}

function sectionRank(section: string): number {
  const order: Record<string, number> = {
    "Your Favourites": 0,
    "Top Stories": 1,
    "Latest Videos": 2,
    Reviews: 3,
    Products: 4,
    "Other Content": 5,
  };

  return order[section] ?? 99;
}

function groupItems(items: NewsletterEditionItem[]) {
  const groups = new Map<string, NewsletterEditionItem[]>();

  items.forEach((item) => {
    const title = sectionTitle(item.section);
    const current = groups.get(title) ?? [];

    current.push(item);
    groups.set(title, current);
  });

  return Array.from(groups.entries()).sort(
    ([sectionA], [sectionB]) => sectionRank(sectionA) - sectionRank(sectionB),
  );
}

function itemMediaType(item: NewsletterEditionItem) {
  if (!item.article) return "news";

  return displayMediaType({
    tags: item.article.tags,
    source: item.article.sourceName,
  });
}

function itemBadge(item: NewsletterEditionItem): string {
  const mediaType = itemMediaType(item);

  if (mediaType === "video") return "VIDEO";
  if (mediaType === "podcast") return "PODCAST";
  if (mediaType === "review") return "REVIEW";
  return "NEWS";
}

function CampaignSlot({
  campaign,
  fallback = false,
  label,
}: {
  campaign?: Campaign;
  fallback?: boolean;
  label: string;
}) {
  if (!campaign && !fallback) return null;

  return (
    <aside className="rounded-lg border border-blue-100 bg-blue-50/80 p-4">
      {campaign ? (
        <>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            {label}
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
            Platform Campaign
          </p>
          <h2 className="mt-1 text-xl font-bold text-blue-950">
            MyNewsNetwork connects focused publications with specialist
            communities.
          </h2>
        </>
      )}
    </aside>
  );
}

function EditionModeSelector({
  liveFeedHref,
  token,
}: {
  liveFeedHref: string;
  token: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Viewing
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-slate-950 px-3 text-sm font-bold text-white"
          href={`/editions/${token}`}
        >
          Today&apos;s Edition
        </Link>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
          href={liveFeedHref}
        >
          Live Feed
        </Link>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        This is a saved snapshot. The live feed may already have newer stories.
      </p>
    </section>
  );
}

function DisplayModeSelector({
  mode,
  token,
}: {
  mode: DisplayMode;
  token: string;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
      <span className="px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        View
      </span>
      {displayModes.map((displayMode) => (
        <Link
          className={[
            "min-h-8 rounded px-2.5 text-xs font-bold capitalize transition",
            mode === displayMode
              ? "bg-blue-600 text-white"
              : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
          ].join(" ")}
          href={`/editions/${token}?view=${displayMode}`}
          key={displayMode}
        >
          {displayMode}
        </Link>
      ))}
    </div>
  );
}

function EditionCard({
  displayMode,
  item,
}: {
  displayMode: DisplayMode;
  item: NewsletterEditionItem;
}) {
  if (!item.article) return null;

  const article = item.article;
  const isCompact = displayMode === "compact";
  const isVisual = displayMode === "visual";
  const cardGrid =
    article.imageUrl && !isVisual
      ? isCompact
        ? "grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]"
        : "grid gap-5 md:grid-cols-[minmax(14rem,36%)_minmax(0,1fr)]"
      : "";
  const imageClass = [
    "overflow-hidden rounded-md border border-slate-100 bg-slate-50",
    isCompact
      ? "aspect-[4/3]"
      : isVisual
        ? "mb-4 aspect-video max-h-[24rem]"
        : "aspect-video max-h-[16rem]",
  ].join(" ");

  return (
    <ReaderHiddenItem articleId={article.id} url={article.url}>
      <article
        className={[
          "rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8",
          isCompact ? "p-3 sm:p-4" : "p-4 sm:p-5",
        ].join(" ")}
      >
        <div className={cardGrid}>
        {article.imageUrl ? (
          <div className={imageClass}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={article.title}
              className="h-full w-full object-cover"
              loading="lazy"
              src={article.imageUrl}
            />
          </div>
        ) : null}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            {itemBadge(item)}
          </p>
          <h3
            className={[
              "mt-2 font-bold text-slate-950",
              isCompact ? "text-xl leading-7" : "text-2xl leading-8",
            ].join(" ")}
          >
            {article.title}
          </h3>
          {article.summary ? (
            <p
              className={[
                "mt-3 text-slate-600",
                isCompact ? "text-sm leading-6" : "text-base leading-7",
              ].join(" ")}
            >
              {article.summary}
            </p>
          ) : null}
          <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-3">
            <p className="text-sm font-bold text-blue-950">
              Publisher attribution
            </p>
            <div className="mt-2 grid gap-1 text-sm font-semibold text-blue-900 sm:grid-cols-3">
              <span>Source: {article.sourceName ?? "Unknown source"}</span>
              <span>Author: {article.author ?? "Not listed"}</span>
              <span>
                Published:{" "}
                {formatDate(article.publishedAt ?? article.createdAt)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                href={article.url}
                rel="noreferrer"
                target="_blank"
              >
                Read Original
              </a>
              <EditionItemShareActions
                articleId={article.id}
                title={article.title}
                url={article.url}
                verticalId={article.verticalId}
              />
              <EditorialReportButton
                articleId={article.id}
                verticalId={article.verticalId}
              />
            </div>
          </div>
        </div>
        </div>
      </article>
    </ReaderHiddenItem>
  );
}

export default async function EditionPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<{ view?: string }>;
}) {
  const { token } = await params;
  const query = await searchParams;
  const displayMode = normaliseDisplayMode(query?.view);
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
  const validItems =
    edition?.items.filter(
      (item) =>
        item.article &&
        item.article.editorialStatus !== "paused" &&
        item.article.editorialStatus !== "hidden" &&
        item.article.editorialStatus !== "blocked",
    ) ?? [];
  const videoCount = validItems.filter(
    (item) => itemMediaType(item) === "video",
  ).length;
  const podcastCount = validItems.filter(
    (item) => itemMediaType(item) === "podcast",
  ).length;
  const storyCount = validItems.length - videoCount - podcastCount;
  const sectionedItems = groupItems(validItems);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        <div className="flex-1 py-10">
          {edition ? (
            <>
              <CampaignSlot
                campaign={networkCampaign[0]}
                fallback
                label="Platform Campaign"
              />
              <header className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 sm:p-7">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  MyNewsNetwork
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Your Personal News Network
                </p>
                <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-end">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                      Today&apos;s Edition
                    </p>
                    <h1 className="mt-2 text-4xl font-bold leading-tight text-slate-950 sm:text-6xl">
                      {edition.publicationName}
                    </h1>
                    <p className="mt-4 text-lg leading-8 text-slate-600">
                      Your {edition.publicationName}{" "}
                      {frequencyLabel(edition.frequency)} for{" "}
                      {formatDate(edition.editionDate)}.
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                    <p className="text-sm font-bold text-blue-950">
                      Edition summary
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800">
                        {validItems.length} items total
                      </span>
                      <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800">
                        {storyCount} stories
                      </span>
                      <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800">
                        {videoCount} videos
                      </span>
                      <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800">
                        {podcastCount} podcasts
                      </span>
                      <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800">
                        {readingMinutes(validItems)} min read
                      </span>
                      <span className="rounded-md bg-white px-3 py-2 text-sm font-bold text-slate-800">
                        Generated today
                      </span>
                    </div>
                  </div>
                </div>
              </header>

              <div className="mt-6 grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <EditionModeSelector liveFeedHref={liveFeedHref} token={token} />
                <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Reader journey
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Link
                          className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white hover:bg-blue-700"
                          href={liveFeedHref}
                        >
                          Continue to Live Feed
                        </Link>
                        <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-500">
                          Manage Newsletter Preferences coming soon
                        </span>
                        <span className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-500">
                          Reading List coming soon
                        </span>
                        <EditionShareActions title={edition.title} />
                      </div>
                    </div>
                    <DisplayModeSelector mode={displayMode} token={token} />
                  </div>
                </section>
              </div>

              <div className="mt-8">
                <CampaignSlot
                  campaign={publicationCampaign[0]}
                  label="Publication Campaign"
                />
              </div>

              <div className="mt-8 space-y-8">
                {sectionedItems.length ? (
                  sectionedItems.map(([section, items], sectionIndex) => (
                    <section key={section}>
                      {sectionIndex === 1 ? (
                        <div className="mb-6">
                          <CampaignSlot
                            campaign={midEditionCampaign[0]}
                            label="Featured Promotion"
                          />
                        </div>
                      ) : null}
                      <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-950">
                          {section}
                        </h2>
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          {items.length} items
                        </span>
                      </div>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <EditionCard
                            displayMode={displayMode}
                            item={item}
                            key={item.id}
                          />
                        ))}
                      </div>
                    </section>
                  ))
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

