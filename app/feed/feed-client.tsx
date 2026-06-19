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

const scoringKeywords: Record<string, string[]> = {
  Bambu: ["bambu", "x1 carbon", "p1s", "a1 mini", "bambu a1"],
  Prusa: ["prusa", "mk4s", "prusa xl"],
  Creality: ["creality", "k1", "k2 plus"],
  Elegoo: ["elegoo"],
  Anycubic: ["anycubic"],
  Flashforge: ["flashforge"],
  "New Printers": ["new printer", "launch", "announces", "released", "debut"],
  Reviews: ["review", "reviews", "tested", "hands-on", "benchmark"],
  Firmware: ["firmware", "software update", "input shaping"],
  Models: ["model", "models", "design", "printables", "makerworld"],
  Printables: ["printables"],
  MakerWorld: ["makerworld", "maker world"],
  Thingiverse: ["thingiverse"],
  Thangs: ["thangs"],
  Cults3D: ["cults3d", "cults"],
  Materials: ["material", "materials", "filament", "pla", "petg", "nylon"],
  Accessories: ["accessory", "accessories", "upgrade", "hotend", "build plate"],
  Deals: ["deal", "deals", "discount", "sale", "bundle", "coupon"],
  Tutorials: ["tutorial", "tutorials", "guide", "how to", "calibration"],
  FDM: ["fdm", "fff", "filament"],
  Resin: ["resin", "sla", "msla", "dlp"],
  SLS: ["sls", "mjf", "powder bed"],
  Industrial: ["industrial", "professional", "production", "service bureau"],
};

const brandTags: Record<string, string> = {
  "Bambu Lab": "Bambu",
  "Prusa Research": "Prusa",
  Creality: "Creality",
  Elegoo: "Elegoo",
  Anycubic: "Anycubic",
  Flashforge: "Flashforge",
};

const modelTags: Record<string, string> = {
  Printables: "Printables",
  MakerWorld: "MakerWorld",
  Thingiverse: "Thingiverse",
  Thangs: "Thangs",
  Cults3D: "Cults3D",
};

const topicTags: Record<string, string> = {
  "New Printers": "New Printers",
  Reviews: "Reviews",
  "Firmware Updates": "Firmware",
  "3D Models / Designs": "Models",
  "Filament & Materials": "Materials",
  Accessories: "Accessories",
  "Deals & Discounts": "Deals",
  "Tutorials & Guides": "Tutorials",
};

const technologyTags: Record<string, string> = {
  "FDM / FFF": "FDM",
  Resin: "Resin",
  "SLS / MJF": "SLS",
  "Industrial / Professional": "Industrial",
};

type ScoredArticle = {
  article: Article;
  generatedTags: string[];
  matchedBecause: string[];
  score: number;
};

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
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.length ? (
          values.map((value) => (
            <span
              className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800"
              key={value}
            >
              {value}
            </span>
          ))
        ) : (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            No selection
          </span>
        )}
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

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function generateArticleTags(article: Article): string[] {
  const text = [article.title, article.summary, ...article.tags]
    .join(" ")
    .toLowerCase();

  return unique([
    ...article.tags,
    ...Object.entries(scoringKeywords)
      .filter(([, keywords]) =>
        keywords.some((keyword) => text.includes(keyword)),
      )
      .map(([tag]) => tag),
  ]);
}

function selectedPreferenceTags(preferences: Preferences): string[] {
  return unique([
    ...preferences.brands
      .map((brand) => brandTags[brand])
      .filter((brand): brand is string => Boolean(brand)),
    ...preferences.models
      .map((model) => modelTags[model])
      .filter((model): model is string => Boolean(model)),
    ...preferences.topics
      .map((topic) => topicTags[topic])
      .filter((topic): topic is string => Boolean(topic)),
    ...preferences.technology
      .map((technology) => technologyTags[technology])
      .filter((technology): technology is string => Boolean(technology)),
  ]);
}

