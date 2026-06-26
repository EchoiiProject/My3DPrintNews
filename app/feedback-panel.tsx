"use client";

import { FormEvent, useState } from "react";
import { currentSite } from "@/config/current-site";
import { FeedbackCategory } from "@/config/feedback";
import { verticalBySlug, verticals } from "@/config/verticals";

const feedbackOptions: {
  label: string;
  category: FeedbackCategory;
  rating: number;
}[] = [
  { label: "Love it", category: "praise", rating: 5 },
  { label: "Suggest an idea", category: "feature_request", rating: 4 },
  { label: "Missing a source?", category: "source_request", rating: 4 },
  { label: "Report a problem", category: "bug_report", rating: 2 },
];

export function FeedbackPanel({
  publicationName,
  verticalSlug,
}: {
  publicationName?: string;
  verticalSlug?: string;
}) {
  const currentVertical =
    verticalBySlug(currentSite.verticalSlug) ?? verticals[0];
  const displayName = publicationName ?? currentVertical.publicationName ?? currentVertical.name;
  const feedbackVerticalSlug = verticalSlug ?? currentVertical.slug;
  const [selected, setSelected] = useState(feedbackOptions[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          verticalSlug: feedbackVerticalSlug,
          category: selected.category,
          rating: selected.rating,
          message,
          email,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (response.ok && result.ok) {
        setMessage("");
        setEmail("");
        setStatus({
          tone: "success",
          message:
            result.message ??
            "Thanks - your feedback has been sent to the publication team.",
        });
      } else {
        setStatus({
          tone: "error",
          message:
            result.message ??
            "Feedback could not be sent right now. Please try again.",
        });
      }
    } catch {
      setStatus({
        tone: "error",
        message: "Feedback could not be sent right now. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border-t border-slate-200/80 py-8">
      <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-700">Feedback</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Help improve {displayName}
            </h2>
          </div>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
            Private to the publication team
          </span>
        </div>

        <form className="mt-4 space-y-4" onSubmit={submitFeedback}>
          <div className="flex flex-wrap gap-2">
            {feedbackOptions.map((option) => (
              <button
                className={[
                  "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                  selected.category === option.category
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                ].join(" ")}
                key={option.category}
                onClick={() => setSelected(option)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">Message</span>
              <textarea
                className="mt-1 min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Share a comment, source suggestion, idea, or issue."
                required
                value={message}
              />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Email optional
              </span>
              <input
                className="mt-1 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                type="email"
                value={email}
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Sending..." : "Send feedback"}
            </button>
            <p
              className={[
                "text-sm leading-6",
                status?.tone === "success"
                  ? "font-semibold text-emerald-700"
                  : status?.tone === "error"
                    ? "font-semibold text-red-700"
                    : "text-slate-500",
              ].join(" ")}
            >
              {status?.message ??
                "Thanks - your feedback has been sent to the publication team."}
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
