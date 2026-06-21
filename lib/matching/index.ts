import type { Article } from "@/lib/rss";
import type { Preferences } from "@/lib/preferences";
import { matchingConfig } from "../../preferences.config";

const focusTagAliases: Record<string, string> = matchingConfig.focusTagAliases;
const brandTags: Record<string, string> = matchingConfig.brandTags;
const modelTags: Record<string, string> = matchingConfig.modelTags;
const creatorTags: Record<string, string> = matchingConfig.creatorTags;
const topicTags: Record<string, string> = matchingConfig.topicTags;
const technologyTags: Record<string, string> = matchingConfig.technologyTags;

export type ScoredArticle = {
  article: Article;
  generatedTags: string[];
  matchedBecause: string[];
  originalIndex: number;
  score: number;
};

export type FocusFilter = {
  label: string;
  tag: string;
};

export function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function normaliseTag(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return focusTagAliases[normalized] ?? normalized;
}

export function generateArticleTags(article: Article): string[] {
  const text = [article.title, article.summary, article.source, ...article.tags]
    .join(" ")
    .toLowerCase();

  return unique([
    article.source,
    ...article.tags,
    ...Object.entries(matchingConfig.scoringKeywords)
      .filter(([, keywords]) =>
        keywords.some((keyword) => text.includes(keyword)),
      )
      .map(([tag]) => tag),
  ]);
}

export function selectedPreferenceTags(preferences: Preferences): string[] {
  return unique([
    ...preferences.brands
      .map((brand) => brandTags[brand])
      .filter((brand): brand is string => Boolean(brand)),
    ...preferences.models
      .map((model) => modelTags[model])
      .filter((model): model is string => Boolean(model)),
    ...preferences.creators
      .map((creator) => creatorTags[creator])
      .filter((creator): creator is string => Boolean(creator)),
    ...preferences.sources,
    ...preferences.topics
      .map((topic) => topicTags[topic])
      .filter((topic): topic is string => Boolean(topic)),
    ...preferences.technology
      .map((technology) => technologyTags[technology])
      .filter((technology): technology is string => Boolean(technology)),
  ]);
}

export function preferenceFocusFilters(preferences: Preferences): FocusFilter[] {
  return [
    ...preferences.brands.map((brand) => ({
      label: brand,
      tag: brandTags[brand] ?? brand,
    })),
    ...preferences.models.map((model) => ({
      label: model,
      tag: modelTags[model] ?? model,
    })),
    ...preferences.creators.map((creator) => ({
      label: creator,
      tag: creatorTags[creator] ?? creator,
    })),
    ...preferences.sources.map((source) => ({
      label: source,
      tag: source,
    })),
    ...preferences.topics.map((topic) => ({
      label: topic,
      tag: topicTags[topic] ?? topic,
    })),
    ...preferences.technology.map((technology) => ({
      label: technology,
      tag: technologyTags[technology] ?? technology,
    })),
  ];
}

export function matchesFocus(
  scoredArticle: ScoredArticle,
  filter: FocusFilter,
) {
  const filterTag = normaliseTag(filter.tag);

  return scoredArticle.generatedTags.some(
    (tag) => normaliseTag(tag) === filterTag,
  );
}

export function scoreArticle(
  article: Article,
  preferences: Preferences,
  originalIndex: number,
): ScoredArticle {
  const generatedTags = generateArticleTags(article);
  const selectedTags = selectedPreferenceTags(preferences);
  const normalizedGeneratedTags = generatedTags.map((tag) => normaliseTag(tag));
  const matchedBecause = selectedTags.filter((tag) =>
    normalizedGeneratedTags.includes(normaliseTag(tag)),
  );

  return {
    article,
    generatedTags,
    matchedBecause,
    originalIndex,
    score: matchedBecause.length,
  };
}