function scoreArticle(
  article: Article,
  preferences: Preferences,
): ScoredArticle {
  const generatedTags = generateArticleTags(article);
  const selectedTags = selectedPreferenceTags(preferences);
  const matchedBecause = selectedTags.filter((tag) =>
    generatedTags.includes(tag),
  );

  return {
    article,
    generatedTags,
    matchedBecause,
    score: matchedBecause.length,
  };
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
    const parts = [
      preferences.brands.length
        ? `${preferences.brands.join(", ")} brand coverage`
        : "",
      preferences.models.length
        ? `${preferences.models.join(", ")} model monitoring`
        : "",
      preferences.topics.length ? `${preferences.topics.join(", ")} topics` : "",
      preferences.technology.length
        ? `${preferences.technology.join(", ")} technology`
        : "",
    ].filter(Boolean);

    return parts.length ? parts.join(" with ") : "the latest general stories";
  }, [preferences]);

  const scoredArticles = useMemo(() => {
    const scored = articles.map((article) => scoreArticle(article, preferences));
    const matched = scored.filter((article) => article.score > 0);
    const sorted = (matched.length ? matched : scored).sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return (
        new Date(b.article.publishedAt).getTime() -
        new Date(a.article.publishedAt).getTime()
      );
    });

    return sorted.slice(0, Number(preferences.storiesPerUpdate));
  }, [articles, preferences]);

  const groupedArticles = useMemo(() => {
    return scoredArticles.reduce<Record<string, ScoredArticle[]>>(
      (groups, scoredArticle) => {
        const groupName = scoredArticle.score > 0
          ? "Matched to your preferences"
          : "Latest general stories";

        groups[groupName] = [...(groups[groupName] ?? []), scoredArticle];
        return groups;
      },
      {},
    );
  }, [scoredArticles]);

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
            <Link className="hover:text-blue-700" href="/contact">
              Contact
            </Link>
            <Link className="hover:text-blue-700" href="/publishers">
              Publishers
            </Link>
          </div>
        </nav>

        <header className="py-9 sm:py-12">
          <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            {usingFallback ? "Placeholder briefing" : "Live RSS briefing"}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Your Personalised Feed
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Stories are organised around {feedSummary}. Every card keeps source
            attribution visible and links back to the original publisher.
          </p>
          <div className="mt-5">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              href="/"
            >
              Edit my feed
            </Link>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4">
            <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur">
              <div className="mb-4 border-b border-slate-100 pb-3">
                <p className="text-sm font-semibold text-blue-700">
                  Selected Preferences
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Your signal
                </h2>
              </div>

              <div className="space-y-3">
                <PreferenceSection
                  label="Brands"
                  values={preferences.brands}
                />
                <PreferenceSection
                  label="Models"
                  values={preferences.models}
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

            <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-semibold text-blue-700">
                Get email updates
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Get personalised updates
              </h2>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {frequencyOptions.map((option) => (
                  <button
                    className={[
                      "min-h-10 rounded-md border px-2.5 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
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

              <form className="mt-4 space-y-2.5">
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="newsletter-email"
                >
                  Newsletter signup
                </label>
                <input
                  className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                  id="newsletter-email"
                  placeholder="you@example.com"
                  type="email"
                />
                <button
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  type="button"
                >
                  Sign up for {emailFrequency.toLowerCase()} updates
                </button>
                <p className="text-xs leading-5 text-slate-500">
                  UI only for now. Backend delivery and subscription management
                  will be wired in a later sprint.
                </p>
              </form>
            </section>
          </aside>

          <section className="space-y-5" aria-label="Personalised stories">
            {Object.entries(groupedArticles).map(([category, stories]) => (
              <div key={category}>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">
                    {category}
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {stories.length} stories
                  </span>
                </div>

                <div className="space-y-4">
                  {stories.map((scoredArticle) => (
                    <article
                      className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/40 sm:p-5"
                      key={`${scoredArticle.article.source}-${scoredArticle.article.link}`}
                    >
                      {scoredArticle.article.imageUrl ? (
                        <div className="mb-4 aspect-video overflow-hidden rounded-md border border-slate-100 bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={scoredArticle.article.title}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            src={scoredArticle.article.imageUrl}
                          />
                        </div>
                      ) : null}
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          {scoredArticle.article.source} /{" "}
                          {formatDate(scoredArticle.article.publishedAt)}
                        </p>
                        <a
                          className="text-sm font-bold text-blue-700 hover:text-blue-900"
                          href={scoredArticle.article.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Read original article
                        </a>
                      </div>
                      <h3 className="mt-3 text-2xl font-bold leading-8 text-slate-950">
                        {scoredArticle.article.title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {scoredArticle.article.summary}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(scoredArticle.generatedTags.length
                          ? scoredArticle.generatedTags
                          : ["General"]
                        ).map((tag) => (
                          <span
                            className="rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-3">
                        <p className="text-sm font-bold text-blue-950">
                          Matched because:
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(scoredArticle.matchedBecause.length
                            ? scoredArticle.matchedBecause
                            : ["Latest general story"]
                          ).map((reason) => (
                            <span
                              className="text-sm font-semibold text-blue-900"
                              key={reason}
                            >
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="mt-4 rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
                        Publisher attribution: {scoredArticle.article.source}.
                        Summary and metadata are attributed to the source above.
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
