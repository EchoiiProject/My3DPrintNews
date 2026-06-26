"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArticleArchiveItem } from "@/lib/articles";
import type { Article } from "@/lib/rss";
import type { ScoredArticle } from "@/lib/matching";
import { generateArticleTags } from "@/lib/matching";
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

const DISPLAY_MODE_KEY = "mynewsnetwork-publication-feed-display-mode";
const displayModes: DisplayMode[] = ["compact", "standard", "visual"];

function normaliseDisplayMode(value: string | null): DisplayMode {
  return displayModes.includes(value as DisplayMode)
    ? (value as DisplayMode)
    : "standard";
}

function archiveArticleToFeedArticle(article: ArticleArchiveItem): Article {
  return {
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
  publicationName = "this publication",
}: {
  articles: ArticleArchiveItem[];
  heading?: string;
  periodDays?: number;
  publicationName?: string;
}) {
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);
  const [displayMode, setDisplayMode] = useState<DisplayMode>("standard");

  useEffect(() => {
    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);
    setDisplayMode(
      normaliseDisplayMode(localStorage.getItem(DISPLAY_MODE_KEY)),
    );

    if (!savedFavourites) return;

    try {
      setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
    } catch {
      setFavourites(defaultFavourites);
    }
  }, []);

  const stories = useMemo(() => {
    return articles
      .map((article, index) =>
        archiveArticleToScoredArticle(article, index, publicationName),
      )
      .sort(sortArchiveStories);
  }, [articles, publicationName]);

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

  return (
    <section className="mt-8">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-slate-950">{heading}</h2>
        <div className="flex flex-wrap items-center gap-3">
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
      {stories.length ? (
        <FeedStoryCards
          displayMode={displayMode}
          favourites={favourites}
          onToggleSourceFavourite={toggleSourceFavourite}
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
