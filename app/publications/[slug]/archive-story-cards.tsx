"use client";

import { useEffect, useMemo, useState } from "react";
import type { ArticleArchiveItem } from "@/lib/articles";
import type { Article } from "@/lib/rss";
import { rankFeedArticles } from "@/lib/ranking";
import { FeedStoryCards } from "@/app/feed/feed-client";
import {
  defaultFavourites,
  defaultPreferences,
  FAVOURITES_KEY,
  normaliseFavourites,
  toggleFavourite,
  type Favourites,
} from "@/app/preferences";

function archiveArticleToFeedArticle(article: ArticleArchiveItem): Article {
  return {
    title: article.title,
    link: article.url,
    source: article.sourceName ?? "Unknown source",
    publishedAt:
      article.publishedAt ?? article.createdAt ?? new Date().toISOString(),
    summary:
      article.summary ??
      "Publisher summary unavailable. Read the original article for full details.",
    tags: article.tags.length
      ? article.tags
      : [article.sourceName ?? "Archive", "article"],
    imageUrl: article.imageUrl ?? undefined,
    type: "article",
  };
}

export function ArchiveStoryCards({
  articles,
  heading = "Latest stories",
  periodDays,
  publicationName = "this publication",
}: {
  articles: ArticleArchiveItem[];
  heading?: string;
  periodDays?: number;
  publicationName?: string;
}) {
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);

  useEffect(() => {
    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);

    if (!savedFavourites) return;

    try {
      setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
    } catch {
      setFavourites(defaultFavourites);
    }
  }, []);

  const stories = useMemo(() => {
    const feedArticles = articles.map(archiveArticleToFeedArticle);

    return rankFeedArticles(
      feedArticles,
      {
        ...defaultPreferences,
        storiesPerUpdate: String(Math.max(feedArticles.length, 10)),
      },
      favourites,
      { limit: Math.max(feedArticles.length, 10), periodDays },
    );
  }, [articles, favourites, periodDays]);

  function toggleSourceFavourite(source: string) {
    setFavourites((current) => {
      const updated = toggleFavourite(current, "sources", source);

      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-slate-950">{heading}</h2>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {stories.length} stories
        </span>
      </div>
      {stories.length ? (
        <FeedStoryCards
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
