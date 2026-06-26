"use client";

import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import type { ManagedSource, SourceDiagnostics } from "@/lib/sources";
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
};

type FeedDiagnostic = SourceDiagnostics["feedDiagnostics"][number];

type SourceFormState = {
  name: string;
  rssUrl: string;
  category: string;
  verticalId: string;
  verticalSlug: string;
  enabled: boolean;
};

type BulkSourceRow = {
  name: string;
  rssUrl: string;
  category: string;
  enabled: boolean;
  lineNumber: number;
};

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

function coverageLabel(days: number) {
  if (days >= 7) return "healthy";
  if (days >= 3) return "usable";
  if (days >= 1) return "thin coverage";
  return "broken or no content";
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

function parseBulkSourceRows(value: string) {
  const rows: BulkSourceRow[] = [];
  const errors: string[] = [];

  value
    .split(/\r?\n/)
    .map((line, index) => ({ line: line.trim(), lineNumber: index + 1 }))
    .filter(({ line }) => line.length > 0)
    .forEach(({ line, lineNumber }) => {
      const [name = "", rssUrl = "", category = "", enabled = "true"] = line
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
  const [name, setName] = useState("");
  const [rssUrl, setRssUrl] = useState("");
  const [category, setCategory] = useState("");
  const [selectedVertical, setSelectedVertical] = useState(
    verticalSlug ?? verticals[0]?.slug ?? "my3dprintnews",
  );
  const [selectedVerticalId, setSelectedVerticalId] = useState(
    verticals[0] ? verticalDatabaseId(verticals[0]) : "",
  );
  const [enabled, setEnabled] = useState(true);
  const [editingSourceId, setEditingSourceId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<SourceFormState>({
    name: "",
    rssUrl: "",
    category: "",
    verticalId: verticals[0] ? verticalDatabaseId(verticals[0]) : "",
    verticalSlug: verticalSlug ?? verticals[0]?.slug ?? "my3dprintnews",
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
          category,
          vertical_id: selectedVerticalId,
          enabled,
        }),
      },
      "Source added.",
    );
    setName("");
    setRssUrl("");
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
    setFetchingArticles(true);
    setFetchSummary(null);
    setMessage("Fetching articles...");
    const response = await fetch("/api/admin/articles/fetch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        verticalSlug: verticalSlug ?? selectedVertical,
      }),
    });
    const result = (await response.json()) as SourceActionResponse;

    setFetchSummary(result);
    setMessage(result.message);
    setFetchingArticles(false);
    router.refresh();
  }

  const diagnosticBySourceId = new Map(
    diagnostics.feedDiagnostics.map((diagnostic) => [
      diagnostic.sourceId,
      diagnostic,
    ]),
  );
  const selectedPublication =
    verticals.find(
      (vertical) => verticalDatabaseId(vertical) === selectedVerticalId,
    ) ?? verticals.find((vertical) => vertical.slug === selectedVertical);
  const selectedAdminSlug =
    verticalSlug ?? selectedPublication?.slug ?? selectedVertical;
  const selectedPublicSlug = selectedPublication
    ? publicationSlugForVertical(selectedPublication)
    : selectedAdminSlug;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "News Health",
            value: `${diagnostics.newsHealthScore}%`,
            detail: diagnostics.newsHealthLabel,
          },
          {
            label: "Sources",
            value: diagnostics.totalConfiguredSources,
            detail: `${diagnostics.enabledSources} enabled | ${diagnostics.disabledSources} disabled | ${diagnostics.healthySources} healthy`,
          },
          {
            label: "Content Coverage",
            value: diagnostics.totalArticlesCollected,
            detail: `${formatDate(diagnostics.oldestArticle)} to ${formatDate(diagnostics.newestArticle)} | ${diagnostics.daysOfNewsCoverage} days`,
          },
          {
            label: "Attention",
            value:
              diagnostics.offlineSources +
              diagnostics.sourcesWithNoRecentArticles +
              diagnostics.zeroArticleSources.length,
            detail: `${diagnostics.offlineSources} offline | ${diagnostics.sourcesWithNoRecentArticles} stale | ${diagnostics.zeroArticleSources.length} zero articles`,
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
            {diagnostics.daysOfNewsCoverage} days
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {coverageLabel(diagnostics.daysOfNewsCoverage)}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Publication Readiness
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {diagnostics.verticalReadiness}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {diagnostics.newsHealthLabel} health at {diagnostics.newsHealthScore}%
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div>
          <p className="text-sm font-bold text-slate-950">
            Live RSS diagnostics
          </p>
          <p className="text-sm font-semibold text-slate-600">
            {diagnostics.feedDiagnostics.length
              ? `Last checked ${formatDate(diagnostics.feedDiagnostics[0].lastCheckedAt)}`
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
        <div className="mt-4 grid gap-3 lg:grid-cols-6">
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
              Paste one source per line: name,rss_url,category,enabled
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
          placeholder="BMX Union,https://bmxunion.com/feed/,News,true"
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
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">RSS URL</th>
                <th className="px-4 py-3">Publication</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">State</th>
                <th className="px-4 py-3">Health</th>
                <th className="px-4 py-3">Fetch</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sources.map((source) => {
                const diagnostic =
                  diagnosticBySourceId.get(source.id) ??
                  fallbackDiagnostic(source);
                const warnings = sourceWarnings(source, diagnostic);

                return (
                  <Fragment key={source.id}>
                  <tr
                    className={warnings.length ? "bg-amber-50/45" : undefined}
                  >
                    <td className="px-4 py-3 font-bold text-slate-900">
                      <p>{source.name}</p>
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
                    <td className="max-w-xs truncate px-4 py-3 text-slate-600">
                      {source.rssUrl || "Missing"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {source.verticalName}
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
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>
                        {diagnostic.reachable ? "Reachable" : "Failed"}
                      </p>
                      {diagnostic.statusCode ? (
                        <p className="text-xs">HTTP {diagnostic.statusCode}</p>
                      ) : null}
                      <p className="text-xs">
                        Latest: {formatDate(diagnostic.latestArticleDate)}
                      </p>
                      <p className="text-xs">
                        Oldest: {formatDate(diagnostic.oldestArticleDate)}
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
                    <td className="px-4 py-3">
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
                        <div className="grid gap-3 lg:grid-cols-6">
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
              {diagnostics.topContributors.map((source) => source.name).join(", ") || "None"}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Sources with no activity in 7 days:{" "}
              {diagnostics.noActivitySevenDays.map((source) => source.name).join(", ") || "None"}
            </p>
            <p className="text-sm font-semibold text-slate-700">
              Recently added sources:{" "}
              {diagnostics.recentlyAddedSources.map((source) => source.name).join(", ") || "None"}
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
            {diagnostics.zeroArticleSources.length ? (
              diagnostics.zeroArticleSources.map((source) => (
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
