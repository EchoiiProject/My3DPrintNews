import Parser from "rss-parser";
import { adminSlugForPublicationSlug } from "@/config/verticals";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import {
  getManagedSources,
  type ManagedSource,
  type SourceType,
} from "@/lib/sources";
import { getVerticalBySlug } from "@/lib/verticals";

export type ArticleArchiveItem = {
  id: string;
  verticalId: string | null;
  sourceId: string | null;
  title: string;
  url: string;
  summary: string | null;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string | null;
  sourceName: string | null;
  tags: string[];
  createdAt: string | null;
  verticalName: string;
  verticalSlug: string;
  editorialStatus: ArticleEditorialStatus;
  editorialStatusReason: string | null;
  editorialStatusUpdatedAt: string | null;
};

export type ArticleEditorialStatus =
  | "published"
  | "flagged"
  | "paused"
  | "excluded"
  | "hidden"
  | "blocked";

export type ArticleFetchResult = {
  ok: boolean;
  message: string;
  publicationName?: string;
  sourcesChecked: number;
  fetched: number;
  inserted: number;
  skipped: number;
  failedSources: number;
  errors: number;
  errorMessages: string[];
  bySourceType: Record<SourceType | "unknown", SourceTypeFetchStats>;
  imageSummary: ImageFetchSummary;
  failedSourceDetails: FailedSourceDetail[];
};

function archiveTimestamp(article: ArticleArchiveItem): number {
  const timestamp = new Date(
    article.publishedAt ?? article.createdAt ?? "",
  ).getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

const defaultLatestNewsWindowDays = 30;
const tenYearsInDays = 3650;

function isWithinDays(article: ArticleArchiveItem, days: number): boolean {
  const timestamp = archiveTimestamp(article);

  if (!timestamp) return false;

  return timestamp >= Date.now() - days * 24 * 60 * 60 * 1000;
}

function primaryArticleCollection(article: ArticleArchiveItem): string {
  return article.tags[0] ?? "News";
}

export function balanceLatestArticles(
  articles: ArticleArchiveItem[],
  options: { maxAgeDays?: number | null } = {},
): ArticleArchiveItem[] {
  const maxAgeDays = options.maxAgeDays ?? defaultLatestNewsWindowDays;
  const eligibleArticles = articles.filter((article) => {
    if (!isWithinDays(article, tenYearsInDays)) {
      return false;
    }

    return maxAgeDays === null || isWithinDays(article, maxAgeDays);
  });
  const pending = [...eligibleArticles].sort(
    (articleA, articleB) => archiveTimestamp(articleB) - archiveTimestamp(articleA),
  );
  const balanced: ArticleArchiveItem[] = [];
  const maxConsecutiveSourceItems = 2;

  while (pending.length) {
    const recentSources = balanced
      .slice(-maxConsecutiveSourceItems)
      .map((article) => article.sourceName ?? article.sourceId ?? "unknown");
    const recentCollections = balanced
      .slice(-2)
      .map(primaryArticleCollection);
    const repeatedSource =
      recentSources.length === maxConsecutiveSourceItems &&
      new Set(recentSources).size === 1
        ? recentSources[0]
        : null;
    const preferredIndex = pending.findIndex((article) => {
      const sourceKey = article.sourceName ?? article.sourceId ?? "unknown";
      const collection = primaryArticleCollection(article);

      return (
        (!repeatedSource || sourceKey !== repeatedSource) &&
        !recentCollections.includes(collection)
      );
    });
    const fallbackIndex =
      preferredIndex >= 0
        ? preferredIndex
        : pending.findIndex((article) => {
            const sourceKey = article.sourceName ?? article.sourceId ?? "unknown";

            return !repeatedSource || sourceKey !== repeatedSource;
          });
    const nextIndex = fallbackIndex >= 0 ? fallbackIndex : 0;
    const [nextArticle] = pending.splice(nextIndex, 1);

    if (nextArticle) {
      balanced.push(nextArticle);
    }
  }

  return balanced;
}

export type SourceTypeFetchStats = {
  sourcesChecked: number;
  fetched: number;
  inserted: number;
  skipped: number;
  failedSources: number;
};

export type ImageFetchSummary = {
  imagesFound: number;
  imagesInserted: number;
  imagesBackfilled: number;
  articlesStillMissingImages: number;
};

export type FailedSourceDetail = {
  sourceName: string;
  sourceType: SourceType | "unknown";
  errorMessage: string;
  suggestedNextAction: string | null;
};

type ParsedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  contentEncoded?: string;
  description?: string;
  creator?: string;
  author?: string;
  categories?: string[];
  enclosure?: {
    url?: string;
    type?: string;
  };
  mediaContent?: unknown;
  mediaThumbnail?: unknown;
  mediaGroup?: unknown;
  ogImage?: unknown;
};

