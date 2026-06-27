"use client";

import { useEffect, useMemo, useState } from "react";
import {
  articleCollection as archiveArticleCollection,
  type ArticleArchiveItem,
} from "@/lib/articles";
import type { Article } from "@/lib/rss";
import type { ManagedSource } from "@/lib/sources";
import type { ScoredArticle } from "@/lib/matching";
import { generateArticleTags } from "@/lib/matching";
import { getPublishedTimestamp } from "@/lib/ranking";
import { FeedStoryCards } from "@/app/feed/feed-client";
import { MyNewsNetworkEmailDialog } from "@/app/components/my-news-network-dialog";
import {
  defaultFavourites,
  FAVOURITES_KEY,
  normaliseFavourites,
  toggleFavourite,
  type Favourites,
} from "@/app/preferences";

type DisplayMode = "compact" | "standard" | "visual";

const DISPLAY_MODE_KEY = "mynewsnetwork-publication-feed-display-mode";
const READER_EMAIL_KEY = "mynewsnetwork-reader-email";
const HIDDEN_SOURCES_KEY = "mynewsnetwork-hidden-sources";
const displayModes: DisplayMode[] = ["compact", "standard", "visual"];

type HiddenSourcePreference = {
  mutedUntil?: string | null;
  sourceId: string;
  sourceName: string;
  verticalId?: string;
};

function normaliseDisplayMode(value: string | null): DisplayMode {
  return displayModes.includes(value as DisplayMode)
    ? (value as DisplayMode)
    : "standard";
}

function hiddenSources(): HiddenSourcePreference[] {
  try {
    const value = localStorage.getItem(HIDDEN_SOURCES_KEY);

    return value ? (JSON.parse(value) as HiddenSourcePreference[]) : [];
  } catch {
    return [];
  }
}

function activeHiddenSources(): HiddenSourcePreference[] {
  const now = Date.now();

  return hiddenSources().filter((source) => {
    if (!source.mutedUntil) return true;

    const mutedUntil = new Date(source.mutedUntil).getTime();

    return Number.isFinite(mutedUntil) && mutedUntil > now;
  });
}

function archiveArticleToFeedArticle(article: ArticleArchiveItem): Article {
  return {
    id: article.id,
    sourceId: article.sourceId,
    title: article.title,
    link: article.url,
    source: article.sourceName ?? "Unknown source",
    publishedAt:
      article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
    summary: article.summary ?? "",
    tags: article.tags,
    imageUrl: article.imageUrl ?? undefined,
    type: article.sourceType === "youtube" ? "video" : "article",
  };
}

function queryHref(
  publicationSlug: string | undefined,
  values: Record<string, string | undefined>,
) {
  if (!publicationSlug) return "#";

  const params = new URLSearchParams();

  Object.entries(values).forEach(([key, value]) => {
    if (value) {
      params.set(key, value);
    }
  });

  const query = params.toString();

  return `/publications/${publicationSlug}/feed${query ? `?${query}` : ""}`;
}

function archiveArticleToScoredArticle(
  article: ArticleArchiveItem,
  index: number,
  publicationName: string,
): ScoredArticle {
  const feedArticle = archiveArticleToFeedArticle(article);
  const generatedTags = generateArticleTags(feedArticle);
  const matchedBecause = [
    article.sourceName ? `Source: ${article.sourceName}` : null,
    article.tags[0] ? `Category: ${article.tags[0]}` : null,
    `Publication: ${publicationName}`,
  ].filter((value): value is string => Boolean(value));

  return {
    article: feedArticle,
    generatedTags,
    matchedBecause,
    originalIndex: index,
    score: 0,
  };
}

function sortArchiveStories(a: ScoredArticle, b: ScoredArticle): number {
  const aTimestamp = getPublishedTimestamp(a.article.publishedAt);
  const bTimestamp = getPublishedTimestamp(b.article.publishedAt);

  if (aTimestamp !== null && bTimestamp !== null) {
    return bTimestamp - aTimestamp;
  }

  if (aTimestamp !== null) return -1;
  if (bTimestamp !== null) return 1;

  return a.originalIndex - b.originalIndex;
}

