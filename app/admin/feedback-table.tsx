import {
  feedbackCategoryLabels,
  feedbackStatusLabels,
  type Feedback,
} from "@/config/feedback";
import type { Vertical } from "@/config/verticals";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: Feedback["status"]) {
  if (status === "new") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  if (status === "actioned") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "archived") {
    return "border-slate-200 bg-slate-50 text-slate-500";
  }

  return "border-amber-100 bg-amber-50 text-amber-700";
}

export function FeedbackTable({
  feedbackItems,
  showVertical = false,
  verticalsById,
}: {
  feedbackItems: Feedback[];
  showVertical?: boolean;
  verticalsById: Record<string, Vertical>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
            <tr>
              {showVertical ? (
                <th className="px-4 py-3">Publication</th>
              ) : null}
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {feedbackItems.map((item) => (
              <tr key={item.id}>
                {showVertical ? (
                  <td className="px-4 py-3 font-bold text-slate-800">
                    {verticalsById[item.verticalId]?.name ?? item.verticalId}
                  </td>
                ) : null}
                <td className="px-4 py-3 font-semibold text-slate-700">
                  {feedbackCategoryLabels[item.category]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={[
                      "inline-flex rounded-full border px-2 py-0.5 text-xs font-bold",
                      statusClass(item.status),
                    ].join(" ")}
                  >
                    {feedbackStatusLabels[item.status]}
                  </span>
                </td>
                <td className="max-w-lg px-4 py-3 leading-6 text-slate-600">
                  {item.message}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {item.email ?? "Not provided"}
                </td>
                <td className="px-4 py-3 font-semibold text-slate-500">
                  {formatDate(item.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
