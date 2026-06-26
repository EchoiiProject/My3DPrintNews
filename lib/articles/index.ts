import Parser from "rss-parser";
import { adminSlugForPublicationSlug } from "@/config/verticals";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getManagedSources, type ManagedSource } from "@/lib/sources";
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
};

export type ArticleFetchResult = {
  ok: boolean;
  message: string;
  sourcesChecked: number;
  fetched: number;
  inserted: number;
  skipped: number;
  failedSources: number;
  errors: number;
  errorMessages: string[];
};

type ParsedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  creator?: string;
  author?: string;
  categories?: string[];
  enclosure?: {
    url?: string;
    type?: string;
  };
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
  verticals?:
    | { name: string | null; slug: string | null }
    | { name: string | null; slug: string | null }[]
    | null;
};

const parser = new Parser<unknown, ParsedItem>({
  timeout: 10000,
});

function itemDate(item: ParsedItem) {
  const value = item.isoDate ?? item.pubDate;
  if (!value) return null;

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function imageUrl(item: ParsedItem) {
  const enclosureType = item.enclosure?.type?.toLowerCase() ?? "";

  if (enclosureType.startsWith("image/")) {
    return item.enclosure?.url ?? null;
  }

  return null;
}

function cleanSummary(item: ParsedItem) {
  const value = item.contentSnippet ?? item.content ?? "";

  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() || null;
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
    verticalName: vertical?.name ?? "Unknown vertical",
    verticalSlug: vertical?.slug
      ? adminSlugForPublicationSlug(vertical.slug) ?? vertical.slug
      : "unknown",
  };
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

async function fetchSourceArticles(
  source: ManagedSource,
  verticalId: string,
): Promise<ArticleFetchResult> {
  const checkedAt = new Date().toISOString();

  try {
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
        tags: item.categories ?? [],
        updated_at: checkedAt,
      }));

    const supabase = createServiceSupabaseClient();

    if (!supabase) {
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
      };
    }

    const { data, error } = await supabase
      .from("articles")
      .upsert(articles, { onConflict: "url", ignoreDuplicates: true })
      .select("id");

    if (error) {
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
      };
    }

    const inserted = data?.length ?? 0;

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
      skipped: Math.max(articles.length - inserted, 0),
      failedSources: 0,
      errors: 0,
      errorMessages: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "RSS fetch failed";

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
    };
  }
}

async function fetchArticlesForSources(
  sources: ManagedSource[],
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

  return {
    ok: errors === 0,
    message: `Checked ${enabledSources.length} sources; found ${fetched}; inserted ${inserted}; skipped ${skipped}; failed ${failedSources}.`,
    sourcesChecked: enabledSources.length,
    fetched,
    inserted,
    skipped,
    failedSources,
    errors,
    errorMessages,
  };
}

export async function fetchArticlesForVertical(
  verticalSlug: string,
): Promise<ArticleFetchResult> {
  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical) {
    return {
      ok: false,
      message: "Vertical not found.",
      sourcesChecked: 0,
      fetched: 0,
      inserted: 0,
      skipped: 0,
      failedSources: 0,
      errors: 1,
      errorMessages: ["Vertical not found."],
    };
  }

  return fetchArticlesForSources(await getManagedSources(vertical.slug));
}

export async function fetchArticlesForAllEnabledSources(): Promise<ArticleFetchResult> {
  return fetchArticlesForSources(await getManagedSources());
}

export async function getArticleArchive(filters: {
  verticalSlug?: string;
  sourceId?: string;
  recentDays?: number;
} = {}): Promise<ArticleArchiveItem[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  let query = supabase
    .from("articles")
    .select(
      "id,vertical_id,source_id,title,url,summary,image_url,author,published_at,source_name,tags,created_at,verticals(name,slug)",
    )
    .order("published_at", { ascending: false })
    .limit(100);

  if (filters.sourceId) {
    query = query.eq("source_id", filters.sourceId);
  }

  if (filters.recentDays) {
    query = query.gte(
      "published_at",
      new Date(Date.now() - filters.recentDays * 24 * 60 * 60 * 1000).toISOString(),
    );
  }

  const { data, error } = await query;

  if (error || !data) {
    console.warn("[articles] Archive lookup failed.", error);
    return [];
  }

  const articles = (data as ArticleRecord[]).map(toArchiveItem);

  return filters.verticalSlug
    ? articles.filter((article) => article.verticalSlug === filters.verticalSlug)
    : articles;
}
