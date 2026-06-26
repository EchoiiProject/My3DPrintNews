import Link from "next/link";
import type { ArticleArchiveItem } from "@/lib/articles";
import type { ManagedSource } from "@/lib/sources";
import type { Vertical } from "@/config/verticals";

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ArticleArchiveTable({
  articles,
  currentRecent,
  currentSourceId,
  currentVertical,
  sources,
  verticalLocked = false,
  verticals,
}: {
  articles: ArticleArchiveItem[];
  currentRecent?: string;
  currentSourceId?: string;
  currentVertical?: string;
  sources: ManagedSource[];
  verticalLocked?: boolean;
  verticals: Vertical[];
}) {
  return (
    <div className="space-y-6">
      <form className="grid gap-3 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur md:grid-cols-4">
        <select
          className="min-h-11 rounded-md border border-slate-200 px-3 text-sm"
          defaultValue={currentVertical ?? ""}
          disabled={verticalLocked}
          name="vertical"
        >
          <option value="">All publications</option>
          {verticals.map((vertical) => (
            <option key={vertical.slug} value={vertical.slug}>
              {vertical.name}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 rounded-md border border-slate-200 px-3 text-sm"
          defaultValue={currentSourceId ?? ""}
          name="source"
        >
          <option value="">All sources</option>
          {sources.map((source) => (
            <option key={source.id} value={source.id}>
              {source.name}
            </option>
          ))}
        </select>
        <select
          className="min-h-11 rounded-md border border-slate-200 px-3 text-sm"
          defaultValue={currentRecent ?? ""}
          name="recent"
        >
          <option value="">All dates</option>
          <option value="1">Last 24 hours</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
        </select>
        <button
          className="min-h-11 rounded-md bg-blue-600 px-4 text-sm font-bold text-white"
          type="submit"
        >
          Apply Filters
        </button>
      </form>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Publication</th>
                <th className="px-4 py-3">Tags</th>
                <th className="px-4 py-3">Original</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articles.length ? (
                articles.map((article) => (
                  <tr key={article.id}>
                    <td className="max-w-md px-4 py-3 font-bold text-slate-900">
                      {article.title}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {article.sourceName ?? "Unknown source"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(article.publishedAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {article.verticalName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {article.tags.length ? article.tags.join(", ") : "None"}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        className="font-bold text-blue-700 hover:text-blue-900"
                        href={article.url}
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-6 text-sm font-semibold text-slate-600" colSpan={6}>
                    No archived articles match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
