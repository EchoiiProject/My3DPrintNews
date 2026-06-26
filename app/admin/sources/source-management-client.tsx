"use client";

import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import type { ManagedSource, SourceDiagnostics, SourceType } from "@/lib/sources";
import {
  publicationSlugForVertical,
  type Vertical,
} from "@/config/verticals";

type SourceActionResponse = {
  ok: boolean;
  message: string;
  publicationName?: string;
  errors?: Record<string, string>;
  fetched?: number;
  inserted?: number;
  skipped?: number;
  sourcesChecked?: number;
  failedSources?: number;
  errorsCount?: number;
  errorMessages?: string[];
  bySourceType?: Record<
    SourceType | "unknown",
    {
      sourcesChecked: number;
      fetched: number;
      inserted: number;
      skipped: number;
      failedSources: number;
    }
  >;
  imageSummary?: {
    imagesFound: number;
    imagesInserted: number;
    imagesBackfilled: number;
    articlesStillMissingImages: number;
  };
  failedSourceDetails?: Array<{
    sourceName: string;
    sourceType: SourceType | "unknown";
    errorMessage: string;
    suggestedNextAction: string | null;
  }>;
};

type FeedDiagnostic = SourceDiagnostics["feedDiagnostics"][number];

type SourceFormState = {
  name: string;
  rssUrl: string;
  sourceType: SourceType;
  category: string;
  verticalId: string;
  verticalSlug: string;
  enabled: boolean;
};

type BulkSourceRow = {
  name: string;
  rssUrl: string;
  category: string;
  sourceType: SourceType;
  enabled: boolean;
  lineNumber: number;
};

const sourceTypes: SourceType[] = [
  "rss",
  "youtube",
  "podcast",
  "blog",
  "brand",
  "creator",
];
const summarySourceTypes: Array<SourceType | "unknown"> = [
  ...sourceTypes,
  "unknown",
];

type PublicationFilter = "all" | string;
type SourceTypeFilter = "all" | SourceType;
type HealthFilter = "all" | "healthy" | "warning" | "offline";

function formatDate(value: string | null): string {
  if (!value) return "No data";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function healthClass(status: FeedDiagnostic["healthStatus"]) {
  if (status === "healthy") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "offline") return "border-red-100 bg-red-50 text-red-700";
  if (status === "placeholder") return "border-slate-200 bg-slate-50 text-slate-500";
  return "border-amber-100 bg-amber-50 text-amber-700";
}

function healthLabel(score: number) {
  if (score >= 85) return { label: "Excellent", marker: "🟢" };
  if (score >= 70) return { label: "Good", marker: "🟡" };
  if (score >= 45) return { label: "Needs Attention", marker: "🟠" };
  return { label: "Poor", marker: "🔴" };
}

function coverageLabel(days: number) {
  if (days >= 7) return "healthy";
  if (days >= 3) return "usable";
  if (days >= 1) return "thin coverage";
  return "broken or no content";
}

function sourceHealthDetail(source: ManagedSource, diagnostic: FeedDiagnostic) {
  if (!source.enabled) {
    return {
      label: "Disabled",
      detail: "Source is disabled and not treated as active.",
    };
  }

  if (!diagnostic.reachable || diagnostic.healthStatus === "offline") {
    return {
      label: "Failed",
      detail: diagnostic.errorMessage ?? "Feed could not be reached.",
    };
  }

  const latest = diagnostic.latestArticleDate
    ? new Date(diagnostic.latestArticleDate).getTime()
    : null;
  const today = Date.now() - 24 * 60 * 60 * 1000;
  const stale = !latest || latest < Date.now() - 30 * 24 * 60 * 60 * 1000;

  if (stale) {
    return {
      label: "Stale",
      detail: "Feed reachable but inactive for 30+ days.",
    };
  }

  if (diagnostic.healthStatus === "warning" || diagnostic.itemCount === 0) {
    return {
      label: "Warning",
      detail: diagnostic.itemCount === 0
        ? "Reachable but returned zero items."
        : "Reachable but needs review.",
    };
  }

  return {
    label: "Healthy",
    detail:
      latest && latest >= today
        ? "Reachable and fetched today."
        : "Reachable with recent items.",
  };
}

function sourceWarnings(source: ManagedSource, diagnostic: FeedDiagnostic) {
  const warnings: string[] = [];
  const stale =
    !diagnostic.latestArticleDate ||
    new Date(diagnostic.latestArticleDate).getTime() <
      Date.now() - 7 * 24 * 60 * 60 * 1000;

  if (!source.rssUrl) warnings.push("No RSS URL");
  if (diagnostic.healthStatus === "offline" || !diagnostic.reachable) {
    warnings.push("Unreachable feed");
  }
  if (diagnostic.itemCount === 0) warnings.push("Zero articles");
  if (stale) warnings.push("Stale feed");
  if (!source.enabled) warnings.push("Disabled source");

  return warnings;
}

function fallbackDiagnostic(source: ManagedSource): FeedDiagnostic {
  return {
    sourceId: source.id,
    sourceName: source.name,
    url: source.rssUrl,
    verticalId: source.verticalId || null,
    reachable: source.enabled && source.healthStatus !== "offline",
    statusCode: null,
    itemCount: source.articlesFetched,
    latestArticleDate: source.lastArticleDate,
    oldestArticleDate: null,
    lastCheckedAt: source.lastSuccessfulFetch ?? new Date().toISOString(),
    errorMessage: null,
    healthStatus: source.enabled ? source.healthStatus : "placeholder",
  };
}

