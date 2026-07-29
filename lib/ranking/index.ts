import type { Favourites } from "@/lib/favourites";
import type { ScoredArticle } from "@/lib/matching";
import {
  generateArticleTags,
  normaliseTag,
  selectedPreferenceTags,
  unique,
} from "@/lib/matching";
import type { Preferences } from "@/lib/preferences";
import type { Article } from "@/lib/rss";
import { matchingConfig } from "../../config/preferences";

const favouriteCreatorBoost = 1_000_000;
const favouriteSourceBoost = 100_000;
const favouriteBrandBoost = 10_000;
const preferenceBoost = 100;
const brandTags: Record<string, string> = matchingConfig.brandTags;
const modelTags: Record<string, string> = matchingConfig.modelTags;
const creatorTags: Record<string, string> = matchingConfig.creatorTags;
const topicTags: Record<string, string> = matchingConfig.topicTags;
const technologyTags: Record<string, string> = matchingConfig.technologyTags;

export type RankedFeedOptions = {
  limit?: number;
  periodDays?: number;
};

const maxConsecutiveSourceItems = 2;
const maxConsecutiveCollectionItems = 2;
const genericCollectionTags = new Set([
  "article",
  "video",
  "news",
  "youtube",
  "podcast",
  "podcasts",
  "review",
  "reviews",
  "blog",
  "brand",
  "creator",
]);

