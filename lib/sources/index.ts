import { registry, type RegistryItem } from "@/config/registry";
import type { RssSourceDiagnostic } from "@/lib/rss/diagnostics";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getVerticalBySlug } from "@/lib/verticals";

export type SourceHealth = "healthy" | "warning" | "offline";

export type ManagedSource = {
  id: string;
  name: string;
  rssUrl: string;
  verticalId: string;
  verticalSlug: string;
  verticalName: string;
  category: string | null;
  enabled: boolean;
  lastSuccessfulFetch: string | null;
  articlesFetched: number;
  lastArticleDate: string | null;
  healthStatus: SourceHealth;
  createdAt: string;
};

export type SourceDiagnostics = {
  totalConfiguredSources: number;
  enabledSources: number;
  disabledSources: number;
  healthySources: number;
  offlineSources: number;
  sourcesWithNoRecentArticles: number;
  totalArticlesCollected: number;
  newestArticle: string | null;
  oldestArticle: string | null;
  daysOfNewsCoverage: number;
  newsHealthScore: number;
  newsHealthLabel: "Excellent" | "Good" | "Needs Attention" | "Poor";
  verticalReadiness:
    | "Ready for Demo"
    | "Needs Source Review"
    | "Not Enough Feed Coverage";
  zeroArticleSources: ManagedSource[];
  topContributors: ManagedSource[];
  noActivitySevenDays: ManagedSource[];
  recentlyAddedSources: ManagedSource[];
  feedDiagnostics: RssSourceDiagnostic[];
};

type SourceRecord = {
  id: string;
  vertical_id: string | null;
  name: string;
  rss_url: string;
  category: string | null;
  enabled: boolean;
  health_status: string;
  last_successful_fetch: string | null;
  articles_fetched: number | null;
  last_article_date: string | null;
  created_at: string | null;
  verticals?:
    | { slug: string | null; name: string | null }
    | { slug: string | null; name: string | null }[]
    | null;
};

const fallbackArticleCounts = [12, 8, 10, 5, 4, 0, 2, 0, 7, 3];

function normaliseHealth(value: string | undefined): SourceHealth {
  if (value === "healthy" || value === "warning" || value === "offline") {
    return value;
  }

  return "warning";
}

function fallbackSources(verticalSlug?: string): ManagedSource[] {
  const now = new Date();

  return (registry.sources as readonly RegistryItem[])
    .filter(
      (
        source,
      ): source is RegistryItem & { url: string } =>
        Boolean(source.url),
    )
    .map((source, index) => {
      const articlesFetched = fallbackArticleCounts[index % fallbackArticleCounts.length];
      const daysAgo = index % 9;
      const lastArticleDate =
        articlesFetched > 0
          ? new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
          : null;
      const healthStatus: SourceHealth =
        source.status === "active"
          ? "healthy"
          : source.status === "partial"
            ? "warning"
            : "offline";

      return {
        id: source.id,
        name: source.label,
        rssUrl: source.url ?? "",
        verticalId: "my3dprintnews",
        verticalSlug: "my3dprintnews",
        verticalName: "My3DPrintNews",
        category: source.relatedBrands?.length ? "Manufacturer" : "Industry News",
        enabled: source.feedEnabled !== false && source.status !== "placeholder",
        lastSuccessfulFetch: lastArticleDate,
        articlesFetched,
        lastArticleDate,
        healthStatus,
        createdAt: new Date(now.getTime() - index * 24 * 60 * 60 * 1000).toISOString(),
      };
    })
    .filter((source) => !verticalSlug || source.verticalSlug === verticalSlug);
}

function toManagedSource(record: SourceRecord): ManagedSource {
  const vertical = Array.isArray(record.verticals)
    ? record.verticals[0]
    : record.verticals;

  return {
    id: record.id,
    name: record.name,
    rssUrl: record.rss_url,
    verticalId: record.vertical_id ?? "",
    verticalSlug: vertical?.slug ?? "unknown",
    verticalName: vertical?.name ?? "Unknown vertical",
    category: record.category,
    enabled: record.enabled,
    lastSuccessfulFetch: record.last_successful_fetch,
    articlesFetched: record.articles_fetched ?? 0,
    lastArticleDate: record.last_article_date,
    healthStatus: normaliseHealth(record.health_status),
    createdAt: record.created_at ?? new Date().toISOString(),
  };
}

