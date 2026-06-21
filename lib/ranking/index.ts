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
const creatorTags: Record<string, string> = matchingConfig.creatorTags;

export type RankedFeedOptions = {
  limit?: number;
  periodDays?: number;
};

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

function scoreArticleWithFavourites(
  article: Article,
  preferences: Preferences,
  favourites: Favourites,
  originalIndex: number,
): ScoredArticle {
  const generatedTags = generateArticleTags(article);
  const selectedTags = selectedPreferenceTags(preferences);
  const preferenceMatches = selectedTags.filter((tag) =>
    matchesTag(generatedTags, tag),
  );
  const creatorMatches = favouriteCreatorMatches(
    article,
    generatedTags,
    favourites,
  );
  const sourceMatches = favouriteSourceMatches(article, favourites);
  const brandMatches = favouriteBrandMatches(generatedTags, favourites);
  const matchedBecause = unique([
    ...creatorMatches.map((creator) => `Favourite creator: ${creator}`),
    ...sourceMatches.map((source) => `Favourite source: ${source}`),
    ...brandMatches.map((brand) => `Favourite brand: ${brand}`),
    ...preferenceMatches,
  ]);
  const score =
    creatorMatches.length * favouriteCreatorBoost +
    sourceMatches.length * favouriteSourceBoost +
    brandMatches.length * favouriteBrandBoost +
    preferenceMatches.length * preferenceBoost;

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

  return typeof options.limit === "number"
    ? ranked.slice(0, options.limit)
    : ranked;
}
