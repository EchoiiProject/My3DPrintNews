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
}: {
  publicationName?: string;
}) {
  const currentVertical =
    verticalBySlug(currentSite.verticalSlug) ?? verticals[0];
  const displayName = publicationName ?? currentVertical.publicationName ?? currentVertical.name;
  const [selected, setSelected] = useState(feedbackOptions[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    setMessage("");
    setEmail("");
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
            Private to the publication owner
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
              type="submit"
            >
              Send feedback
            </button>
            {submitted ? (
              <p className="text-sm font-semibold text-emerald-700">
                Thanks. This prototype captured your feedback locally for the
                next database-backed sprint.
              </p>
            ) : (
              <p className="text-sm leading-6 text-slate-500">
                This is a prototype form. Database storage will be connected in
                a later sprint.
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}