type ArticleRecord = {
  id: string;
  vertical_id: string | null;
  source_id: string | null;
  title: string;
  url: string;
  summary: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  source_name: string | null;
  tags: unknown;
  created_at: string | null;
  editorial_status?: string | null;
  editorial_status_reason?: string | null;
  editorial_status_updated_at?: string | null;
  verticals?:
    | { name: string | null; slug: string | null }
    | { name: string | null; slug: string | null }[]
    | null;
};

const parser = new Parser<unknown, ParsedItem>({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
      ["media:group", "mediaGroup"],
      ["content:encoded", "contentEncoded"],
      ["description", "description"],
      ["og:image", "ogImage"],
    ],
  },
});

const sourceTypeKeys: Array<SourceType | "unknown"> = [
  "rss",
  "youtube",
  "podcast",
  "blog",
  "brand",
  "creator",
  "unknown",
];

function emptyStats(): SourceTypeFetchStats {
  return {
    sourcesChecked: 0,
    fetched: 0,
    inserted: 0,
    skipped: 0,
    failedSources: 0,
  };
}

function emptyBySourceType(): Record<SourceType | "unknown", SourceTypeFetchStats> {
  return Object.fromEntries(
    sourceTypeKeys.map((key) => [key, emptyStats()]),
  ) as Record<SourceType | "unknown", SourceTypeFetchStats>;
}

function emptyImageSummary(): ImageFetchSummary {
  return {
    imagesFound: 0,
    imagesInserted: 0,
    imagesBackfilled: 0,
    articlesStillMissingImages: 0,
  };
}

function sourceTypeLabel(type: SourceType | "unknown") {
  return type === "youtube" ? "YouTube" : type;
}

function suggestedNextAction(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("404")) return "Check the feed URL or YouTube channel ID.";
  if (lower.includes("403")) return "This source may block automated fetching.";
  if (lower.includes("406")) return "This source may reject the current request headers.";
  if (lower.includes("invalid") && lower.includes("url")) return "Check the source URL format.";
  if (lower.includes("timed out") || lower.includes("timeout")) return "Try again later or confirm the feed is responding.";

  return null;
}

