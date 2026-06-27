import Link from "next/link";
import { articleCollection, type ArticleArchiveItem } from "@/lib/articles";
import type { ManagedSource } from "@/lib/sources";
import type { PublicationProfile } from "@/lib/publications";
import { FeedbackPanel } from "@/app/feedback-panel";
import { FooterLinks } from "@/app/footer-links";
import { GlobalNav } from "@/app/global-nav";
import {
  PublicationReaderHeader,
  type PublicationSectionKey,
} from "@/app/publication-reader-header";

export function formatArticleDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function PublicationShell({
  activeSection = "home",
  children,
  description,
  profile,
  title,
}: {
  activeSection?: PublicationSectionKey;
  children: React.ReactNode;
  description: string;
  profile: PublicationProfile;
  title: string;
}) {
  const publicationLinks = [
    { href: `/publications/${profile.slug}`, label: "Home" },
    { href: `/publications/${profile.slug}/feed`, label: "Latest News" },
    { href: `/publications/${profile.slug}/catch-up`, label: "Catch Up" },
    { href: "/discover-more", label: "Discover More" },
    { href: `/publications/${profile.slug}#feedback`, label: "Feedback" },
    { href: `/admin/${profile.adminSlug}`, label: "Manage Publication" },
  ];
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav brandName="MyNewsNetwork" links={publicationLinks} />
        <div className="flex-1 py-10">
          <PublicationReaderHeader
            activeSection={activeSection}
            catchUpHref={`/publications/${profile.slug}/catch-up`}
            description={description}
            editionHref={undefined}
            latestHref={`/publications/${profile.slug}/feed`}
            publicationName={profile.publicationName}
            title={title}
          />
          {children}
        </div>
        <FooterLinks />
      </section>
    </main>
  );
}

