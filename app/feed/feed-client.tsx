"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Article } from "@/lib/rss";
import { FooterLinks } from "../footer-links";
import {
  defaultFavourites,
  defaultPreferences,
  FAVOURITES_KEY,
  Favourites,
  frequencyOptions,
  monthlyTimingOptions,
  normalisePreferences,
  normaliseFavourites,
  Preferences,
  STORAGE_KEY,
  weeklyDayOptions,
} from "../preferences";

const scoringKeywords: Record<string, string[]> = {
  Bambu: ["bambu", "x1 carbon", "p1s", "a1 mini", "bambu a1"],
  Prusa: ["prusa", "mk4s", "prusa xl"],
  Creality: ["creality", "k1", "k2 plus"],
  Elegoo: ["elegoo"],
  Anycubic: ["anycubic"],
  Flashforge: ["flashforge"],
  "Maker's Muse": ["maker's muse", "makers muse"],
  "CNC Kitchen": ["cnc kitchen"],
  "3D Printing Nerd": ["3d printing nerd"],
  "Teaching Tech": ["teaching tech"],
  "Thomas Sanladerer": ["thomas sanladerer", "toms3d"],
  "Aurora Tech": ["aurora tech"],
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

const creatorTags: Record<string, string> = {
  "Maker's Muse": "Maker's Muse",
  "CNC Kitchen": "CNC Kitchen",
  "3D Printing Nerd": "3D Printing Nerd",
  "Teaching Tech": "Teaching Tech",
  "Thomas Sanladerer": "Thomas Sanladerer",
  "Aurora Tech": "Aurora Tech",
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

const focusTagAliases: Record<string, string> = {
  "3d models designs": "models",
  "3d models": "models",
  designs: "models",
  design: "models",
  model: "models",
  firmwareupdates: "firmware",
  "firmware updates": "firmware",
  "filament materials": "materials",
  filament: "materials",
  material: "materials",
  "deals discounts": "deals",
  discounts: "deals",
  "tutorials guides": "tutorials",
  guides: "tutorials",
  "fdm fff": "fdm",
  fff: "fdm",
  "sls mjf": "sls",
  mjf: "sls",
  "industrial professional": "industrial",
  professional: "industrial",
  "bambu lab": "bambu",
  "prusa research": "prusa",
  "maker world": "makerworld",
  cults: "cults3d",
  "makers muse": "maker's muse",
};

type ScoredArticle = {
  article: Article;
  generatedTags: string[];
  matchedBecause: string[];
  originalIndex: number;
  score: number;
};

type FocusFilter = {
  label: string;
  tag: string;
};

function MiniHeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-3 w-3"
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M19.5 12.6 12 20l-7.5-7.4A5 5 0 0 1 12 6a5 5 0 0 1 7.5 6.6Z" />
    </svg>
  );
}

function deliverySummary(preferences: Preferences): string {
  const { delivery } = preferences;

  if (delivery.frequency === "weekly") {
    const day =
      weeklyDayOptions.find((option) => option.value === delivery.weeklyDay) ??
      weeklyDayOptions[0];

    return `Weekly on ${day.long}`;
  }

  if (delivery.frequency === "monthly") {
    const timing =
      monthlyTimingOptions.find(
        (option) => option.value === delivery.monthlyTiming,
      ) ?? monthlyTimingOptions[0];

    return timing.summary;
  }

  return "Daily";
}

