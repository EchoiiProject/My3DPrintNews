import Link from "next/link";
import type { ArticleArchiveItem } from "@/lib/articles";
import type { ManagedSource } from "@/lib/sources";
import type { PublicationProfile } from "@/lib/publications";
import { FeedbackPanel } from "@/app/feedback-panel";
import { FooterLinks } from "@/app/footer-links";
import { GlobalNav } from "@/app/global-nav";

export function formatArticleDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function PublicationShell({
  children,
  description,
  profile,
  title,
}: {
  children: React.ReactNode;
  description: string;
  profile: PublicationProfile;
  title: string;
}) {
  const publicationLinks = [
    { href: `/publications/${profile.slug}`, label: "Home" },
    { href: `/publications/${profile.slug}/feed`, label: "Feed" },
    { href: `/publications/${profile.slug}/catch-up`, label: "Catch Up" },
    { href: "/discover-more", label: "Discover More" },
    { href: `/publications/${profile.slug}#feedback`, label: "Feedback" },
    { href: `/admin/${profile.adminSlug}`, label: "Manage Publication" },
  ];
  const logoText = profile.publicationName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav brandName="MyNewsNetwork" links={publicationLinks} />
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex items-center gap-3">
              {profile.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt={`${profile.publicationName} logo`}
                  className="h-12 w-12 rounded-lg border border-blue-100 bg-white object-contain p-1"
                  src={profile.logoUrl}
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-black text-blue-700">
                  {logoText}
                </span>
              )}
              <p className="inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
                Publication
              </p>
            </div>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {title}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {description}
            </p>
          </header>
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
      <nav className="flex flex-wrap gap-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white"
          href={`/publications/${profile.slug}`}
        >
          Home
        </Link>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700"
          href={`/publications/${profile.slug}/feed`}
        >
          Feed
        </Link>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700"
          href={`/publications/${profile.slug}/catch-up`}
        >
          Catch Up
        </Link>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700"
          href="/discover-more"
        >
          Discover More
        </Link>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700"
          href={`/publications/${profile.slug}#feedback`}
        >
          Feedback
        </Link>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-bold text-amber-800"
          href={`/admin/${profile.adminSlug}`}
        >
          Manage this publication
        </Link>
      </nav>
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