export function getPublishedTimestamp(value: string): number | null {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function isWithinPeriod(article: Article, periodDays?: number): boolean {
  if (!periodDays) {
    return true;
  }

  const timestamp = getPublishedTimestamp(article.publishedAt);

  if (timestamp === null) {
    return false;
  }

  const periodStart = Date.now() - periodDays * 24 * 60 * 60 * 1000;

  return timestamp >= periodStart;
}

function matchesTag(generatedTags: string[], value: string): boolean {
  const normalizedValue = normaliseTag(value);

  return generatedTags.some((tag) => normaliseTag(tag) === normalizedValue);
}

function favouriteCreatorMatches(
  article: Article,
  generatedTags: string[],
  favourites: Favourites,
): string[] {
  const normalizedSource = normaliseTag(article.source);

  return favourites.creators.filter((creator) => {
    const creatorTag = creatorTags[creator] ?? creator;

    return (
      normalizedSource === normaliseTag(creator) ||
      matchesTag(generatedTags, creatorTag)
    );
  });
}

function favouriteSourceMatches(
  article: Article,
  favourites: Favourites,
): string[] {
  const normalizedSource = normaliseTag(article.source);

  return favourites.sources.filter(
    (source) => normaliseTag(source) === normalizedSource,
  );
}

function favouriteBrandMatches(
  generatedTags: string[],
  favourites: Favourites,
): string[] {
  return favourites.brands.filter((brand) => {
    const brandTag = brandTags[brand] ?? brand;

    return matchesTag(generatedTags, brandTag);
  });
}

function preferenceMatches(
  generatedTags: string[],
  preferences: Preferences,
): string[] {
  const preferenceGroups = [
    {
      label: "Brand",
      values: preferences.brands,
      tags: brandTags,
    },
    {
      label: "Model Platform",
      values: preferences.models,
      tags: modelTags,
    },
    {
      label: "Creator",
      values: preferences.creators,
      tags: creatorTags,
    },
    {
      label: "Source",
      values: preferences.sources,
      tags: {} as Record<string, string>,
    },
    {
      label: "Topic",
      values: preferences.topics,
      tags: topicTags,
    },
    {
      label: "Technology",
      values: preferences.technology,
      tags: technologyTags,
    },
  ];

  return preferenceGroups.flatMap((group) =>
    group.values
      .filter((value) => matchesTag(generatedTags, group.tags[value] ?? value))
      .map((value) => `${group.label}: ${value}`),
  );
}

function scoreArticleWithFavourites(
  article: Article,
  preferences: Preferences,
  favourites: Favourites,
  originalIndex: number,
): ScoredArticle {
  const generatedTags = generateArticleTags(article);
  const selectedTags = selectedPreferenceTags(preferences);
  const matchedPreferences = preferenceMatches(generatedTags, preferences);
  const creatorMatches = favouriteCreatorMatches(
    article,
    generatedTags,
    favourites,
  );
  const sourceMatches = favouriteSourceMatches(article, favourites);
  const brandMatches = favouriteBrandMatches(generatedTags, favourites);
  const matchedBecause = unique([
    ...creatorMatches.map((creator) => `Favourite Creator: ${creator}`),
    ...sourceMatches.map((source) => `Favourite Source: ${source}`),
    ...brandMatches.map((brand) => `Favourite Brand: ${brand}`),
    ...matchedPreferences,
  ]);
  const score =
    creatorMatches.length * favouriteCreatorBoost +
    sourceMatches.length * favouriteSourceBoost +
    brandMatches.length * favouriteBrandBoost +
    selectedTags.filter((tag) => matchesTag(generatedTags, tag)).length *
      preferenceBoost;

  return {
    article,
    generatedTags,
    matchedBecause,
    originalIndex,
    score,
  };
}

export function sortRankedArticles(
  a: ScoredArticle,
  b: ScoredArticle,
): number {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  const aTimestamp = getPublishedTimestamp(a.article.publishedAt);
  const bTimestamp = getPublishedTimestamp(b.article.publishedAt);

  if (aTimestamp !== null && bTimestamp !== null) {
    return bTimestamp - aTimestamp;
  }

  if (aTimestamp !== null) {
    return -1;
  }

  if (bTimestamp !== null) {
    return 1;
  }

  return a.originalIndex - b.originalIndex;
}

function articleCollection(article: Article): string {
  const sourceTag = normaliseTag(article.source);
  const collection = article.tags.find((tag) => {
    const normalisedTag = normaliseTag(tag);

    return (
      normalisedTag !== sourceTag &&
      !genericCollectionTags.has(normalisedTag)
    );
  });

  if (collection) return collection;

  return article.type === "video" ? "Videos" : "News";
}

function hasRepeatedRecentValues(values: string[], maxConsecutive: number) {
  return (
    values.length === maxConsecutive &&
    new Set(values.map(normaliseTag)).size === 1
  );
}

function balanceScoreGroup(articles: ScoredArticle[]): ScoredArticle[] {
  const pending = [...articles];
  const balanced: ScoredArticle[] = [];

  while (pending.length) {
    const recentSources = balanced
      .slice(-maxConsecutiveSourceItems)
      .map((item) => item.article.source);
    const recentCollections = balanced
      .slice(-maxConsecutiveCollectionItems)
      .map((item) => articleCollection(item.article));
    const repeatedSource = hasRepeatedRecentValues(
      recentSources,
      maxConsecutiveSourceItems,
    )
      ? recentSources[0]
      : null;
    const repeatedCollection = hasRepeatedRecentValues(
      recentCollections,
      maxConsecutiveCollectionItems,
    )
      ? recentCollections[0]
      : null;
    const preferredIndex = pending.findIndex((item) => {
      const sourceMatches =
        repeatedSource &&
        normaliseTag(item.article.source) === normaliseTag(repeatedSource);
      const collectionMatches =
        repeatedCollection &&
        normaliseTag(articleCollection(item.article)) ===
          normaliseTag(repeatedCollection);

      return !sourceMatches && !collectionMatches;
    });
    const fallbackIndex =
      preferredIndex >= 0
        ? preferredIndex
        : pending.findIndex((item) => {
            return (
              !repeatedSource ||
              normaliseTag(item.article.source) !== normaliseTag(repeatedSource)
            );
          });
    const nextIndex = fallbackIndex >= 0 ? fallbackIndex : 0;
    const [nextArticle] = pending.splice(nextIndex, 1);

    if (nextArticle) {
      balanced.push(nextArticle);
    }
  }

  return balanced;
}

function balanceRankedArticles(articles: ScoredArticle[]): ScoredArticle[] {
  const groups: ScoredArticle[][] = [];

  for (const article of articles) {
    const lastGroup = groups[groups.length - 1];

    if (lastGroup?.[0]?.score === article.score) {
      lastGroup.push(article);
    } else {
      groups.push([article]);
    }
  }

  return groups.flatMap(balanceScoreGroup);
}

export function hasPersonalisedSignal(
  preferences: Preferences,
  favourites: Favourites,
): boolean {
  return (
    selectedPreferenceTags(preferences).length > 0 ||
    favourites.creators.length > 0 ||
    favourites.sources.length > 0 ||
    favourites.brands.length > 0
  );
}

export function rankFeedArticles(
  articles: Article[],
  preferences: Preferences,
  favourites: Favourites,
  options: RankedFeedOptions = {},
): ScoredArticle[] {
  const hasSignal = hasPersonalisedSignal(preferences, favourites);
  const ranked = articles
    .filter((article) => isWithinPeriod(article, options.periodDays))
    .map((article, index) =>
      scoreArticleWithFavourites(article, preferences, favourites, index),
    )
    .filter((article) => !hasSignal || article.score > 0)
    .sort(sortRankedArticles);
  const balanced = balanceRankedArticles(ranked);

  return typeof options.limit === "number"
    ? balanced.slice(0, options.limit)
    : balanced;
}