export function PublicationLinks({
  publications = [],
  profile,
}: {
  publications?: PublicationProfile[];
  profile: PublicationProfile;
}) {
  const currentName = profile.publicationName;
  const visibility = profile.visibility;
  const publicationStatus = profile.publicationStatus;
  const showReviewMode =
    visibility !== "public" || publicationStatus !== "live";
  const statusLabel = [
    visibility.charAt(0).toUpperCase() + visibility.slice(1),
    publicationStatus.charAt(0).toUpperCase() + publicationStatus.slice(1),
  ].join(" / ");

  return (
    <div className="mt-5 space-y-3">
      {showReviewMode ? (
        <section className="rounded-lg border border-amber-200 bg-amber-50/90 p-4 shadow-sm shadow-amber-100/60">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Review Mode
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {currentName} prepared preview
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-amber-950">
                This is a private demonstration prepared by Echoii. It is not
                publicly launched yet and can be updated before launch.
              </p>
              <p className="mt-2 text-sm font-bold text-amber-900">
                Status: {statusLabel}
              </p>
            </div>
            <div className="min-w-52">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                Review tools
              </p>
              <div className="mt-2 flex flex-wrap gap-2 lg:justify-end">
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-xs font-bold text-amber-800"
                  href={`/admin/${profile.adminSlug}`}
                >
                  Manage Publication
                </Link>
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-xs font-bold text-amber-800"
                  href={`/admin/${profile.adminSlug}/sources`}
                >
                  Source Management
                </Link>
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-xs font-bold text-amber-800"
                  href={`/admin/${profile.adminSlug}/articles`}
                >
                  Article Archive
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}
      <section className="rounded-lg border border-blue-100 bg-white/80 p-4 shadow-sm shadow-blue-100/50">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Current publication
            </p>
            <p className="mt-1 text-lg font-bold text-slate-950">
              {currentName}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {publications.map((publication) => {
              const isCurrent = publication.adminSlug === profile.adminSlug;

              return (
                <Link
                  className={[
                    "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold",
                    isCurrent
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-blue-200 bg-white text-blue-700",
                  ].join(" ")}
                  href={`/publications/${publication.slug}`}
                  key={publication.adminSlug}
                >
                  {publication.publicationName}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export function ArticleList({ articles }: { articles: ArticleArchiveItem[] }) {
  return (
    <div className="mt-6 space-y-4">
      {articles.length ? (
        articles.map((article) => (
          <article
            className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
            key={article.id}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  {article.title}
                </h2>
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  {article.sourceName ?? "Unknown source"} |{" "}
                  {formatArticleDate(article.publishedAt)}
                </p>
              </div>
              <Link
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700"
                href={article.url}
              >
                Original
              </Link>
            </div>
            {article.summary ? (
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {article.summary}
              </p>
            ) : null}
          </article>
        ))
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-950">
            No archived articles yet
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Articles will appear here after the archive fetcher collects this
            publication&apos;s enabled sources.
          </p>
        </section>
      )}
    </div>
  );
}

export function PublicationStats({
  articleCount,
  sourceCount,
  profile,
}: {
  articleCount: number;
  sourceCount: number;
  profile: PublicationProfile;
}) {
  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      {[
        ["Publication", profile.publicationName],
        ["Sources", sourceCount],
        ["Archived articles", articleCount],
      ].map(([label, value]) => (
        <div
          className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur"
          key={label}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      ))}
    </section>
  );
}

function publicationFeedHref(
  publicationSlug: string,
  values: {
    collection?: string;
    range?: string;
    source?: string;
  },
) {
  const params = new URLSearchParams();

  if (values.collection) params.set("collection", values.collection);
  if (values.range) params.set("range", values.range);
  if (values.source) params.set("source", values.source);

  const query = params.toString();

  return `/publications/${publicationSlug}/feed${query ? `?${query}` : ""}`;
}

export function PublicationFeedControls({
  articles,
  currentCollection = "all",
  currentRange = "7d",
  currentSourceId,
  publicationSlug,
  sources,
}: {
  articles: ArticleArchiveItem[];
  currentCollection?: string;
  currentRange?: string;
  currentSourceId?: string;
  publicationSlug: string;
  sources: ManagedSource[];
}) {
  const collectionCounts = Array.from(
    articles.reduce((counts, article) => {
      const collection = articleCollection(article);

      counts.set(collection, (counts.get(collection) ?? 0) + 1);
      return counts;
    }, new Map<string, number>()),
  )
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([label, count]) => ({
      count,
      label,
      value: label.toLowerCase(),
    }));
  const sourceCountMap = articles
    .filter(
      (article) =>
        currentCollection === "all" ||
        articleCollection(article).toLowerCase() === currentCollection,
    )
    .reduce((counts, article) => {
      const key = article.sourceId ?? article.sourceName ?? "unknown";

      counts.set(key, (counts.get(key) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());
  const sourceCounts = sources
    .map((source) => ({
      count: sourceCountMap.get(source.id) ?? sourceCountMap.get(source.name) ?? 0,
      source,
    }))
    .filter((item) => item.count > 0);
  const sourceCountTotal = sourceCounts.reduce(
    (total, item) => total + item.count,
    0,
  );
  const timeRanges = [
    ["Today", "today"],
    ["7 days", "7d"],
    ["14 days", "14d"],
    ["Month", "month"],
    ["All", "all"],
  ];

  return (
    <section className="mt-5 rounded-lg border border-slate-200 bg-white/88 p-3 shadow-xl shadow-blue-950/8 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
          <span className="px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Time
          </span>
          {timeRanges.map(([label, value]) => (
            <Link
              className={[
                "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                currentRange === value
                  ? "bg-blue-600 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
              ].join(" ")}
              href={publicationFeedHref(publicationSlug, {
                collection: currentCollection,
                range: value,
                source: currentSourceId,
              })}
              key={value}
            >
              {label}
            </Link>
          ))}
        </div>
        <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
          <span className="px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
            Collections
          </span>
          <Link
            className={[
              "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
              currentCollection === "all"
                ? "bg-slate-950 text-white"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
            ].join(" ")}
            href={publicationFeedHref(publicationSlug, {
              collection: "all",
              range: currentRange,
              source: currentSourceId,
            })}
          >
            All ({articles.length})
          </Link>
          {collectionCounts.slice(0, 7).map((collection) => (
            <Link
              className={[
                "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                currentCollection === collection.value
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
              ].join(" ")}
              href={publicationFeedHref(publicationSlug, {
                collection: collection.value,
                range: currentRange,
                source: currentSourceId,
              })}
              key={collection.label}
            >
              {collection.label} ({collection.count})
            </Link>
          ))}
        </div>
        <details className="relative">
          <summary className="inline-flex min-h-10 cursor-pointer list-none items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700">
            More
          </summary>
          <div className="absolute right-0 z-20 mt-2 w-80 rounded-lg border border-slate-200 bg-white p-4 shadow-xl shadow-blue-950/12">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Sources
            </p>
            <div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-auto">
              <Link
                className={[
                  "rounded-md border px-2.5 py-2 text-xs font-bold",
                  !currentSourceId
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                ].join(" ")}
                href={publicationFeedHref(publicationSlug, {
                  collection: currentCollection,
                  range: currentRange,
                })}
              >
                All sources ({sourceCountTotal})
              </Link>
              {sourceCounts.map(({ count, source }) => (
                <Link
                  className={[
                    "rounded-md border px-2.5 py-2 text-xs font-bold",
                    currentSourceId === source.id
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                  ].join(" ")}
                  href={publicationFeedHref(publicationSlug, {
                    collection: currentCollection,
                    range: currentRange,
                    source: source.id,
                  })}
                  key={source.id}
                >
                  {source.name} ({count})
                </Link>
              ))}
            </div>
            <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
              View density is available on the story list below.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}

export function FeedFilters({
  currentRecent,
  currentSourceId,
  sources,
}: {
  currentRecent?: string;
  currentSourceId?: string;
  sources: ManagedSource[];
}) {
  return (
    <form className="mt-8 grid gap-3 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur sm:grid-cols-3">
      <select
        className="min-h-11 rounded-md border border-slate-200 px-3 text-sm"
        defaultValue={currentSourceId ?? ""}
        name="source"
      >
        <option value="">All sources</option>
        {sources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>
      <select
        className="min-h-11 rounded-md border border-slate-200 px-3 text-sm"
        defaultValue={currentRecent ?? ""}
        name="recent"
      >
        <option value="">All dates</option>
        <option value="7">Last 7 days</option>
        <option value="14">Last 14 days</option>
        <option value="30">Last 30 days</option>
      </select>
      <button
        className="min-h-11 rounded-md bg-blue-600 px-4 text-sm font-bold text-white"
        type="submit"
      >
        Apply Filters
      </button>
    </form>
  );
}

export function PublicationFeedback({ profile }: { profile: PublicationProfile }) {
  if (!profile.showFeedback) {
    return null;
  }

  return (
    <section id="feedback">
      <FeedbackPanel
        publicationName={profile.publicationName}
        verticalSlug={profile.adminSlug}
      />
    </section>
  );
}