function logFallback(context: string, error: unknown) {
  console.warn(`[sources] ${context}; using registry fallback.`, error);
}

function daysBetween(oldestArticle: string | null, newestArticle: string | null) {
  if (!oldestArticle || !newestArticle) return 0;

  const oldest = new Date(oldestArticle).getTime();
  const newest = new Date(newestArticle).getTime();

  if (!Number.isFinite(oldest) || !Number.isFinite(newest) || newest < oldest) {
    return 0;
  }

  return Math.ceil((newest - oldest) / (24 * 60 * 60 * 1000));
}

function coverageScore(daysOfNewsCoverage: number) {
  if (daysOfNewsCoverage >= 7) return 30;
  if (daysOfNewsCoverage >= 3) return 20;
  if (daysOfNewsCoverage >= 1) return 10;
  return 0;
}

function newsHealthLabel(score: number): SourceDiagnostics["newsHealthLabel"] {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 45) return "Needs Attention";
  return "Poor";
}

function verticalReadiness(
  score: number,
  daysOfNewsCoverage: number,
): SourceDiagnostics["verticalReadiness"] {
  if (score >= 70 && daysOfNewsCoverage >= 7) return "Ready for Demo";
  if (score < 45 || daysOfNewsCoverage < 3) return "Not Enough Feed Coverage";
  return "Needs Source Review";
}

export async function getManagedSources(
  verticalSlug?: string,
): Promise<ManagedSource[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return fallbackSources(verticalSlug);
  }

  const query = supabase
    .from("feed_sources")
    .select(
      "id,vertical_id,name,rss_url,category,enabled,health_status,last_successful_fetch,articles_fetched,last_article_date,created_at,verticals(slug,name)",
    )
    .order("created_at", { ascending: false });

  const { data, error } = await query;

  if (error || !data) {
    logFallback("Supabase source lookup failed", error);
    return fallbackSources(verticalSlug);
  }

  return (data as SourceRecord[])
    .map(toManagedSource)
    .filter((source) => !verticalSlug || source.verticalSlug === verticalSlug);
}

export async function sourceDiagnostics(
  verticalSlug?: string,
  managedSources?: ManagedSource[],
  feedDiagnostics: RssSourceDiagnostic[] = [],
): Promise<SourceDiagnostics> {
  const sources = managedSources ?? (await getManagedSources(verticalSlug));
  const diagnosticBySourceId = new Map(
    feedDiagnostics.map((diagnostic) => [diagnostic.sourceId, diagnostic]),
  );
  const sourceArticleDate = (source: ManagedSource) =>
    diagnosticBySourceId.get(source.id)?.latestArticleDate ??
    source.lastArticleDate;
  const sourceArticleCount = (source: ManagedSource) =>
    diagnosticBySourceId.get(source.id)?.itemCount ?? source.articlesFetched;
  const sourceHealth = (source: ManagedSource) => {
    const diagnostic = diagnosticBySourceId.get(source.id);

    if (!diagnostic || diagnostic.healthStatus === "placeholder") {
      return source.healthStatus;
    }

    return diagnostic.healthStatus;
  };
  const datedArticles = (
    feedDiagnostics.length
      ? feedDiagnostics.flatMap((diagnostic) => [
          diagnostic.oldestArticleDate,
          diagnostic.latestArticleDate,
        ])
      : sources.map((source) => source.lastArticleDate)
  )
    .filter((value): value is string => Boolean(value))
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const enabledSources = sources.filter((source) => source.enabled);
  const healthySources = sources.filter(
    (source) => sourceHealth(source) === "healthy",
  );
  const offlineSources = sources.filter(
    (source) => sourceHealth(source) === "offline",
  );
  const zeroArticleSources = sources.filter(
    (source) => sourceArticleCount(source) === 0,
  );
  const noActivitySevenDays = sources.filter(
    (source) =>
      !sourceArticleDate(source) ||
      new Date(sourceArticleDate(source) ?? "").getTime() < sevenDaysAgo,
  );
  const newestArticle = datedArticles.at(-1) ?? null;
  const oldestArticle = datedArticles[0] ?? null;
  const daysOfNewsCoverage = daysBetween(oldestArticle, newestArticle);
  const sourceBase = Math.max(sources.length, 1);
  const enabledBase = Math.max(enabledSources.length, 1);
  const enabledScore = Math.round((enabledSources.length / sourceBase) * 20);
  const healthyScore = Math.round((healthySources.length / enabledBase) * 30);
  const activityScore = Math.round(
    ((enabledSources.length -
      noActivitySevenDays.filter((source) => source.enabled).length) /
      enabledBase) *
      20,
  );
  const newsHealthScore = Math.max(
    0,
    Math.min(
      100,
      enabledScore +
        healthyScore +
        activityScore +
        coverageScore(daysOfNewsCoverage),
    ),
  );

  return {
    totalConfiguredSources: sources.length,
    enabledSources: enabledSources.length,
    disabledSources: sources.length - enabledSources.length,
    healthySources: healthySources.length,
    offlineSources: offlineSources.length,
    sourcesWithNoRecentArticles: noActivitySevenDays.length,
    totalArticlesCollected: sources.reduce(
      (total, source) => total + sourceArticleCount(source),
      0,
    ),
    newestArticle,
    oldestArticle,
    daysOfNewsCoverage,
    newsHealthScore,
    newsHealthLabel: newsHealthLabel(newsHealthScore),
    verticalReadiness: verticalReadiness(newsHealthScore, daysOfNewsCoverage),
    zeroArticleSources,
    topContributors: [...sources]
      .sort((a, b) => sourceArticleCount(b) - sourceArticleCount(a))
      .slice(0, 5),
    noActivitySevenDays,
    recentlyAddedSources: [...sources]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    feedDiagnostics,
  };
}

