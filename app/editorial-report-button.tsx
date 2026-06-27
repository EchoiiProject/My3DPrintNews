"use client";

import { FormEvent, useState } from "react";

const reasonOptions = [
  { label: "Not relevant", value: "irrelevant" },
  { label: "Incorrect or misleading", value: "misinformation" },
  { label: "Copyright concern", value: "copyright" },
  { label: "Inappropriate", value: "inappropriate" },
  { label: "Other", value: "other" },
];

export function EditorialReportButton({
  articleId,
  onHide,
  verticalId,
}: {
  articleId?: string | null;
  onHide?: () => void;
  verticalId?: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSubmitting(true);
    setStatus("");

    try {
      const response = await fetch("/api/editorial/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId,
          verticalId,
          email: String(form.get("email") ?? ""),
          notes: String(form.get("notes") ?? ""),
          reason: String(form.get("reason") ?? "other"),
        }),
      });
      const result = (await response.json()) as { message?: string };

      setStatus(
        response.ok
          ? result.message ?? "Thanks. This item has been sent for review."
          : result.message ?? "Report could not be recorded.",
      );

      if (response.ok) setExpanded(false);
      if (response.ok && form.get("alsoHide") === "on") {
        onHide?.();
      }
    } catch {
      setStatus("Report could not be recorded.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
        onClick={() => setExpanded((value) => !value)}
        type="button"
      >
        Report this item
      </button>
      {expanded ? (
        <form
          className="grid max-w-md gap-2 rounded-md border border-slate-200 bg-white p-3"
          onSubmit={submitReport}
        >
          <label className="grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
            Reason
            <select
              className="min-h-10 rounded-md border border-slate-200 px-2 text-sm font-semibold normal-case tracking-normal text-slate-900"
              name="reason"
            >
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <input
            className="min-h-10 rounded-md border border-slate-200 px-2 text-sm"
            name="email"
            placeholder="Email optional"
            type="email"
          />
          <textarea
            className="min-h-20 rounded-md border border-slate-200 px-2 py-2 text-sm"
            name="notes"
            placeholder="Optional note"
          />
          {onHide ? (
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input className="h-4 w-4" name="alsoHide" type="checkbox" />
              Also hide this from my feed
            </label>
          ) : null}
          <button
            className="min-h-10 rounded-md bg-slate-950 px-3 text-sm font-bold text-white disabled:bg-slate-400"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Sending..." : "Send for review"}
          </button>
        </form>
      ) : null}
      {status ? (
        <span className="text-sm font-semibold text-blue-700">{status}</span>
      ) : null}
    </div>
  );
}
