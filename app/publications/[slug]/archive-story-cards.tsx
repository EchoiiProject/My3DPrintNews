"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArticleArchiveItem } from "@/lib/articles";
import type { Article } from "@/lib/rss";
import type { ScoredArticle } from "@/lib/matching";
import { generateArticleTags } from "@/lib/matching";
import {
  displayMediaType,
  mediaFilterOptions,
  type DisplayMediaType,
} from "@/lib/media-types";
import { getPublishedTimestamp } from "@/lib/ranking";
import { FeedStoryCards } from "@/app/feed/feed-client";
import {
  defaultFavourites,
  FAVOURITES_KEY,
  normaliseFavourites,
  toggleFavourite,
  type Favourites,
} from "@/app/preferences";

type DisplayMode = "compact" | "standard" | "visual";
type MediaFilter = "all" | DisplayMediaType;

const DISPLAY_MODE_KEY = "mynewsnetwork-publication-feed-display-mode";
const MEDIA_FILTER_KEY = "mynewsnetwork-publication-feed-media-filter";
const READER_EMAIL_KEY = "mynewsnetwork-reader-email";
const displayModes: DisplayMode[] = ["compact", "standard", "visual"];

function normaliseDisplayMode(value: string | null): DisplayMode {
  return displayModes.includes(value as DisplayMode)
    ? (value as DisplayMode)
    : "standard";
}

function normaliseMediaFilter(value: string | null): MediaFilter {
  return value === "all" ||
    mediaFilterOptions.some((option) => option.value === value)
    ? (value as MediaFilter)
    : "all";
}

function archiveArticleToFeedArticle(article: ArticleArchiveItem): Article {
  return {
    id: article.id,
    title: article.title,
    link: article.url,
    source: article.sourceName ?? "Unknown source",
    publishedAt:
      article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
    summary: article.summary ?? "",
    tags: article.tags,
    imageUrl: article.imageUrl ?? undefined,
    type: "article",
  };
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
  heading = "Latest stories",
  publicationId,
  publicationName = "this publication",
  publicationSlug,
}: {
  articles: ArticleArchiveItem[];
  heading?: string;
  periodDays?: number;
  publicationId?: string;
  publicationName?: string;
  publicationSlug?: string;
}) {
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("standard");
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>("all");
  const [feedActionStatus, setFeedActionStatus] = useState("");

  useEffect(() => {
    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);
    setDisplayMode(
      normaliseDisplayMode(localStorage.getItem(DISPLAY_MODE_KEY)),
    );
    setMediaFilter(
      normaliseMediaFilter(localStorage.getItem(MEDIA_FILTER_KEY)),
    );

    if (!savedFavourites) return;

    try {
      setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
    } catch {
      setFavourites(defaultFavourites);
    }
  }, []);

  const stories = useMemo(() => {
    const filteredArticles =
      mediaFilter === "all"
        ? articles
        : articles.filter(
            (article) =>
              displayMediaType({
                tags: article.tags,
                source: article.sourceName,
              }) === mediaFilter,
          );

    return filteredArticles
      .map((article, index) =>
        archiveArticleToScoredArticle(article, index, publicationName),
      )
      .sort(sortArchiveStories);
  }, [articles, mediaFilter, publicationName]);

  const mediaCounts = useMemo(() => {
    const counts: Record<MediaFilter, number> = {
      all: articles.length,
      news: 0,
      video: 0,
      podcast: 0,
      review: 0,
    };

    articles.forEach((article) => {
      const type = displayMediaType({
        tags: article.tags,
        source: article.sourceName,
      });

      counts[type] += 1;
    });

    return counts;
  }, [articles]);

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

  function chooseMediaFilter(filter: MediaFilter) {
    setMediaFilter(filter);
    localStorage.setItem(MEDIA_FILTER_KEY, filter);
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
      setFeedActionStatus("Feed link copied.");
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setFeedActionStatus("Feed link copied.");
      } catch {
        setFeedActionStatus("Share unavailable.");
      }
    }
  }

  async function emailTodaysFeed() {
    const existingEmail = localStorage.getItem(READER_EMAIL_KEY) ?? "";
    const email = window.prompt("Email today's feed to:", existingEmail);

    if (!email) return;

    localStorage.setItem(READER_EMAIL_KEY, email);
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
          mediaFilter,
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
        ? result.message ?? "Feed email request queued."
        : result.message ?? "Feed email request failed.",
    );
  }

  async function subscribeDaily() {
    const existingEmail = localStorage.getItem(READER_EMAIL_KEY) ?? "";
    const email = window.prompt("Subscribe to daily newsletter:", existingEmail);

    if (!email) return;

    localStorage.setItem(READER_EMAIL_KEY, email);
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

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-950">{heading}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white p-1">
            <button
              className={[
                "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                mediaFilter === "all"
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
              ].join(" ")}
              onClick={() => chooseMediaFilter("all")}
              type="button"
            >
              All ({mediaCounts.all})
            </button>
            {mediaFilterOptions
              .filter((option) => mediaCounts[option.value] > 0)
              .map((option) => (
                <button
                  className={[
                    "min-h-8 rounded px-2.5 text-xs font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                    mediaFilter === option.value
                      ? "bg-slate-950 text-white"
                      : "text-slate-600 hover:bg-blue-50 hover:text-blue-700",
                  ].join(" ")}
                  key={option.value}
                  onClick={() => chooseMediaFilter(option.value)}
                  type="button"
                >
                  {option.pluralLabel} ({mediaCounts[option.value]})
                </button>
              ))}
          </div>
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
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {stories.length} stories
          </span>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white/88 p-3">
        <button
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
          onClick={copyFeedLink}
          type="button"
        >
          Share this feed
        </button>
        <button
          className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
          onClick={emailTodaysFeed}
          type="button"
        >
          Email me today&apos;s feed
        </button>
        <button
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
          onClick={subscribeDaily}
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
