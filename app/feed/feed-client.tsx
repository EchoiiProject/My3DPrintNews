"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Article } from "@/lib/rss";
import {
  defaultPreferences,
  frequencyOptions,
  normalisePreferences,
  Preferences,
  STORAGE_KEY,
} from "../preferences";

function PreferenceSection({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {values.map((value) => (
          <span
            className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-800"
            key={value}
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function articleMatchesPreferences(article: Article, preferences: Preferences) {
  const text = [article.title, article.summary, article.source, ...article.tags]
    .join(" ")
    .toLowerCase();
  const printerMatch = preferences.printers.some((printer) =>
    text.includes(printer.toLowerCase().replace("bambu ", "").replace("prusa ", "")),
  );
  const sourceMatch = preferences.sources.some((source) =>
    text.includes(source.toLowerCase()),
  );
  const topicMatch = preferences.topics.some((topic) =>
    article.tags.includes(topic.replace("Firmware Updates", "Firmware")),
  );
  const technologyMatch = preferences.technology.some((technology) =>
    article.tags.includes(technology.split(" ")[0]),
  );

  return printerMatch || sourceMatch || topicMatch || technologyMatch;
}

export function FeedClient({
  articles,
  usingFallback,
}: {
  articles: Article[];
  usingFallback: boolean;
}) {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [emailFrequency, setEmailFrequency] = useState("Weekly");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      setPreferences(normalisePreferences(JSON.parse(saved)));
    } catch {
      setPreferences(defaultPreferences);
    }
  }, []);

  const feedSummary = useMemo(() => {
    return [
      `${preferences.printers.join(", ")} printer coverage`,
      `${preferences.sources.join(", ")} source monitoring`,
      `${preferences.topics.join(", ")} topics`,
    ].join(" with ");
  }, [preferences]);

  const personalisedArticles = useMemo(() => {
    const matched = articles.filter((article) =>
      articleMatchesPreferences(article, preferences),
    );

    return (matched.length ? matched : articles).slice(
      0,
      Number(preferences.storiesPerUpdate),
    );
  }, [articles, preferences]);

  const groupedArticles = useMemo(() => {
    return personalisedArticles.reduce<Record<string, Article[]>>(
      (groups, article) => {
        const groupName = articleMatchesPreferences(article, preferences)
          ? "Matched to your preferences"
          : "Latest general stories";

        groups[groupName] = [...(groups[groupName] ?? []), article];
        return groups;
      },
      {},
    );
  }, [personalisedArticles, preferences]);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            My3DPrintNews
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
            <Link className="hover:text-blue-700" href="/">
              Preferences
            </Link>
            <Link className="hover:text-blue-700" href="/publishers">
              Publishers
            </Link>
          </div>
        </nav>

        <header className="py-12 sm:py-16">
          <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            {usingFallback ? "Placeholder briefing" : "Live RSS briefing"}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Your Personalised Feed
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Stories are organised around {feedSummary}. Every card keeps source
            attribution visible and links back to the original publisher.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <aside className="space-y-5">
            <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <div className="mb-5 border-b border-slate-100 pb-4">
                <p className="text-sm font-semibold text-blue-700">
                  Selected Preferences
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Your signal
                </h2>
              </div>

              <div className="space-y-5">
                <PreferenceSection
                  label="Printers"
                  values={preferences.printers}
                />
                <PreferenceSection
                  label="Sources"
                  values={preferences.sources}
                />
                <PreferenceSection label="Topics" values={preferences.topics} />
                <PreferenceSection
                  label="Technology"
                  values={preferences.technology}
                />
                <PreferenceSection
                  label="Delivery"
                  values={[
                    preferences.frequency,
                    `${preferences.storiesPerUpdate} stories`,
                  ]}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-semibold text-blue-700">
                Get email updates
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Newsletter cadence
              </h2>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {frequencyOptions.map((option) => (
                  <button
                    className={[
                      "min-h-11 rounded-md border px-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-blue-100",
                      emailFrequency === option
                        ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
                    ].join(" ")}
                    key={option}
                    onClick={() => setEmailFrequency(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <form className="mt-5 space-y-3">
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="newsletter-email"
                >
                  Newsletter signup
                </label>
                <input
                  className="min-h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  id="newsletter-email"
                  placeholder="you@example.com"
                  type="email"
                />
                <button
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
                  type="button"
                >
                  Sign up for {emailFrequency.toLowerCase()} updates
                </button>
                <p className="text-sm leading-6 text-slate-500">
                  UI only for now. Backend delivery and subscription management
                  will be wired in a later sprint.
                </p>
              </form>
            </section>
          </aside>

          <section className="space-y-6" aria-label="Personalised stories">
            {Object.entries(groupedArticles).map(([category, stories]) => (
              <div key={category}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">
                    {category}
                  </h2>
                  <span className="rounded-md bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-wide text-blue-700">
                    {stories.length} stories
                  </span>
                </div>

                <div className="space-y-4">
                  {stories.map((article) => (
                    <article
                      className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/40"
                      key={`${article.source}-${article.link}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          {article.source} / {formatDate(article.publishedAt)}
                        </p>
                        <a
                          className="text-sm font-bold text-blue-700 hover:text-blue-900"
                          href={article.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Read original article
                        </a>
                      </div>
                      <h3 className="mt-3 text-2xl font-bold leading-8 text-slate-950">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {article.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(article.tags.length ? article.tags : ["General"]).map(
                          (tag) => (
                            <span
                              className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                              key={tag}
                            >
                              {tag}
                            </span>
                          ),
                        )}
                      </div>
                      <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
                        Publisher attribution: {article.source}. Summary and
                        metadata are attributed to the source above.
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