function testFeedResult(diagnostic: FeedDiagnostic) {
  if (!diagnostic.reachable) {
    return [
      "Errors: feed unavailable",
      diagnostic.errorMessage,
      diagnostic.statusCode ? `HTTP ${diagnostic.statusCode}` : null,
    ]
      .filter(Boolean)
      .join(" | ");
  }

  return [
    "Feed reachable",
    diagnostic.statusCode ? `HTTP ${diagnostic.statusCode}` : null,
    `Items returned: ${diagnostic.itemCount}`,
    `Latest article date: ${formatDate(diagnostic.latestArticleDate)}`,
    `Oldest article date: ${formatDate(diagnostic.oldestArticleDate)}`,
    `Checked: ${formatDate(diagnostic.lastCheckedAt)}`,
  ]
    .filter(Boolean)
    .join(" | ");
}

function verticalDatabaseId(vertical: Vertical) {
  return vertical.databaseId ?? vertical.id;
}

function parseBoolean(value: string | undefined) {
  if (!value) return true;

  return !["false", "no", "0", "disabled"].includes(value.trim().toLowerCase());
}

function parseSourceType(value: string | undefined): SourceType {
  return sourceTypes.includes(value?.trim().toLowerCase() as SourceType)
    ? (value?.trim().toLowerCase() as SourceType)
    : "rss";
}

function parseBulkSourceRows(value: string) {
  const rows: BulkSourceRow[] = [];
  const errors: string[] = [];

  value
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .forEach(({ line, lineNumber }) => {
      const [
        name = "",
        rssUrl = "",
        category = "",
        enabled = "true",
        sourceType = "rss",
      ] = line
        .split(",")
        .map((field) => field.trim());

      if (!name) {
        errors.push(`Row ${lineNumber}: source name is required.`);
      }

      if (!rssUrl) {
        errors.push(`Row ${lineNumber}: RSS URL is required.`);
      }

      if (rssUrl) {
        try {
          const url = new URL(rssUrl);
          if (!["http:", "https:"].includes(url.protocol)) {
            errors.push(`Row ${lineNumber}: RSS URL must be http or https.`);
          }
        } catch {
          errors.push(`Row ${lineNumber}: RSS URL is not valid.`);
        }
      }

      rows.push({
        name,
        rssUrl,
        category,
        sourceType: parseSourceType(sourceType),
        enabled: parseBoolean(enabled),
        lineNumber,
      });
    });

  if (!rows.length) {
    errors.push("Add at least one source row.");
  }

  return { rows, errors };
}

