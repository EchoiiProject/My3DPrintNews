import Parser from "rss-parser";
import type { ManagedSource, SourceHealth } from "@/lib/sources";

export type RssSourceDiagnostic = {
  sourceId: string;
  sourceName: string;
  url: string;
  verticalId: string | null;
  reachable: boolean;
  statusCode: number | null;
  itemCount: number;
  latestArticleDate: string | null;
  oldestArticleDate: string | null;
  lastCheckedAt: string;
  errorMessage: string | null;
  healthStatus: SourceHealth | "placeholder";
};

type DiagnosticItem = {
  isoDate?: string;
  pubDate?: string;
};

const parser = new Parser<unknown, DiagnosticItem>({
  timeout: 10000,
});

function itemDate(item: DiagnosticItem) {
  const value = item.isoDate ?? item.pubDate;
  if (!value) return null;

  const time = new Date(value).getTime();

  return Number.isFinite(time) ? new Date(time).toISOString() : null;
}

function healthStatus(
  source: ManagedSource,
  reachable: boolean,
  itemCount: number,
  latestArticleDate: string | null,
): RssSourceDiagnostic["healthStatus"] {
  if (!source.enabled) return "placeholder";
  if (!reachable) return "offline";
  if (itemCount === 0 || !latestArticleDate) return "warning";

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  return new Date(latestArticleDate).getTime() < sevenDaysAgo
    ? "warning"
    : "healthy";
}

async function checkRssSource(
  source: ManagedSource,
): Promise<RssSourceDiagnostic> {
  const lastCheckedAt = new Date().toISOString();

  if (!source.rssUrl) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      url: "",
      verticalId: source.verticalId || null,
      reachable: false,
      statusCode: null,
      itemCount: 0,
      latestArticleDate: null,
      oldestArticleDate: null,
      lastCheckedAt,
      errorMessage: "Missing RSS URL",
      healthStatus: "placeholder",
    };
  }

  try {
    const response = await fetch(source.rssUrl, {
      headers: {
        accept: "application/rss+xml, application/xml, text/xml, */*",
      },
      next: { revalidate: 0 },
    });
    const xml = await response.text();

    if (!response.ok) {
      return {
        sourceId: source.id,
        sourceName: source.name,
        url: source.rssUrl,
        verticalId: source.verticalId || null,
        reachable: false,
        statusCode: response.status,
        itemCount: 0,
        latestArticleDate: null,
        oldestArticleDate: null,
        lastCheckedAt,
        errorMessage: response.statusText || "Feed request failed",
        healthStatus: "offline",
      };
    }

    const feed = await parser.parseString(xml);
    const articleDates = feed.items
      .map(itemDate)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const latestArticleDate = articleDates.at(-1) ?? null;
    const oldestArticleDate = articleDates[0] ?? null;

    return {
      sourceId: source.id,
      sourceName: source.name,
      url: source.rssUrl,
      verticalId: source.verticalId || null,
      reachable: true,
      statusCode: response.status,
      itemCount: feed.items.length,
      latestArticleDate,
      oldestArticleDate,
      lastCheckedAt,
      errorMessage: null,
      healthStatus: healthStatus(
        source,
        true,
        feed.items.length,
        latestArticleDate,
      ),
    };
  } catch (error) {
    return {
      sourceId: source.id,
      sourceName: source.name,
      url: source.rssUrl,
      verticalId: source.verticalId || null,
      reachable: false,
      statusCode: null,
      itemCount: 0,
      latestArticleDate: null,
      oldestArticleDate: null,
      lastCheckedAt,
      errorMessage:
        error instanceof Error ? error.message : "Feed diagnostic failed",
      healthStatus: "offline",
    };
  }
}

export async function checkRssSources(
  sources: ManagedSource[],
): Promise<RssSourceDiagnostic[]> {
  const settledDiagnostics = await Promise.allSettled(
    sources.map((source) => checkRssSource(source)),
  );

  return settledDiagnostics
    .map((result, index) => {
      if (result.status === "fulfilled") return result.value;

      const source = sources[index];

      return {
        sourceId: source.id,
        sourceName: source.name,
        url: source.rssUrl,
        verticalId: source.verticalId || null,
        reachable: false,
        statusCode: null,
        itemCount: 0,
        latestArticleDate: null,
        oldestArticleDate: null,
        lastCheckedAt: new Date().toISOString(),
        errorMessage: "Feed diagnostic failed",
        healthStatus: "offline",
      };
    });
}