function FavouriteSection({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  if (!values.length) {
    return null;
  }

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span
            className="inline-flex items-center gap-1.5 rounded-md border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
            key={value}
          >
            <MiniHeartIcon />
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}

function PreferenceSection({
  label,
  values,
  favouriteValues = [],
  activeFocus,
  counts,
  focusable = true,
  onToggleFocus,
}: {
  label: string;
  values: string[];
  favouriteValues?: string[];
  activeFocus: string | null;
  counts: Record<string, number>;
  focusable?: boolean;
  onToggleFocus: (filter: FocusFilter) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {values.length ? (
          values.map((value) => {
            const active = activeFocus === value;
            const favourited = favouriteValues.includes(value);

            return focusable ? (
              <button
                className={[
                  "rounded-md border px-2.5 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                  active
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-blue-100 bg-blue-50 text-blue-800 hover:border-blue-200 hover:bg-white",
                ].join(" ")}
                key={value}
                onClick={() => onToggleFocus({ label: value, tag: value })}
                type="button"
              >
                <span className="inline-flex items-center gap-1.5">
                  {value} {counts[value] ?? 0}
                  {favourited ? (
                    <span className="text-red-600" title="Favourite">
                      <MiniHeartIcon />
                    </span>
                  ) : null}
                </span>
              </button>
            ) : (
              <span
                className="rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800"
                key={value}
              >
                <span className="inline-flex items-center gap-1.5">
                  {value}
                  {favourited ? (
                    <span className="text-red-600" title="Favourite">
                      <MiniHeartIcon />
                    </span>
                  ) : null}
                </span>
              </span>
            );
          })
        ) : (
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-500">
            No selection
          </span>
        )}
      </div>
    </div>
  );
}

function getPublishedTimestamp(value: string): number | null {
  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatDate(value: string): string {
  const timestamp = getPublishedTimestamp(value);

  if (timestamp === null) {
    return "DATE TBC";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(new Date(timestamp))
    .toUpperCase();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function normaliseTag(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/\//g, " ")
    .replace(/[^a-z0-9']+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  return focusTagAliases[normalized] ?? normalized;
}

function generateArticleTags(article: Article): string[] {
  const text = [article.title, article.summary, article.source, ...article.tags]
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
    ...preferences.creators
      .map((creator) => creatorTags[creator])
      .filter((creator): creator is string => Boolean(creator)),
    ...preferences.topics
      .map((topic) => topicTags[topic])
      .filter((topic): topic is string => Boolean(topic)),
    ...preferences.technology
      .map((technology) => technologyTags[technology])
      .filter((technology): technology is string => Boolean(technology)),
  ]);
}

function preferenceFocusFilters(preferences: Preferences): FocusFilter[] {
  return [
    ...preferences.brands.map((brand) => ({
      label: brand,
      tag: brandTags[brand] ?? brand,
    })),
    ...preferences.models.map((model) => ({
      label: model,
      tag: modelTags[model] ?? model,
    })),
    ...preferences.creators.map((creator) => ({
      label: creator,
      tag: creatorTags[creator] ?? creator,
    })),
    ...preferences.topics.map((topic) => ({
      label: topic,
      tag: topicTags[topic] ?? topic,
    })),
    ...preferences.technology.map((technology) => ({
      label: technology,
      tag: technologyTags[technology] ?? technology,
    })),
  ];
}

function matchesFocus(scoredArticle: ScoredArticle, filter: FocusFilter) {
  const filterTag = normaliseTag(filter.tag);

  return scoredArticle.generatedTags.some(
    (tag) => normaliseTag(tag) === filterTag,
  );
}

function scoreArticle(
  article: Article,
  preferences: Preferences,
  originalIndex: number,
): ScoredArticle {
  const generatedTags = generateArticleTags(article);
  const selectedTags = selectedPreferenceTags(preferences);
  const normalizedGeneratedTags = generatedTags.map((tag) => normaliseTag(tag));
  const matchedBecause = selectedTags.filter((tag) =>
    normalizedGeneratedTags.includes(normaliseTag(tag)),
  );

  return {
    article,
    generatedTags,
    matchedBecause,
    originalIndex,
    score: matchedBecause.length,
  };
}

function sortByPublishedDateDesc(a: ScoredArticle, b: ScoredArticle): number {
  const aTimestamp = getPublishedTimestamp(a.article.publishedAt);
  const bTimestamp = getPublishedTimestamp(b.article.publishedAt);

  if (aTimestamp !== null && bTimestamp !== null) {
    return bTimestamp - aTimestamp;
  }

  if (aTimestamp !== null) {
    return -1;
  }

  if (bTimestamp !== null) {
    return 1;
  }

  return a.originalIndex - b.originalIndex;
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
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);
  const [emailFrequency, setEmailFrequency] = useState("Weekly");
  const [activeFocus, setActiveFocus] = useState<FocusFilter | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      const savedFavourites = localStorage.getItem(FAVOURITES_KEY);

      if (savedFavourites) {
        try {
          setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
        } catch {
          setFavourites(defaultFavourites);
        }
      }

      return;
    }

    try {
      setPreferences(normalisePreferences(JSON.parse(saved)));
    } catch {
      setPreferences(defaultPreferences);
    }

    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);

    if (!savedFavourites) {
      return;
    }

    try {
      setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
    } catch {
      setFavourites(defaultFavourites);
    }
  }, []);

  const scoredArticles = useMemo(() => {
    const scored = articles.map((article, index) =>
      scoreArticle(article, preferences, index),
    );

    // Future ranking logic can add favourite/source boosts here, after
    // date ordering remains the default news-feed baseline.
    return scored.sort(sortByPublishedDateDesc);
  }, [articles, preferences]);

  const selectedTags = useMemo(
    () => selectedPreferenceTags(preferences),
    [preferences],
  );
  const hasPreferenceTags = selectedTags.length > 0;
  const requestedStoryCount = Number(preferences.storiesPerUpdate);

  const matchedStories = useMemo(() => {
    const sourceStories = hasPreferenceTags
      ? scoredArticles.filter((article) => article.score > 0)
      : scoredArticles;

    return sourceStories.slice(0, requestedStoryCount);
  }, [hasPreferenceTags, requestedStoryCount, scoredArticles]);

  const focusCounts = useMemo(() => {
    const filters = preferenceFocusFilters(preferences);

    return filters.reduce<Record<string, number>>((counts, filter) => {
      counts[filter.label] = matchedStories.filter((scoredArticle) =>
        matchesFocus(scoredArticle, filter),
      ).length;

      return counts;
    }, {});
  }, [preferences, matchedStories]);

  const focusedStories = useMemo(() => {
    if (!activeFocus) {
      return matchedStories;
    }

    return matchedStories.filter((scoredArticle) =>
      matchesFocus(scoredArticle, activeFocus),
    );
  }, [activeFocus, matchedStories]);

  function toggleFocus(filter: FocusFilter) {
    setActiveFocus((current) =>
      current?.label === filter.label ? null : filter,
    );
  }

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
            Based on your feed preferences, here are the latest stories, videos
            and updates from the brands, creators and platforms you follow.
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
                  activeFocus={activeFocus?.label ?? null}
                  counts={focusCounts}
                  favouriteValues={favourites.brands}
                  label="Brands"
                  onToggleFocus={toggleFocus}
                  values={preferences.brands}
                />
                <PreferenceSection
                  activeFocus={activeFocus?.label ?? null}
                  counts={focusCounts}
                  favouriteValues={favourites.models}
                  label="Model Platforms"
                  onToggleFocus={toggleFocus}
                  values={preferences.models}
                />
                <PreferenceSection
                  activeFocus={activeFocus?.label ?? null}
                  counts={focusCounts}
                  favouriteValues={favourites.creators}
                  label="Creators"
                  onToggleFocus={toggleFocus}
                  values={preferences.creators}
                />
                <PreferenceSection
                  activeFocus={activeFocus?.label ?? null}
                  counts={focusCounts}
                  label="Topics"
                  onToggleFocus={toggleFocus}
                  values={preferences.topics}
                />
                <PreferenceSection
                  activeFocus={activeFocus?.label ?? null}
                  counts={focusCounts}
                  label="Technology"
                  onToggleFocus={toggleFocus}
                  values={preferences.technology}
                />
                <PreferenceSection
                  activeFocus={null}
                  counts={{}}
                  focusable={false}
                  label="Delivery"
                  onToggleFocus={() => undefined}
                  values={[
                    deliverySummary(preferences),
                    `${preferences.storiesPerUpdate} stories`,
                  ]}
                />
                <FavouriteSection
                  label="Favourite Brands"
                  values={favourites.brands}
                />
                <FavouriteSection
                  label="Favourite Platforms"
                  values={favourites.models}
                />
                <FavouriteSection
                  label="Favourite Creators"
                  values={favourites.creators}
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
            {activeFocus ? (
              <div className="flex flex-col gap-3 rounded-lg border border-blue-100 bg-blue-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-lg font-bold text-blue-950">
                  Focused on {activeFocus.label}
                </h2>
                <button
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-800 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  onClick={() => setActiveFocus(null)}
                  type="button"
                >
                  Clear Focus
                </button>
              </div>
            ) : null}
            {activeFocus && focusedStories.length === 0 ? (
              <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
                <h2 className="text-xl font-bold text-slate-950">
                  No stories found for {activeFocus.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Try clearing the focus filter to return to your full
                  personalised feed.
                </p>
                <button
                  className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  onClick={() => setActiveFocus(null)}
                  type="button"
                >
                  Clear Focus
                </button>
              </div>
            ) : null}
            <div>
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">
                    {hasPreferenceTags
                      ? "Matched to your preferences"
                      : "Latest general stories"}
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {focusedStories.length}{" "}
                    {hasPreferenceTags ? "matching stories" : "stories"}
                  </span>
                </div>

                <div className="space-y-4">
                  {focusedStories.map((scoredArticle) => (
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
                        <div className="flex flex-wrap items-center gap-2">
                          {scoredArticle.article.type === "video" ? (
                            <span className="rounded-md bg-blue-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                              Video
                            </span>
                          ) : null}
                          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                            {scoredArticle.article.source.toUpperCase()}{" "}
                            {"\u2022"}{" "}
                            {formatDate(scoredArticle.article.publishedAt)}
                          </p>
                        </div>
                        <a
                          className="text-sm font-bold text-blue-700 hover:text-blue-900"
                          href={scoredArticle.article.link}
                          rel="noreferrer"
                          target="_blank"
                        >
                          {scoredArticle.article.type === "video"
                            ? "Watch on YouTube"
                            : "Read original article"}
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
            <div className="pt-2">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white/90 px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                onClick={() =>
                  window.scrollTo({ top: 0, behavior: "smooth" })
                }
                type="button"
              >
                Back to Top
              </button>
            </div>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