export async function createManagedSource(input: {
  name: string;
  rssUrl: string;
  verticalSlug: string;
  category?: string | null;
}) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured, so the source could not be saved.",
    };
  }

  const vertical = await getVerticalBySlug(input.verticalSlug);

  if (!vertical) {
    return { ok: false, message: "Vertical not found." };
  }

  const dbVertical = await supabase
    .from("verticals")
    .select("id")
    .eq("slug", input.verticalSlug)
    .maybeSingle();

  if (dbVertical.error || !dbVertical.data) {
    console.error("Supabase source vertical lookup error", dbVertical.error);

    return { ok: false, message: "Vertical could not be found in Supabase." };
  }

  const { error } = await supabase.from("feed_sources").insert({
    vertical_id: dbVertical.data.id,
    name: input.name,
    rss_url: input.rssUrl,
    category: input.category ?? null,
    enabled: true,
    health_status: "warning",
  });

  if (error) {
    console.error("Supabase source insert error", error);
    return { ok: false, message: "Source could not be saved." };
  }

  return { ok: true, message: "Source saved." };
}

export async function updateManagedSource(
  id: string,
  patch: Partial<Pick<ManagedSource, "name" | "rssUrl" | "category" | "enabled">>,
) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured, so the source could not be updated.",
    };
  }

  const update: Record<string, string | boolean | null> = {
    updated_at: new Date().toISOString(),
  };

  if (typeof patch.name === "string") update.name = patch.name;
  if (typeof patch.rssUrl === "string") update.rss_url = patch.rssUrl;
  if (typeof patch.category !== "undefined") update.category = patch.category;
  if (typeof patch.enabled === "boolean") update.enabled = patch.enabled;

  const { error } = await supabase.from("feed_sources").update(update).eq("id", id);

  if (error) {
    console.error("Supabase source update error", error);
    return { ok: false, message: "Source could not be updated." };
  }

  return { ok: true, message: "Source updated." };
}

export async function deleteManagedSource(id: string) {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Supabase is not configured, so the source could not be deleted.",
    };
  }

  const { error } = await supabase.from("feed_sources").delete().eq("id", id);

  if (error) {
    console.error("Supabase source delete error", error);
    return { ok: false, message: "Source could not be deleted." };
  }

  return { ok: true, message: "Source deleted." };
}