export function ArchiveStoryCards({
  articles,
  countArticles,
  currentCollection = "all",
  currentRange = "7d",
  currentSourceId,
  heading = "Latest stories",
  publicationId,
  publicationName = "this publication",
  publicationSlug,
  showFeedControls = true,
  sources = [],
}: {
  articles: ArticleArchiveItem[];
  countArticles?: ArticleArchiveItem[];
  currentCollection?: string;
  currentRange?: string;
  currentSourceId?: string;
  heading?: string;
  periodDays?: number;
  publicationId?: string;
  publicationName?: string;
  publicationSlug?: string;
  showFeedControls?: boolean;
  sources?: ManagedSource[];
}) {
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("standard");
  const [feedActionStatus, setFeedActionStatus] = useState("");
  const [emailDialog, setEmailDialog] = useState<
    "latest-news" | "newsletter" | null
  >(null);
  const [readerEmail, setReaderEmail] = useState("");
  const [hiddenSourcePreferences, setHiddenSourcePreferences] = useState<
    HiddenSourcePreference[]
  >([]);
  const [showMore, setShowMore] = useState(false);
  const countBaseArticles = countArticles ?? articles;

  useEffect(() => {
    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);
    setDisplayMode(
      normaliseDisplayMode(localStorage.getItem(DISPLAY_MODE_KEY)),
    );
    setReaderEmail(localStorage.getItem(READER_EMAIL_KEY) ?? "");
    setHiddenSourcePreferences(activeHiddenSources());

    function handleSourcePreferencesChanged() {
      setHiddenSourcePreferences(activeHiddenSources());
    }

    window.addEventListener(
      "mynewsnetwork:source-preferences-changed",
      handleSourcePreferencesChanged,
    );

    if (savedFavourites) {
      try {
        setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
      } catch {
        setFavourites(defaultFavourites);
      }
    }

    return () => {
      window.removeEventListener(
        "mynewsnetwork:source-preferences-changed",
        handleSourcePreferencesChanged,
      );
    };
  }, []);

  const stories = useMemo(() => {
    return articles
      .map((article, index) =>
        archiveArticleToScoredArticle(article, index, publicationName),
      )
      .sort(sortArchiveStories);
  }, [articles, publicationName]);

  const collectionCounts = useMemo(() => {
    const counts = new Map<string, number>();

    countBaseArticles.forEach((article) => {
      const collection = archiveArticleCollection(article);
      counts.set(collection, (counts.get(collection) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .map(([label, count]) => ({ count, label }));
  }, [countBaseArticles]);

  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>();

    countBaseArticles
      .filter(
        (article) =>
          currentCollection === "all" ||
          archiveArticleCollection(article).toLowerCase() === currentCollection,
      )
      .forEach((article) => {
        const key = article.sourceId ?? article.sourceName ?? "unknown";
        counts.set(key, (counts.get(key) ?? 0) + 1);
      });

    return sources.map((source) => ({
      count: counts.get(source.id) ?? counts.get(source.name) ?? 0,
      source,
    }));
  }, [countBaseArticles, currentCollection, sources]);
  const sourceCountTotal = sourceCounts.reduce(
    (total, item) => total + item.count,
    0,
  );

  function toggleSourceFavourite(source: string) {
    setFavourites((current) => {
      const updated = toggleFavourite(current, "sources", source);

      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function chooseDisplayMode(mode: DisplayMode) {
    setDisplayMode(mode);
    localStorage.setItem(DISPLAY_MODE_KEY, mode);
  }

  async function copyFeedLink() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: publicationName,
          text: `Latest stories from ${publicationName}`,
          url,
        });
        setFeedActionStatus("Share opened.");
        return;
      }

      await navigator.clipboard.writeText(url);
      setFeedActionStatus("Latest News link copied.");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setFeedActionStatus("Latest News link copied.");
      } catch {
        setFeedActionStatus("Share unavailable.");
      }
    }
  }

  async function emailTodaysFeed(email: string) {
    localStorage.setItem(READER_EMAIL_KEY, email);
    setReaderEmail(email);
    const response = await fetch("/api/reader-actions/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        requestType: "feed",
        verticalId: publicationId,
        publicationName,
        publicationUrl: window.location.href,
        filterContext: {
          displayMode,
          path: window.location.pathname,
          search: window.location.search,
          storyCount: stories.length,
        },
        feedItems: stories.slice(0, 10).map((story) => ({
          id: story.article.id,
          title: story.article.title,
          source: story.article.source,
          summary: story.article.summary,
          url: story.article.link,
        })),
      }),
    });
    const result = (await response.json()) as { message?: string };

    setFeedActionStatus(
      response.ok
        ? result.message ?? "Latest News email request queued."
        : result.message ?? "Latest News email request failed.",
    );
  }

  async function subscribeDaily(email: string) {
    localStorage.setItem(READER_EMAIL_KEY, email);
    setReaderEmail(email);
    const response = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        publicationId,
        frequency: "daily",
      }),
    });
    const result = (await response.json()) as { message?: string };

    setFeedActionStatus(
      response.ok
        ? result.message ?? "Newsletter preferences saved."
        : result.message ?? "Newsletter signup failed.",
    );
  }

  async function unmuteSource(sourceId: string) {
    const next = hiddenSources().filter((source) => source.sourceId !== sourceId);

    localStorage.setItem(HIDDEN_SOURCES_KEY, JSON.stringify(next));
    setHiddenSourcePreferences(activeHiddenSources());
    window.dispatchEvent(
      new CustomEvent("mynewsnetwork:source-preferences-changed"),
    );

    const email = localStorage.getItem(READER_EMAIL_KEY);

    if (!email) {
      setFeedActionStatus("Source restored.");
      return;
    }

    try {
      const response = await fetch("/api/reader-actions/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unhide",
          email,
          sourceId,
        }),
      });

      setFeedActionStatus(
        response.ok
          ? "Source restored."
          : "Restored here. We could not sync it yet.",
      );
    } catch {
      setFeedActionStatus("Restored here. We could not sync it yet.");
    }
  }

  return (
    <section className="mt-8">
      <MyNewsNetworkEmailDialog
        body={
          emailDialog === "latest-news"
            ? `Send today's Latest News from ${publicationName} to your email.`
            : `Subscribe to the daily ${publicationName} newsletter.`
        }
        confirmLabel={
          emailDialog === "latest-news" ? "Send Latest News" : "Subscribe"
        }
        defaultEmail={readerEmail}
        heading={emailDialog === "latest-news" ? "Email Latest News" : "Subscribe"}
        onCancel={() => setEmailDialog(null)}
        onSubmit={(email) => {
          const action = emailDialog;

          setEmailDialog(null);

          if (action === "latest-news") void emailTodaysFeed(email);
          if (action === "newsletter") void subscribeDaily(email);
        }}
        open={Boolean(emailDialog)}
      />
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-950">{heading}</h2>
        <div className="flex flex-wrap items-center gap-3">
          {showFeedControls ? (
            <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
              <a
                className={[
                  "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                  currentCollection === "all"
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                ].join(" ")}
                href={queryHref(publicationSlug, {
                  collection: "all",
                  range: currentRange,
                  source: currentSourceId,
                })}
              >
                All ({countBaseArticles.length})
              </a>
              {collectionCounts.slice(0, 6).map((collection) => (
                <a
                  className={[
                    "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                    currentCollection === collection.label.toLowerCase()
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                  ].join(" ")}
                  href={queryHref(publicationSlug, {
                    collection: collection.label.toLowerCase(),
                    range: currentRange,
                    source: currentSourceId,
                  })}
                  key={collection.label}
                >
                  {collection.label} ({collection.count})
                </a>
              ))}
            </div>
          ) : null}
          <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
            <span className="px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              View
            </span>
            {displayModes.map((mode) => (
              <button
                className={[
                  "min-h-8 rounded px-2.5 text-xs font-bold capitalize transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                  displayMode === mode
                    ? "bg-blue-600 text-white"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                ].join(" ")}
                key={mode}
                onClick={() => chooseDisplayMode(mode)}
                type="button"
              >
                {mode}
              </button>
            ))}
          </div>
          {showFeedControls ? (
            <button
              className="min-h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
              onClick={() => setShowMore((value) => !value)}
              type="button"
            >
              More
            </button>
          ) : null}
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {stories.length} stories
          </span>
        </div>
      </div>
      {showFeedControls && showMore ? (
        <section className="mb-4 grid gap-4 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Time range
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                ["Today", "today"],
                ["7 days", "7d"],
                ["14 days", "14d"],
                ["Month", "month"],
                ["All", "all"],
              ].map(([label, value]) => (
                <a
                  className={[
                    "rounded-md border px-2.5 py-2 text-xs font-bold",
                    currentRange === value
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                  ].join(" ")}
                  href={queryHref(publicationSlug, {
                    collection: currentCollection,
                    range: value,
                    source: currentSourceId,
                  })}
                  key={label}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Sources
            </p>
            <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-auto">
              <a
                className={[
                  "rounded-md border px-2.5 py-2 text-xs font-bold",
                  !currentSourceId
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                ].join(" ")}
                href={queryHref(publicationSlug, {
                  collection: currentCollection,
                  range: currentRange,
                })}
              >
                All sources ({sourceCountTotal})
              </a>
              {sourceCounts
                .filter((item) => item.count > 0)
                .map(({ count, source }) => (
                  <a
                    className={[
                      "rounded-md border px-2.5 py-2 text-xs font-bold",
                      currentSourceId === source.id
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                    ].join(" ")}
                    href={queryHref(publicationSlug, {
                      collection: currentCollection,
                      range: currentRange,
                      source: source.id,
                    })}
                    key={source.id}
                  >
                    {source.name} ({count})
                  </a>
                ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Reader controls
            </p>
            <div className="mt-2 space-y-2 text-sm font-semibold text-slate-600">
              <p>Newsletter preferences coming soon.</p>
              <p>Use card actions to mute or hide sources for your feed.</p>
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Hidden sources
              </p>
              {hiddenSourcePreferences.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {hiddenSourcePreferences.map((source) => (
                    <span
                      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-bold text-slate-700"
                      key={source.sourceId}
                    >
                      {source.sourceName}
                      {source.mutedUntil ? (
                        <span className="text-slate-400">
                          until{" "}
                          {new Intl.DateTimeFormat("en-GB", {
                            day: "2-digit",
                            month: "short",
                          }).format(new Date(source.mutedUntil))}
                        </span>
                      ) : null}
                      <button
                        className="text-blue-700 hover:text-blue-900"
                        onClick={() => unmuteSource(source.sourceId)}
                        type="button"
                      >
                        Unmute
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm font-semibold text-slate-600">
                  No hidden or muted sources in this browser.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : null}
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/88 p-3">
        <button
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
          onClick={copyFeedLink}
          type="button"
        >
          Share Latest News
        </button>
        <button
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
          onClick={() => setEmailDialog("latest-news")}
          type="button"
        >
          Email me today&apos;s Latest News
        </button>
        <button
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
          onClick={() => setEmailDialog("newsletter")}
          type="button"
        >
          Subscribe to daily newsletter
        </button>
        {feedActionStatus ? (
          <span className="text-sm font-semibold text-blue-700">
            {feedActionStatus}
          </span>
        ) : null}
      </div>
      {stories.length ? (
        <FeedStoryCards
          displayMode={displayMode}
          favourites={favourites}
          onToggleSourceFavourite={toggleSourceFavourite}
          publicationId={publicationId}
          publicationName={publicationName}
          publicationSlug={publicationSlug}
          showFeedAds={false}
          stories={stories}
        />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-950">
            {articles.length
              ? "No articles match this view"
              : "No archived articles yet"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {articles.length
              ? "This publication has archived articles, but none match the selected date window."
              : `Articles will appear for ${publicationName} after enabled sources are fetched.`}
          </p>
        </section>
      )}
    </section>
  );
}