export function SourceManagementClient({
  diagnostics,
  sources,
  verticalSlug,
  verticals,
}: {
  diagnostics: SourceDiagnostics;
  sources: ManagedSource[];
  verticalSlug?: string;
  verticals: Vertical[];
}) {
  const router = useRouter();
  const initialPublication =
    verticals.find((vertical) => vertical.slug === verticalSlug) ??
    verticals[0];
  const initialPublicationId = initialPublication
    ? verticalDatabaseId(initialPublication)
    : "";
  const [name, setName] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [category, setCategory] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("rss");
  const [selectedVertical, setSelectedVertical] = useState(
    initialPublication?.slug ?? "my3dprintnews",
  );
  const [selectedVerticalId, setSelectedVerticalId] = useState(
    initialPublicationId,
  );
  const [publicationFilter, setPublicationFilter] =
    useState<PublicationFilter>(initialPublicationId);
  const [sourceTypeFilter, setSourceTypeFilter] =
    useState<SourceTypeFilter>("all");
  const [healthFilter, setHealthFilter] = useState<HealthFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<SourceFormState>({
    name: "",
    rssUrl: "",
    sourceType: "rss",
    category: "",
    verticalId: initialPublicationId,
    verticalSlug: initialPublication?.slug ?? "my3dprintnews",
    enabled: true,
  });
  const [message, setMessage] = useState("");
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});
  const [bulkSources, setBulkSources] = useState("");
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);
  const [bulkImported, setBulkImported] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);
  const [fetchSummary, setFetchSummary] = useState<SourceActionResponse | null>(
    null,
  );
  const [fetchingArticles, setFetchingArticles] = useState(false);

  async function sourceRequest(
    url: string,
    options: RequestInit,
    successMessage: string,
  ) {
    setMessage("");
    const response = await fetch(url, options);
    const result = (await response.json()) as SourceActionResponse;

    if (!response.ok || !result.ok) {
      setMessage(result.message);
      return;
    }

    setMessage(successMessage);
    router.refresh();
  }

  async function addSource() {
    await sourceRequest(
      "/api/admin/sources",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          rss_url: rssUrl,
          source_type: sourceType,
          category,
          vertical_id: selectedVerticalId,
          enabled,
        }),
      },
      "Source added.",
    );
    setName("");
    setRssUrl("");
    setSourceType("rss");
    setCategory("");
    setEnabled(true);
  }

  async function bulkAddSources() {
    const parsed = parseBulkSourceRows(bulkSources);
    setBulkErrors(parsed.errors);
    setBulkImported(false);
    setFetchSummary(null);

    if (parsed.errors.length) {
      return;
    }

    const importTarget = verticals.find(
      (vertical) => verticalDatabaseId(vertical) === selectedVerticalId,
    );

    if (!importTarget) {
      setBulkErrors(["Choose a publication before importing sources."]);
      return;
    }

    if (
      !window.confirm(
        `You are about to import ${parsed.rows.length} sources into ${
          importTarget.publicationName ?? importTarget.name
        }.`,
      )
    ) {
      return;
    }

    setBulkSaving(true);
    setMessage("Saving sources...");

    const apiErrors: string[] = [];

    for (const row of parsed.rows) {
      const response = await fetch("/api/admin/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          rss_url: row.rssUrl,
          source_type: row.sourceType,
          category: row.category,
          vertical_id: selectedVerticalId,
          enabled: row.enabled,
        }),
      });
      const result = (await response.json()) as SourceActionResponse;

      if (!response.ok || !result.ok) {
        apiErrors.push(`Row ${row.lineNumber}: ${result.message}`);
      }
    }

    setBulkSaving(false);
    setBulkErrors(apiErrors);

    if (apiErrors.length) {
      setMessage("Some sources could not be saved.");
      return;
    }

    setBulkImported(true);
    setBulkSources("");
    setMessage(`${parsed.rows.length} sources added.`);
    router.refresh();
  }

  async function toggleSource(source: ManagedSource) {
    await sourceRequest(
      `/api/admin/sources/${source.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !source.enabled }),
      },
      source.enabled ? "Source disabled." : "Source enabled.",
    );
  }

  function startEditing(source: ManagedSource) {
    setEditingSourceId(source.id);
    setEditValues({
      name: source.name,
      rssUrl: source.rssUrl,
      sourceType: source.sourceType,
      category: source.category ?? "",
      verticalId: source.verticalId,
      verticalSlug: source.verticalSlug,
      enabled: source.enabled,
    });
  }

  async function saveSource(source: ManagedSource) {
    await sourceRequest(
      `/api/admin/sources/${source.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editValues.name,
          rss_url: editValues.rssUrl,
          source_type: editValues.sourceType,
          category: editValues.category,
          vertical_id: editValues.verticalId,
          enabled: editValues.enabled,
        }),
      },
      "Source updated.",
    );
    setEditingSourceId(null);
  }

  async function deleteSource(source: ManagedSource) {
    if (!window.confirm(`Delete ${source.name}?`)) return;

    await sourceRequest(
      `/api/admin/sources/${source.id}`,
      { method: "DELETE" },
      "Source archived.",
    );
  }

  function testFeed(source: ManagedSource, diagnostic: FeedDiagnostic) {
    setTestingSourceId(source.id);
    const result = testFeedResult(diagnostic);

    window.setTimeout(() => {
      setTestResults((current) => ({ ...current, [source.id]: result }));
      setTestingSourceId(null);
    }, 250);
  }

  function refreshDiagnostics() {
    setMessage("Checking RSS feeds...");
    router.refresh();
  }

  async function fetchArticlesNow() {
    const fetchTarget =
      verticals.find((vertical) => verticalDatabaseId(vertical) === selectedVerticalId) ??
      verticals.find((vertical) => vertical.slug === selectedVertical);

    setFetchingArticles(true);
    setFetchSummary(null);
    setMessage("Fetching articles...");
    const response = await fetch("/api/admin/articles/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verticalSlug: verticalSlug ?? fetchTarget?.slug ?? selectedVertical,
      }),
    });
    const result = (await response.json()) as SourceActionResponse;

    setFetchSummary(result);
    setMessage(result.message);
    setFetchingArticles(false);
    router.refresh();
  }

  const diagnosticBySourceId = useMemo(
    () =>
      new Map(
        diagnostics.feedDiagnostics.map((diagnostic) => [
          diagnostic.sourceId,
          diagnostic,
        ]),
      ),
    [diagnostics.feedDiagnostics],
  );
  const selectedPublication =
    verticals.find(
      (vertical) => verticalDatabaseId(vertical) === selectedVerticalId,
    ) ?? verticals.find((vertical) => vertical.slug === selectedVertical);
  const filteredPublication =
    verticals.find(
      (vertical) => verticalDatabaseId(vertical) === publicationFilter,
    ) ?? null;
  const visibleSources = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);
      const matchesPublication =
        publicationFilter === "all" || source.verticalId === publicationFilter;
      const matchesType =
        sourceTypeFilter === "all" || source.sourceType === sourceTypeFilter;
      const matchesHealth =
        healthFilter === "all" || diagnostic.healthStatus === healthFilter;
      const matchesSearch =
        !normalizedSearch ||
        source.name.toLowerCase().includes(normalizedSearch) ||
        source.rssUrl.toLowerCase().includes(normalizedSearch);

      return matchesPublication && matchesType && matchesHealth && matchesSearch;
    });
  }, [
    diagnosticBySourceId,
    healthFilter,
    publicationFilter,
    searchTerm,
    sourceTypeFilter,
    sources,
  ]);
  const headerSummary = useMemo(() => {
    const statusCounts = visibleSources.reduce(
      (counts, source) => {
        const diagnostic =
          diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

        if (diagnostic.healthStatus === "healthy") counts.healthy += 1;
        if (diagnostic.healthStatus === "warning") counts.warning += 1;
        if (diagnostic.healthStatus === "offline") counts.failed += 1;

        return counts;
      },
      { healthy: 0, warning: 0, failed: 0 },
    );

    return {
      rss: visibleSources.filter((source) => source.sourceType === "rss").length,
      youtube: visibleSources.filter((source) => source.sourceType === "youtube")
        .length,
      ...statusCounts,
    };
  }, [diagnosticBySourceId, visibleSources]);
  const scopedSources = useMemo(
    () =>
      publicationFilter === "all"
        ? sources
        : sources.filter((source) => source.verticalId === publicationFilter),
    [publicationFilter, sources],
  );
  const scopedDiagnostics = useMemo(
    () =>
      scopedSources.map(
        (source) =>
          diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source),
      ),
    [diagnosticBySourceId, scopedSources],
  );
  const publicationHealth = useMemo(() => {
    const activeSources = scopedSources.filter((source) => source.enabled);
    const base = Math.max(activeSources.length, 1);
    const healthy = activeSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

      return diagnostic.healthStatus === "healthy";
    }).length;
    const fresh = activeSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);
      const latest = diagnostic.latestArticleDate
        ? new Date(diagnostic.latestArticleDate).getTime()
        : 0;

      return latest >= Date.now() - 7 * 24 * 60 * 60 * 1000;
    }).length;
    const productive = activeSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

      return diagnostic.itemCount > 0 || source.articlesFetched > 0;
    }).length;
    const imageTotal =
      (fetchSummary?.imageSummary?.imagesFound ?? 0) +
      (fetchSummary?.imageSummary?.articlesStillMissingImages ?? 0);
    const imageCoverage =
      imageTotal > 0
        ? Math.round(
            ((fetchSummary?.imageSummary?.imagesFound ?? 0) / imageTotal) * 100,
          )
        : null;
    const sourceHealth = Math.round((healthy / base) * 100);
    const freshness = Math.round((fresh / base) * 100);
    const contentHealth = Math.round((productive / base) * 100);
    const imageHealth = imageCoverage ?? 0;
    const overall = Math.round(
      sourceHealth * 0.3 +
        freshness * 0.3 +
        contentHealth * 0.2 +
        imageHealth * 0.2,
    );

    return {
      overall,
      sourceHealth,
      freshness,
      contentHealth,
      imageCoverage,
      label: healthLabel(overall),
    };
  }, [diagnosticBySourceId, fetchSummary, scopedSources]);
  const operationalSummary = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const today = todayStart.getTime();
    const contentToday = scopedDiagnostics.reduce((total, diagnostic) => {
      const latest = diagnostic.latestArticleDate
        ? new Date(diagnostic.latestArticleDate).getTime()
        : 0;

      return latest >= today ? total + diagnostic.itemCount : total;
    }, 0);

    return {
      lastFetch:
        scopedDiagnostics
          .map((diagnostic) => diagnostic.lastCheckedAt)
          .filter(Boolean)
          .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ??
        null,
      contentToday,
      sourcesNeedingAttention: visibleSources.filter((source) => {
        const diagnostic =
          diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

        return diagnostic.healthStatus !== "healthy" || !source.enabled;
      }).length,
      failedSources: headerSummary.failed,
      imagesBackfilled: fetchSummary?.imageSummary?.imagesBackfilled ?? 0,
      newVideos:
        fetchSummary?.bySourceType?.youtube?.inserted ??
        visibleSources
          .filter((source) => source.sourceType === "youtube")
          .reduce((total, source) => {
            const diagnostic =
              diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

            return total + diagnostic.itemCount;
          }, 0),
    };
  }, [
    diagnosticBySourceId,
    fetchSummary,
    headerSummary.failed,
    scopedDiagnostics,
    visibleSources,
  ]);
  const networkPublicationRows = useMemo(
    () =>
      verticals.map((vertical) => {
        const verticalId = verticalDatabaseId(vertical);
        const publicationSources = sources.filter(
          (source) => source.verticalId === verticalId,
        );
        const warnings = publicationSources.filter((source) => {
          const diagnostic =
            diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

          return diagnostic.healthStatus === "warning";
        }).length;
        const failed = publicationSources.filter((source) => {
          const diagnostic =
            diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

          return diagnostic.healthStatus === "offline";
        }).length;
        const healthy = publicationSources.filter((source) => {
          const diagnostic =
            diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

          return diagnostic.healthStatus === "healthy";
        }).length;
        const lastFetch =
          publicationSources
            .map((source) => {
              const diagnostic =
                diagnosticBySourceId.get(source.id) ??
                fallbackDiagnostic(source);

              return diagnostic.lastCheckedAt;
            })
            .filter(Boolean)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ??
          null;
        const score = publicationSources.length
          ? Math.round((healthy / publicationSources.length) * 100)
          : 0;

        return {
          vertical,
          health: healthLabel(score),
          sources: publicationSources.length,
          warnings,
          failed,
          lastFetch,
          status: vertical.publicationStatus ?? vertical.status,
        };
      }),
    [diagnosticBySourceId, sources, verticals],
  );
  const scopedMetrics = useMemo(() => {
    const sourceCount = scopedSources.length;
    const enabledSources = scopedSources.filter((source) => source.enabled);
    const healthySources = scopedSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

      return diagnostic.healthStatus === "healthy";
    });
    const offlineSources = scopedSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

      return diagnostic.healthStatus === "offline";
    });
    const zeroArticleSources = scopedSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);

      return diagnostic.itemCount === 0;
    });
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const noActivitySevenDays = scopedSources.filter((source) => {
      const diagnostic =
        diagnosticBySourceId.get(source.id) ?? fallbackDiagnostic(source);
      const latest = diagnostic.latestArticleDate
        ? new Date(diagnostic.latestArticleDate).getTime()
        : 0;

      return !latest || latest < sevenDaysAgo;
    });
    const datedArticles = scopedDiagnostics
      .flatMap((diagnostic) => [
        diagnostic.oldestArticleDate,
        diagnostic.latestArticleDate,
      ])
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const oldestArticle = datedArticles[0] ?? null;
    const newestArticle = datedArticles.at(-1) ?? null;
    const daysOfNewsCoverage = (() => {
      if (!oldestArticle || !newestArticle) return 0;

      const oldest = new Date(oldestArticle).getTime();
      const newest = new Date(newestArticle).getTime();

      return Number.isFinite(oldest) && Number.isFinite(newest) && newest >= oldest
        ? Math.ceil((newest - oldest) / (24 * 60 * 60 * 1000))
        : 0;
    })();

    return {
      sourceCount,
      enabledSources: enabledSources.length,
      disabledSources: sourceCount - enabledSources.length,
      healthySources: healthySources.length,
      offlineSources: offlineSources.length,
      zeroArticleSources,
      noActivitySevenDays,
      totalArticlesCollected: scopedDiagnostics.reduce(
        (total, diagnostic) => total + diagnostic.itemCount,
        0,
      ),
      newestArticle,
      oldestArticle,
      daysOfNewsCoverage,
      topContributors: [...scopedSources]
        .sort((sourceA, sourceB) => {
          const diagnosticA =
            diagnosticBySourceId.get(sourceA.id) ?? fallbackDiagnostic(sourceA);
          const diagnosticB =
            diagnosticBySourceId.get(sourceB.id) ?? fallbackDiagnostic(sourceB);

          return diagnosticB.itemCount - diagnosticA.itemCount;
        })
        .slice(0, 5),
      recentlyAddedSources: [...scopedSources]
        .sort(
          (sourceA, sourceB) =>
            new Date(sourceB.createdAt).getTime() -
            new Date(sourceA.createdAt).getTime(),
        )
        .slice(0, 5),
    };
  }, [diagnosticBySourceId, scopedDiagnostics, scopedSources]);
  const selectedAdminSlug =
    verticalSlug ?? selectedPublication?.slug ?? selectedVertical;
  const selectedPublicSlug = selectedPublication
    ? publicationSlugForVertical(selectedPublication)
    : selectedAdminSlug;

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-end">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Publication
            </span>
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-900"
              disabled={Boolean(verticalSlug)}
              onChange={(event) => {
                setPublicationFilter(event.target.value);
                if (event.target.value !== "all") {
                  const nextVertical = verticals.find(
                    (vertical) =>
                      verticalDatabaseId(vertical) === event.target.value,
                  );

                  if (nextVertical) {
                    setSelectedVerticalId(event.target.value);
                    setSelectedVertical(nextVertical.slug);
                  }
                }
              }}
              value={publicationFilter}
            >
              {!verticalSlug ? <option value="all">All Publications</option> : null}
              {verticals.map((vertical) => (
                <option key={vertical.slug} value={verticalDatabaseId(vertical)}>
                  {vertical.publicationName ?? vertical.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {[
              [
                "Publication",
                filteredPublication?.publicationName ??
                  filteredPublication?.name ??
                  "All Publications",
              ],
              ["Sources", visibleSources.length],
              ["RSS", headerSummary.rss],
              ["YouTube", headerSummary.youtube],
              ["Healthy", headerSummary.healthy],
              ["Warnings", headerSummary.warning],
              ["Failed", headerSummary.failed],
            ].map(([label, value]) => (
              <div
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2"
                key={label}
              >
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_1.4fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Source Type
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(["all", ...sourceTypes] as SourceTypeFilter[]).map((type) => (
                <button
                  className={[
                    "rounded-md border px-2.5 py-1.5 text-xs font-bold capitalize",
                    sourceTypeFilter === type
                      ? "border-blue-500 bg-blue-600 text-white"
                      : "border-slate-200 bg-white text-slate-700",
                  ].join(" ")}
                  key={type}
                  onClick={() => setSourceTypeFilter(type)}
                  type="button"
                >
                  {type === "all" ? "All" : type}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Health
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(["all", "healthy", "warning", "offline"] as HealthFilter[]).map(
                (status) => (
                  <button
                    className={[
                      "rounded-md border px-2.5 py-1.5 text-xs font-bold capitalize",
                      healthFilter === status
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700",
                    ].join(" ")}
                    key={status}
                    onClick={() => setHealthFilter(status)}
                    type="button"
                  >
                    {status === "offline" ? "Failed" : status}
                  </button>
                ),
              )}
            </div>
          </div>
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Search
            </span>
            <input
              className="mt-2 min-h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search source name or URL"
              value={searchTerm}
            />
          </label>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Publication Health
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-950">
            {publicationHealth.label.marker} {publicationHealth.label.label}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            Overall health: {publicationHealth.overall}%
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["Source health", `${publicationHealth.sourceHealth}%`],
              ["Freshness", `${publicationHealth.freshness}%`],
              ["Content health", `${publicationHealth.contentHealth}%`],
              [
                "Image coverage",
                publicationHealth.imageCoverage === null
                  ? "No fetch image data"
                  : `${publicationHealth.imageCoverage}%`,
              ],
            ].map(([label, value]) => (
              <div className="rounded-md border border-slate-100 bg-slate-50 p-3" key={label}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Publication Overview
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {[
              [
                "Publication",
                filteredPublication?.publicationName ??
                  filteredPublication?.name ??
                  "All Publications",
              ],
              [
                "Status",
                filteredPublication?.publicationStatus ??
                  filteredPublication?.status ??
                  "Network view",
              ],
              ["Strategy", filteredPublication?.sector ?? "Not configured"],
              ["Sponsor", filteredPublication?.sponsorId ?? "Not configured"],
              [
                "Licence Holder",
                filteredPublication?.ownerName ?? "Not configured",
              ],
              ["Hostname", filteredPublication?.hostname ?? "Not configured"],
              ["Last Fetch", formatDate(operationalSummary.lastFetch)],
              ["Next Scheduled Fetch", "Daily at 02:00 UTC"],
              ["Manual Fetch", "Available"],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Sources", visibleSources.length],
          ["Healthy", headerSummary.healthy],
          ["Warnings", headerSummary.warning],
          ["Failed", headerSummary.failed],
          ["RSS", headerSummary.rss],
          ["YouTube", headerSummary.youtube],
          [
            "Podcasts",
            visibleSources.filter((source) => source.sourceType === "podcast").length,
          ],
          [
            "Articles",
            scopedDiagnostics.reduce(
              (total, diagnostic) => total + diagnostic.itemCount,
              0,
            ),
          ],
          ["Videos", operationalSummary.newVideos],
          [
            "Images",
            fetchSummary?.imageSummary?.imagesFound ?? "No fetch data",
          ],
        ].map(([label, value]) => (
          <div
            className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur"
            key={label}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          Operational Summary
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {[
            ["Today's fetch", formatDate(operationalSummary.lastFetch)],
            ["Content received today", operationalSummary.contentToday],
            ["Sources needing attention", operationalSummary.sourcesNeedingAttention],
            ["Images backfilled", operationalSummary.imagesBackfilled],
            ["Failed sources", operationalSummary.failedSources],
            ["New videos", operationalSummary.newVideos],
          ].map(([label, value]) => (
            <div className="rounded-md border border-slate-100 bg-slate-50 p-3" key={label}>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {publicationFilter === "all" ? (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-2xl font-bold text-slate-950">
              Network Publication Operations
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Publication</th>
                  <th className="px-4 py-3">Health</th>
                  <th className="px-4 py-3">Sources</th>
                  <th className="px-4 py-3">Warnings</th>
                  <th className="px-4 py-3">Failed</th>
                  <th className="px-4 py-3">Last Fetch</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {networkPublicationRows.map((row) => (
                  <tr key={row.vertical.slug}>
                    <td className="px-4 py-3 font-bold text-slate-950">
                      {row.vertical.publicationName ?? row.vertical.name}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      {row.health.marker} {row.health.label}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.sources}</td>
                    <td className="px-4 py-3 text-slate-700">{row.warnings}</td>
                    <td className="px-4 py-3 text-slate-700">{row.failed}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(row.lastFetch)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "News Health",
            value: `${publicationHealth.overall}%`,
            detail: publicationHealth.label.label,
          },
          {
            label: "Sources",
            value: scopedMetrics.sourceCount,
            detail: `${scopedMetrics.enabledSources} enabled | ${scopedMetrics.disabledSources} disabled | ${scopedMetrics.healthySources} healthy`,
          },
          {
            label: "Content Coverage",
            value: scopedMetrics.totalArticlesCollected,
            detail: `${formatDate(scopedMetrics.oldestArticle)} to ${formatDate(scopedMetrics.newestArticle)} | ${scopedMetrics.daysOfNewsCoverage} days`,
          },
          {
            label: "Attention",
            value:
              scopedMetrics.offlineSources +
              scopedMetrics.noActivitySevenDays.length +
              scopedMetrics.zeroArticleSources.length,
            detail: `${scopedMetrics.offlineSources} offline | ${scopedMetrics.noActivitySevenDays.length} stale | ${scopedMetrics.zeroArticleSources.length} zero articles`,
          },
        ].map((card) => (
          <div
            className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur"
            key={card.label}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {card.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {card.detail}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Days of News Coverage
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {scopedMetrics.daysOfNewsCoverage} days
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {coverageLabel(scopedMetrics.daysOfNewsCoverage)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Publication Readiness
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {publicationHealth.overall >= 70 && scopedMetrics.daysOfNewsCoverage >= 7
              ? "Ready for Demo"
              : publicationHealth.overall < 45 ||
                  scopedMetrics.daysOfNewsCoverage < 3
                ? "Not Enough Feed Coverage"
                : "Needs Source Review"}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {publicationHealth.label.label} health at {publicationHealth.overall}%
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div>
          <p className="text-sm font-bold text-slate-950">
            Live RSS diagnostics
          </p>
          <p className="text-sm font-semibold text-slate-600">
            {operationalSummary.lastFetch
              ? `Last checked ${formatDate(operationalSummary.lastFetch)}`
              : "No live checks available"}
          </p>
        </div>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white"
          onClick={refreshDiagnostics}
          type="button"
        >
          Check RSS Feeds
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white"
          disabled={fetchingArticles}
          onClick={fetchArticlesNow}
          type="button"
        >
          {fetchingArticles ? "Fetching..." : "Fetch Articles Now"}
        </button>
      </div>

      {fetchSummary ? (
        <section className="rounded-lg border border-emerald-100 bg-emerald-50/80 p-5">
          <h2 className="text-2xl font-bold text-emerald-950">
            Fetch summary
          </h2>
          <p className="mt-2 text-sm font-semibold text-emerald-900">
            {fetchSummary.message}
          </p>
          <p className="mt-1 text-sm font-bold text-emerald-950">
            Publication:{" "}
            {fetchSummary.publicationName ??
              selectedPublication?.publicationName ??
              selectedPublication?.name ??
              selectedAdminSlug}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {[
              ["Sources checked", fetchSummary.sourcesChecked ?? 0],
              ["Articles found", fetchSummary.fetched ?? 0],
              ["Inserted", fetchSummary.inserted ?? 0],
              ["Skipped", fetchSummary.skipped ?? 0],
            ].map(([label, value]) => (
              <div
                className="rounded-md border border-emerald-100 bg-white/80 p-3"
                key={label}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-950">
                  {value}
                </p>
              </div>
            ))}
          </div>
          {fetchSummary.bySourceType ? (
            <div className="mt-4 overflow-hidden rounded-md border border-emerald-100 bg-white/80">
              <table className="min-w-full divide-y divide-emerald-100 text-sm">
                <thead className="bg-emerald-50 text-left text-xs font-bold uppercase tracking-wide text-emerald-700">
                  <tr>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Sources</th>
                    <th className="px-3 py-2">Found</th>
                    <th className="px-3 py-2">Inserted</th>
                    <th className="px-3 py-2">Skipped</th>
                    <th className="px-3 py-2">Failed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {summarySourceTypes
                    .filter(
                      (type) =>
                        (fetchSummary.bySourceType?.[type]?.sourcesChecked ??
                          0) > 0,
                    )
                    .map((type) => {
                      const stats = fetchSummary.bySourceType?.[type];
                      const itemLabel = type === "youtube" ? "videos" : "items";

                      return (
                        <tr key={type}>
                          <td className="px-3 py-2 font-bold capitalize text-emerald-950">
                            {type}
                          </td>
                          <td className="px-3 py-2 text-emerald-900">
                            {stats?.sourcesChecked ?? 0}
                          </td>
                          <td className="px-3 py-2 text-emerald-900">
                            {stats?.fetched ?? 0} {itemLabel}
                          </td>
                          <td className="px-3 py-2 text-emerald-900">
                            {stats?.inserted ?? 0}
                          </td>
                          <td className="px-3 py-2 text-emerald-900">
                            {stats?.skipped ?? 0}
                          </td>
                          <td className="px-3 py-2 text-emerald-900">
                            {stats?.failedSources ?? 0}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : null}
          {fetchSummary.imageSummary ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {[
                ["Images found", fetchSummary.imageSummary.imagesFound],
                ["Images on new articles", fetchSummary.imageSummary.imagesInserted],
                ["Images backfilled", fetchSummary.imageSummary.imagesBackfilled],
                [
                  "Still missing images",
                  fetchSummary.imageSummary.articlesStillMissingImages,
                ],
              ].map(([label, value]) => (
                <div
                  className="rounded-md border border-emerald-100 bg-white/80 p-3"
                  key={label}
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    {label}
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-950">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
          {fetchSummary.failedSourceDetails?.length ? (
            <div className="mt-4 rounded-md border border-red-100 bg-white/80 p-3">
              <h3 className="text-sm font-bold text-red-800">
                Failed sources
              </h3>
              <div className="mt-2 space-y-2">
                {fetchSummary.failedSourceDetails.map((failure) => (
                  <div
                    className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800"
                    key={`${failure.sourceName}-${failure.errorMessage}`}
                  >
                    <p className="font-bold">
                      {failure.sourceName}{" "}
                      <span className="font-semibold capitalize">
                        ({failure.sourceType})
                      </span>
                    </p>
                    <p className="mt-1 font-semibold">{failure.errorMessage}</p>
                    {failure.suggestedNextAction ? (
                      <p className="mt-1">
                        Suggested next action: {failure.suggestedNextAction}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          {fetchSummary.errorMessages?.length ? (
            <div className="mt-4 space-y-1 text-sm font-semibold text-red-700">
              {fetchSummary.errorMessages.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ["View Article Archive", `/admin/${selectedAdminSlug}/articles`],
              ["View Public Publication", `/publications/${selectedPublicSlug}`],
              ["View Feed", `/publications/${selectedPublicSlug}/feed`],
              ["Source Management", `/admin/${selectedAdminSlug}/sources`],
            ].map(([label, href]) => (
              <a
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-emerald-200 bg-white px-3 text-sm font-bold text-emerald-800"
                href={href}
                key={label}
              >
                {label}
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-5">
        <h2 className="text-2xl font-bold text-blue-950">Add Source</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-7">
          <input
            className="min-h-11 rounded-md border border-blue-100 px-3 text-sm"
            onChange={(event) => setName(event.target.value)}
            placeholder="Source name"
            value={name}
          />
          <input
            className="min-h-11 rounded-md border border-blue-100 px-3 text-sm lg:col-span-2"
            onChange={(event) => setRssUrl(event.target.value)}
            placeholder="https://example.com/feed/"
            value={rssUrl}
          />
          <input
            className="min-h-11 rounded-md border border-blue-100 px-3 text-sm"
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Category"
            value={category}
          />
          <select
            className="min-h-11 rounded-md border border-blue-100 px-3 text-sm capitalize"
            onChange={(event) => setSourceType(event.target.value as SourceType)}
            value={sourceType}
          >
            {sourceTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <select
            className="min-h-11 rounded-md border border-blue-100 px-3 text-sm"
            onChange={(event) => {
              const nextVertical = verticals.find(
                (vertical) => verticalDatabaseId(vertical) === event.target.value,
              );

              setSelectedVerticalId(event.target.value);
              setSelectedVertical(nextVertical?.slug ?? selectedVertical);
            }}
            value={selectedVerticalId}
            disabled={Boolean(verticalSlug)}
          >
            {verticals.map((vertical) => (
              <option key={vertical.slug} value={verticalDatabaseId(vertical)}>
                {vertical.name}
              </option>
            ))}
          </select>
          <label className="flex min-h-11 items-center gap-2 rounded-md border border-blue-100 bg-white px-3 text-sm font-bold text-blue-950">
            <input
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              type="checkbox"
            />
            Enabled
          </label>
        </div>
        <button
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white"
          onClick={addSource}
          type="button"
        >
          Add Source
        </button>
        {message ? (
          <p className="mt-3 text-sm font-semibold text-blue-950">{message}</p>
        ) : null}
      </section>

      <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-blue-950">
              Bulk Add Sources
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-blue-900">
              Paste one source per line: name,rss_url,category,enabled,source_type
            </p>
            <p className="mt-2 rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-bold text-blue-950">
              Importing into:{" "}
              {selectedPublication?.publicationName ??
                selectedPublication?.name ??
                "Choose a publication"}
            </p>
          </div>
          {bulkImported ? (
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white"
              disabled={fetchingArticles}
              onClick={fetchArticlesNow}
              type="button"
            >
              {fetchingArticles ? "Fetching..." : "Fetch Articles Now"}
            </button>
          ) : null}
        </div>
        <textarea
          className="mt-4 min-h-36 w-full rounded-md border border-blue-100 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
          onChange={(event) => setBulkSources(event.target.value)}
          placeholder="BMX Union,https://bmxunion.com/feed/,News,true,rss"
          value={bulkSources}
        />
        {bulkErrors.length ? (
          <div className="mt-3 space-y-1 rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            {bulkErrors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white disabled:bg-blue-300"
            disabled={bulkSaving}
            onClick={bulkAddSources}
            type="button"
          >
            {bulkSaving ? "Saving..." : "Bulk Add Sources"}
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700"
            onClick={() => {
              setBulkSources("");
              setBulkErrors([]);
            }}
            type="button"
          >
            Clear
          </button>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-[1120px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Publication</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Organisation/Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Latest Fetch</th>
                <th className="px-4 py-3">Articles</th>
                <th className="sticky right-0 z-10 bg-slate-50 px-4 py-3 shadow-[-8px_0_16px_rgba(15,23,42,0.06)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visibleSources.map((source) => {
                const diagnostic =
                  diagnosticBySourceId.get(source.id) ??
                  fallbackDiagnostic(source);
                const warnings = sourceWarnings(source, diagnostic);
                const healthDetail = sourceHealthDetail(source, diagnostic);

                return (
                  <Fragment key={source.id}>
                  <tr
                    className={warnings.length ? "bg-amber-50/45" : undefined}
                  >
                    <td className="max-w-xs px-4 py-3 font-bold text-slate-900">
                      <p>{source.name}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {source.rssUrl || "Missing URL"}
                      </p>
                      {warnings.length ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {warnings.map((warning) => (
                            <span
                              className="rounded-full border border-amber-100 bg-white px-2 py-0.5 text-[11px] font-bold text-amber-700"
                              key={warning}
                            >
                              {warning}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {source.verticalName}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-xs font-bold capitalize text-blue-700">
                      {source.sourceType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {source.category ?? "General"}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {source.enabled ? "Enabled" : "Disabled"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={[
                          "rounded-full border px-2 py-0.5 text-xs font-bold capitalize",
                          healthClass(diagnostic.healthStatus),
                        ].join(" ")}
                      >
                        {diagnostic.healthStatus}
                      </span>
                      <p className="mt-2 text-xs font-bold text-slate-700">
                        {healthDetail.label}
                      </p>
                      <p className="mt-1 max-w-[12rem] text-xs leading-5 text-slate-500">
                        {healthDetail.detail}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p className="font-semibold">
                        {diagnostic.reachable ? "Reachable" : "Failed"}
                      </p>
                      {diagnostic.statusCode ? (
                        <p className="text-xs">HTTP {diagnostic.statusCode}</p>
                      ) : null}
                      <p className="text-xs">
                        Latest: {formatDate(diagnostic.latestArticleDate)}
                      </p>
                      <p className="text-xs">
                        Checked: {formatDate(diagnostic.lastCheckedAt)}
                      </p>
                      {diagnostic.errorMessage ? (
                        <p className="text-xs font-semibold text-red-700">
                          {diagnostic.errorMessage}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {diagnostic.itemCount}
                      <p className="text-xs font-semibold text-slate-500">
                        live
                      </p>
                    </td>
                    <td className="sticky right-0 bg-white px-4 py-3 shadow-[-8px_0_16px_rgba(15,23,42,0.06)]">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-md border px-2 py-1 text-xs font-bold" onClick={() => startEditing(source)} type="button">Edit</button>
                        <button className="rounded-md border px-2 py-1 text-xs font-bold" onClick={() => toggleSource(source)} type="button">{source.enabled ? "Disable" : "Enable"}</button>
                        <button className="rounded-md border border-red-100 px-2 py-1 text-xs font-bold text-red-700" onClick={() => deleteSource(source)} type="button">Delete</button>
                        <button className="rounded-md border border-blue-100 px-2 py-1 text-xs font-bold text-blue-700" onClick={() => testFeed(source, diagnostic)} type="button">Test Feed</button>
                      </div>
                      {testResults[source.id] || testingSourceId === source.id ? (
                        <p className="mt-2 text-xs font-semibold text-slate-600">
                          {testingSourceId === source.id ? "Testing..." : testResults[source.id]}
                        </p>
                      ) : null}
                    </td>
                  </tr>
                  {editingSourceId === source.id ? (
                    <tr className="bg-blue-50/60">
                      <td className="px-4 py-4" colSpan={9}>
                        <div className="grid gap-3 lg:grid-cols-7">
                          <input
                            className="min-h-10 rounded-md border border-blue-100 px-3 text-sm"
                            onChange={(event) =>
                              setEditValues((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                            value={editValues.name}
                          />
                          <input
                            className="min-h-10 rounded-md border border-blue-100 px-3 text-sm lg:col-span-2"
                            onChange={(event) =>
                              setEditValues((current) => ({
                                ...current,
                                rssUrl: event.target.value,
                              }))
                            }
                            value={editValues.rssUrl}
                          />
                          <input
                            className="min-h-10 rounded-md border border-blue-100 px-3 text-sm"
                            onChange={(event) =>
                              setEditValues((current) => ({
                                ...current,
                                category: event.target.value,
                              }))
                            }
                            value={editValues.category}
                          />
                          <select
                            className="min-h-10 rounded-md border border-blue-100 px-3 text-sm capitalize"
                            onChange={(event) =>
                              setEditValues((current) => ({
                                ...current,
                                sourceType: event.target.value as SourceType,
                              }))
                            }
                            value={editValues.sourceType}
                          >
                            {sourceTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                          <select
                            className="min-h-10 rounded-md border border-blue-100 px-3 text-sm"
                            disabled={Boolean(verticalSlug)}
                            onChange={(event) =>
                              setEditValues((current) => ({
                                ...current,
                                verticalId: event.target.value,
                                verticalSlug:
                                  verticals.find(
                                    (vertical) =>
                                      verticalDatabaseId(vertical) ===
                                      event.target.value,
                                  )?.slug ?? current.verticalSlug,
                              }))
                            }
                            value={editValues.verticalId}
                          >
                            {verticals.map((vertical) => (
                              <option key={vertical.slug} value={verticalDatabaseId(vertical)}>
                                {vertical.name}
                              </option>
                            ))}
                          </select>
                          <label className="flex min-h-10 items-center gap-2 rounded-md border border-blue-100 bg-white px-3 text-sm font-bold text-blue-950">
                            <input
                              checked={editValues.enabled}
                              onChange={(event) =>
                                setEditValues((current) => ({
                                  ...current,
                                  enabled: event.target.checked,
                                }))
                              }
                              type="checkbox"
                            />
                            Enabled
                          </label>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white"
                            onClick={() => saveSource(source)}
                            type="button"
                          >
                            Save Source
                          </button>
                          <button
                            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                            onClick={() => setEditingSourceId(null)}
                            type="button"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-2xl font-bold text-slate-950">
            Coverage Insights
          </h2>
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold text-slate-700">
              Top contributing sources:{" "}
              {scopedMetrics.topContributors.map((source) => source.name).join(", ") || "None"}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Sources with no activity in 7 days:{" "}
              {scopedMetrics.noActivitySevenDays.map((source) => source.name).join(", ") || "None"}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Recently added sources:{" "}
              {scopedMetrics.recentlyAddedSources.map((source) => source.name).join(", ") || "None"}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Potential gaps: review disabled, offline, and zero-article sources.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-2xl font-bold text-slate-950">
            Feeds Returning Zero Articles
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {scopedMetrics.zeroArticleSources.length ? (
              scopedMetrics.zeroArticleSources.map((source) => (
                <span
                  className="rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700"
                  key={source.id}
                >
                  {source.name}
                </span>
              ))
            ) : (
              <p className="text-sm font-semibold text-slate-600">
                No zero-article feeds identified.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