function itemDate(item: ParsedItem) {
  const value = item.isoDate ?? item.pubDate;
  if (!value) return null;

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeImageUrl(value: unknown): string | null {
  const raw = stringValue(value);

  if (!raw) return null;

  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  try {
    const url = new URL(raw);

    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function fieldValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const attrs = record.$;

  if (record[key]) return record[key];

  if (attrs && typeof attrs === "object") {
    return (attrs as Record<string, unknown>)[key];
  }

  return null;
}

function firstFieldImage(value: unknown): string | null {
  const values = Array.isArray(value) ? value : [value];

  for (const item of values) {
    const url = safeImageUrl(fieldValue(item, "url"));

    if (url) return url;
  }

  return null;
}

function mediaGroupImage(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  return (
    firstFieldImage(record.mediaThumbnail) ??
    firstFieldImage(record["media:thumbnail"]) ??
    firstFieldImage(record.mediaContent) ??
    firstFieldImage(record["media:content"])
  );
}

function mediaGroupText(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;

  return stringValue(record[key]) ?? stringValue(record[`media:${key}`]);
}

function firstHtmlImage(value: string | null | undefined): string | null {
  if (!value) return null;

  const match = value.match(/<img[^>]+src=["']([^"']+)["']/i);

  return safeImageUrl(match?.[1]);
}

function imageUrl(item: ParsedItem) {
  const mediaContent = firstFieldImage(item.mediaContent);
  if (mediaContent) return mediaContent;

  const mediaThumbnail = firstFieldImage(item.mediaThumbnail);
  if (mediaThumbnail) return mediaThumbnail;

  const groupedImage = mediaGroupImage(item.mediaGroup);
  if (groupedImage) return groupedImage;

  const enclosureType = item.enclosure?.type?.toLowerCase() ?? "";

  if (enclosureType.startsWith("image/")) {
    const enclosureImage = safeImageUrl(item.enclosure?.url);
    if (enclosureImage) return enclosureImage;
  }

  const ogImage = safeImageUrl(item.ogImage) ?? firstFieldImage(item.ogImage);
  if (ogImage) return ogImage;

  return (
    firstHtmlImage(item.contentEncoded) ??
    firstHtmlImage(item.content) ??
    firstHtmlImage(item.description)
  );
}

function cleanSummary(item: ParsedItem) {
  const value =
    item.contentSnippet ??
    item.description ??
    item.content ??
    item.contentEncoded ??
    mediaGroupText(item.mediaGroup, "description") ??
    "";

  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || null;
}

function sourceTypeTags(source: ManagedSource): string[] {
  const labelByType: Record<SourceType, string[]> = {
    rss: ["News"],
    youtube: ["Video", "YouTube", "Creator"],
    podcast: ["Podcast"],
    blog: ["Blog"],
    brand: ["Brand"],
    creator: ["Creator"],
  };

  return labelByType[source.sourceType];
}

function toArchiveItem(record: ArticleRecord): ArticleArchiveItem {
  const vertical = Array.isArray(record.verticals)
    ? record.verticals[0]
    : record.verticals;

  return {
    id: record.id,
    verticalId: record.vertical_id,
    sourceId: record.source_id,
    title: record.title,
    url: record.url,
    summary: record.summary,
    imageUrl: record.image_url,
    author: record.author,
    publishedAt: record.published_at,
    sourceName: record.source_name,
    tags: Array.isArray(record.tags) ? record.tags.map(String) : [],
    createdAt: record.created_at,
    verticalName: vertical?.name ?? "Unknown publication",
    verticalSlug: vertical?.slug
      ? adminSlugForPublicationSlug(vertical.slug) ?? vertical.slug
      : "unknown",
    editorialStatus: normaliseEditorialStatus(record.editorial_status),
    editorialStatusReason: record.editorial_status_reason ?? null,
    editorialStatusUpdatedAt: record.editorial_status_updated_at ?? null,
  };
}

function normaliseEditorialStatus(value: string | null | undefined): ArticleEditorialStatus {
  if (
    value === "flagged" ||
    value === "paused" ||
    value === "excluded" ||
    value === "hidden" ||
    value === "blocked"
  ) {
    return value;
  }

  return "published";
}

async function updateSourceAfterFetch(
  sourceId: string,
  patch: {
    healthStatus: string;
    lastCheckedAt: string;
    lastSuccessfulFetchAt?: string | null;
    lastError?: string | null;
  },
) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return;

  await supabase
    .from("vertical_sources")
    .update({
      health_status: patch.healthStatus,
      last_checked_at: patch.lastCheckedAt,
      last_successful_fetch_at: patch.lastSuccessfulFetchAt,
      last_error: patch.lastError ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sourceId);
}

async function updateExistingArticleImages(
  articles: { image_url: string | null; url: string }[],
): Promise<number> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return 0;

  const updates = await Promise.all(
    articles
      .filter((article) => article.image_url)
      .map((article) =>
        supabase
          .from("articles")
          .update({
            image_url: article.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("url", article.url)
          .is("image_url", null)
          .select("id"),
      ),
  );

  return updates.reduce((total, update) => total + (update.data?.length ?? 0), 0);
}

function shouldLogBmxUnionDiagnostics(source: ManagedSource) {
  return (
    source.name.toLowerCase().includes("bmx union") ||
    source.rssUrl.toLowerCase().includes("bmxunion.com")
  );
}

async function logBmxUnionResponseBeforeParse(source: ManagedSource) {
  if (!shouldLogBmxUnionDiagnostics(source)) return;

  try {
    const response = await fetch(source.rssUrl, {
      headers: {
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      redirect: "follow",
    });
    const contentType = response.headers.get("content-type") ?? "unknown";
    const body = await response.text();
    const preview = body.slice(0, 300);

    console.warn("[BMX Union RSS diagnostic]", {
      status: response.status,
      contentType,
      finalUrl: response.url,
      bodyPreview: preview,
      looksLikeHtml:
        contentType.toLowerCase().includes("html") ||
        /^\s*<!doctype html/i.test(preview) ||
        /^\s*<html/i.test(preview),
    });
  } catch (error) {
    console.warn("[BMX Union RSS diagnostic] Pre-parse fetch failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function fetchSourceArticles(
  source: ManagedSource,
  verticalId: string,
): Promise<ArticleFetchResult> {
  const checkedAt = new Date().toISOString();
  const bySourceType = emptyBySourceType();
  bySourceType[source.sourceType].sourcesChecked = 1;

  try {
    await logBmxUnionResponseBeforeParse(source);
    const feed = await parser.parseURL(source.rssUrl);
    const articles = feed.items
      .filter((item) => item.title && item.link)
      .map((item) => ({
        vertical_id: verticalId,
        source_id: source.id,
        title: item.title ?? "Untitled article",
        url: item.link ?? "",
        summary: cleanSummary(item),
        image_url: imageUrl(item),
        author: item.creator ?? item.author ?? null,
        published_at: itemDate(item),
        source_name: source.name,
        tags: Array.from(
          new Set([
            ...sourceTypeTags(source),
            source.category ?? null,
            ...(item.categories ?? []),
          ].filter((tag): tag is string => Boolean(tag))),
        ),
        updated_at: checkedAt,
      }));
    const imagesFound = articles.filter((article) => article.image_url).length;

    const supabase = createServiceSupabaseClient();

    if (!supabase) {
      bySourceType[source.sourceType].fetched = articles.length;
      bySourceType[source.sourceType].skipped = articles.length;
      bySourceType[source.sourceType].failedSources = 1;

      return {
        ok: false,
        message: "Supabase is not configured.",
        sourcesChecked: 1,
        fetched: articles.length,
        inserted: 0,
        skipped: articles.length,
        failedSources: 1,
        errors: 1,
        errorMessages: ["Supabase is not configured."],
        bySourceType,
        imageSummary: {
          imagesFound,
          imagesInserted: 0,
          imagesBackfilled: 0,
          articlesStillMissingImages: articles.length - imagesFound,
        },
        failedSourceDetails: [
          {
            sourceName: source.name,
            sourceType: source.sourceType,
            errorMessage: "Supabase is not configured.",
            suggestedNextAction: "Configure Supabase service credentials.",
          },
        ],
      };
    }

    if (articles.length === 0) {
      await updateSourceAfterFetch(source.id, {
        healthStatus: "warning",
        lastCheckedAt: checkedAt,
        lastSuccessfulFetchAt: null,
        lastError: null,
      });

      return {
        ok: true,
        message: `${source.name} returned no articles.`,
        sourcesChecked: 1,
          fetched: 0,
          inserted: 0,
          skipped: 0,
          failedSources: 0,
          errors: 0,
          errorMessages: [],
          bySourceType,
          imageSummary: emptyImageSummary(),
          failedSourceDetails: [],
      };
    }

    const { data, error } = await supabase
      .from("articles")
      .upsert(articles, { onConflict: "url", ignoreDuplicates: true })
      .select("id");

    if (error) {
      bySourceType[source.sourceType].fetched = articles.length;
      bySourceType[source.sourceType].skipped = articles.length;
      bySourceType[source.sourceType].failedSources = 1;

      await updateSourceAfterFetch(source.id, {
        healthStatus: "offline",
        lastCheckedAt: checkedAt,
        lastError: error.message,
      });

      return {
        ok: false,
        message: error.message,
        sourcesChecked: 1,
        fetched: articles.length,
        inserted: 0,
        skipped: articles.length,
        failedSources: 1,
        errors: 1,
        errorMessages: [error.message],
        bySourceType,
        imageSummary: {
          imagesFound,
          imagesInserted: 0,
          imagesBackfilled: 0,
          articlesStillMissingImages: articles.length - imagesFound,
        },
        failedSourceDetails: [
          {
            sourceName: source.name,
            sourceType: source.sourceType,
            errorMessage: error.message,
            suggestedNextAction: suggestedNextAction(error.message),
          },
        ],
      };
    }

    const inserted = data?.length ?? 0;
    const imagesBackfilled = await updateExistingArticleImages(articles);
    const skipped = Math.max(articles.length - inserted, 0);
    const imagesInserted = Math.min(inserted, imagesFound);
    bySourceType[source.sourceType].fetched = articles.length;
    bySourceType[source.sourceType].inserted = inserted;
    bySourceType[source.sourceType].skipped = skipped;

    await updateSourceAfterFetch(source.id, {
      healthStatus: articles.length ? "healthy" : "warning",
      lastCheckedAt: checkedAt,
      lastSuccessfulFetchAt: articles.length ? checkedAt : null,
      lastError: null,
    });

    return {
      ok: true,
      message: `${source.name} fetched.`,
      sourcesChecked: 1,
      fetched: articles.length,
      inserted,
      skipped,
      failedSources: 0,
      errors: 0,
      errorMessages: [],
      bySourceType,
      imageSummary: {
        imagesFound,
        imagesInserted,
        imagesBackfilled,
        articlesStillMissingImages: articles.length - imagesFound,
      },
      failedSourceDetails: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "RSS fetch failed";
    bySourceType[source.sourceType].failedSources = 1;

    await updateSourceAfterFetch(source.id, {
      healthStatus: "offline",
      lastCheckedAt: checkedAt,
      lastError: message,
    });

    return {
      ok: false,
      message,
      sourcesChecked: 1,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      failedSources: 1,
      errors: 1,
      errorMessages: [`${source.name}: ${message}`],
      bySourceType,
      imageSummary: emptyImageSummary(),
      failedSourceDetails: [
        {
          sourceName: source.name,
          sourceType: source.sourceType,
          errorMessage: message,
          suggestedNextAction: suggestedNextAction(message),
        },
      ],
    };
  }
}

async function fetchArticlesForSources(
  sources: ManagedSource[],
  publicationName?: string,
): Promise<ArticleFetchResult> {
  const enabledSources = sources.filter((source) => source.enabled);
  const results = await Promise.all(
    enabledSources.map((source) => fetchSourceArticles(source, source.verticalId)),
  );
  const fetched = results.reduce((total, result) => total + result.fetched, 0);
  const inserted = results.reduce((total, result) => total + result.inserted, 0);
  const skipped = results.reduce((total, result) => total + result.skipped, 0);
  const errors = results.reduce((total, result) => total + result.errors, 0);
  const failedSources = results.reduce(
    (total, result) => total + result.failedSources,
    0,
  );
  const errorMessages = results.flatMap((result) => result.errorMessages);
  const bySourceType = emptyBySourceType();
  const imageSummary = results.reduce(
    (summary, result) => ({
      imagesFound: summary.imagesFound + result.imageSummary.imagesFound,
      imagesInserted:
        summary.imagesInserted + result.imageSummary.imagesInserted,
      imagesBackfilled:
        summary.imagesBackfilled + result.imageSummary.imagesBackfilled,
      articlesStillMissingImages:
        summary.articlesStillMissingImages +
        result.imageSummary.articlesStillMissingImages,
    }),
    emptyImageSummary(),
  );
  const failedSourceDetails = results.flatMap(
    (result) => result.failedSourceDetails,
  );

  for (const result of results) {
    for (const key of sourceTypeKeys) {
      bySourceType[key].sourcesChecked +=
        result.bySourceType[key].sourcesChecked;
      bySourceType[key].fetched += result.bySourceType[key].fetched;
      bySourceType[key].inserted += result.bySourceType[key].inserted;
      bySourceType[key].skipped += result.bySourceType[key].skipped;
      bySourceType[key].failedSources +=
        result.bySourceType[key].failedSources;
    }
  }
  const activeTypes = sourceTypeKeys
    .filter((key) => bySourceType[key].sourcesChecked > 0)
    .map((key) => {
      const stats = bySourceType[key];
      const itemLabel = key === "youtube" ? "videos" : "items";

      return `${sourceTypeLabel(key)}: ${stats.sourcesChecked} sources checked, ${stats.fetched} ${itemLabel} found, ${stats.inserted} inserted, ${stats.skipped} skipped`;
    });

  return {
    ok: errors === 0,
    message: `${publicationName ? `${publicationName}: ` : ""}Checked ${enabledSources.length} sources; found ${fetched}; inserted ${inserted}; skipped ${skipped}; failed ${failedSources}.${activeTypes.length ? ` ${activeTypes.join(" | ")}` : ""}`,
    publicationName,
    sourcesChecked: enabledSources.length,
    fetched,
    inserted,
    skipped,
    failedSources,
    errors,
    errorMessages,
    bySourceType,
    imageSummary,
    failedSourceDetails,
  };
}

export async function fetchArticlesForVertical(
  verticalSlug: string,
): Promise<ArticleFetchResult> {
  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical) {
    return {
      ok: false,
      message: "Publication not found.",
      publicationName: verticalSlug,
      sourcesChecked: 0,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      failedSources: 0,
      errors: 1,
      errorMessages: ["Publication not found."],
      bySourceType: emptyBySourceType(),
      imageSummary: emptyImageSummary(),
      failedSourceDetails: [],
    };
  }

  return fetchArticlesForSources(
    await getManagedSources(vertical.slug),
    vertical.publicationName ?? vertical.name,
  );
}

export async function fetchArticlesForAllEnabledSources(): Promise<ArticleFetchResult> {
  return fetchArticlesForSources(await getManagedSources(), "All publications");
}

export async function getArticleArchive(filters: {
  editionEligible?: boolean;
  publicOnly?: boolean;
  verticalSlug?: string;
  sourceId?: string;
  recentDays?: number;
} = {}): Promise<ArticleArchiveItem[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  const vertical = filters.verticalSlug
    ? await getVerticalBySlug(filters.verticalSlug)
    : null;

  if (filters.verticalSlug && !vertical) {
    return [];
  }

  let query = supabase
    .from("articles")
    .select(
      "id,vertical_id,source_id,title,url,summary,image_url,author,published_at,source_name,tags,created_at,editorial_status,editorial_status_reason,editorial_status_updated_at,verticals(name,slug)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (vertical) {
    if (!vertical.databaseId) {
      return [];
    }

    query = query.eq("vertical_id", vertical.databaseId);
  }

  if (filters.sourceId) {
    query = query.eq("source_id", filters.sourceId);
  }

  if (filters.editionEligible) {
    query = query.not("editorial_status", "in", "(paused,excluded,hidden,blocked)");
  } else if (filters.publicOnly) {
    query = query.not("editorial_status", "in", "(paused,hidden,blocked)");
  }

  const { data, error } = await query;

  if (error || !data) {
    console.warn("[articles] Archive lookup failed.", error);
    return [];
  }

  const articles = (data as ArticleRecord[]).map(toArchiveItem);
  const periodStart = filters.recentDays
    ? Date.now() - filters.recentDays * 24 * 60 * 60 * 1000
    : null;

  return articles
    .filter((article) => {
      if (periodStart === null) {
        return true;
      }

      const timestamp = new Date(
        article.publishedAt ?? article.createdAt ?? "",
      ).getTime();

      return Number.isFinite(timestamp) && timestamp >= periodStart;
    })
    .sort((articleA, articleB) => {
      const timestampA = new Date(
        articleA.publishedAt ?? articleA.createdAt ?? "",
      ).getTime();
      const timestampB = new Date(
        articleB.publishedAt ?? articleB.createdAt ?? "",
      ).getTime();

      return (Number.isFinite(timestampB) ? timestampB : 0) -
        (Number.isFinite(timestampA) ? timestampA : 0);
    });
}
