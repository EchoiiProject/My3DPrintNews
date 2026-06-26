"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ManagedSource, SourceDiagnostics } from "@/lib/sources";
import type { Vertical } from "@/config/verticals";

type SourceActionResponse = {
  ok: boolean;
  message: string;
  errors?: Record<string, string>;
};

function formatDate(value: string | null): string {
  if (!value) return "No data";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function healthClass(status: ManagedSource["healthStatus"]) {
  if (status === "healthy") return "border-emerald-100 bg-emerald-50 text-emerald-700";
  if (status === "offline") return "border-red-100 bg-red-50 text-red-700";
  return "border-amber-100 bg-amber-50 text-amber-700";
}

function coverageLabel(days: number) {
  if (days >= 7) return "healthy";
  if (days >= 3) return "usable";
  if (days >= 1) return "thin coverage";
  return "broken or no content";
}

function sourceWarnings(source: ManagedSource) {
  const warnings: string[] = [];
  const stale =
    !source.lastArticleDate ||
    new Date(source.lastArticleDate).getTime() <
      Date.now() - 7 * 24 * 60 * 60 * 1000;

  if (!source.rssUrl) warnings.push("No RSS URL");
  if (source.healthStatus === "offline") warnings.push("Unreachable feed");
  if (source.articlesFetched === 0) warnings.push("Zero articles");
  if (stale) warnings.push("Stale feed");
  if (!source.enabled) warnings.push("Disabled source");

  return warnings;
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
  const [message, setMessage] = useState("");
  const [testingSourceId, setTestingSourceId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, string>>({});

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
          rssUrl,
          category,
          verticalSlug: selectedVertical,
        }),
      },
      "Source added.",
    );
    setName("");
    setRssUrl("");
    setCategory("");
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

  async function editSource(source: ManagedSource) {
    const nextName = window.prompt("Source name", source.name);
    if (!nextName) return;
    const nextUrl = window.prompt("RSS URL", source.rssUrl);
    if (!nextUrl) return;

    await sourceRequest(
      `/api/admin/sources/${source.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nextName,
          rssUrl: nextUrl,
          category: source.category,
        }),
      },
      "Source updated.",
    );
  }

  async function deleteSource(source: ManagedSource) {
    if (!window.confirm(`Delete ${source.name}?`)) return;

    await sourceRequest(
      `/api/admin/sources/${source.id}`,
      { method: "DELETE" },
      "Source deleted.",
    );
  }

  function testFeed(source: ManagedSource) {
    setTestingSourceId(source.id);
    const reachable = source.enabled && source.healthStatus !== "offline";
    const result = reachable
      ? [
          "Feed reachable",
          `Items returned: ${source.articlesFetched}`,
          `Latest article date: ${formatDate(source.lastArticleDate)}`,
        ].join(" | ")
      : "Errors: feed unavailable or disabled";

    window.setTimeout(() => {
      setTestResults((current) => ({ ...current, [source.id]: result }));
      setTestingSourceId(null);
    }, 250);
  }

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
            Vertical Readiness
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {diagnostics.verticalReadiness}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            {diagnostics.newsHealthLabel} health at {diagnostics.newsHealthScore}%
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-5">
        <h2 className="text-2xl font-bold text-blue-950">Add Source</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-5">
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
            onChange={(event) => setSelectedVertical(event.target.value)}
            value={selectedVertical}
          >
            {verticals.map((vertical) => (
              <option key={vertical.slug} value={vertical.slug}>
                {vertical.name}
              </option>
            ))}
          </select>
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

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">RSS URL</th>
                <th className="px-4 py-3">Vertical</th>
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
                const warnings = sourceWarnings(source);

                return (
                  <tr
                    className={warnings.length ? "bg-amber-50/45" : undefined}
                    key={source.id}
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
                          healthClass(source.healthStatus),
                        ].join(" ")}
                      >
                        {source.healthStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <p>{formatDate(source.lastSuccessfulFetch)}</p>
                      <p className="text-xs">
                        Last article: {formatDate(source.lastArticleDate)}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {source.articlesFetched}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-md border px-2 py-1 text-xs font-bold" onClick={() => editSource(source)} type="button">Edit</button>
                        <button className="rounded-md border px-2 py-1 text-xs font-bold" onClick={() => toggleSource(source)} type="button">{source.enabled ? "Disable" : "Enable"}</button>
                        <button className="rounded-md border border-red-100 px-2 py-1 text-xs font-bold text-red-700" onClick={() => deleteSource(source)} type="button">Delete</button>
                        <button className="rounded-md border border-blue-100 px-2 py-1 text-xs font-bold text-blue-700" onClick={() => testFeed(source)} type="button">Test Feed</button>
                      </div>
                      {testResults[source.id] || testingSourceId === source.id ? (
                        <p className="mt-2 text-xs font-semibold text-slate-600">
                          {testingSourceId === source.id ? "Testing..." : testResults[source.id]}
                        </p>
                      ) : null}
                    </td>
                  </tr>
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
