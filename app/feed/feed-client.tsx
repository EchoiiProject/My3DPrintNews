"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { appConfig } from "../../app.config";
import type { Article } from "@/lib/rss";
import {
  matchesFocus,
  preferenceFocusFilters,
  scoreArticle,
  selectedPreferenceTags,
  type FocusFilter,
  type ScoredArticle,
} from "@/lib/matching";
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
  initialPreferences = defaultPreferences,
  initialFavourites = defaultFavourites,
  readLocalStorage = true,
}: {
  articles: Article[];
  usingFallback: boolean;
  initialPreferences?: Preferences;
  initialFavourites?: Favourites;
  readLocalStorage?: boolean;
}) {
  const [preferences, setPreferences] =
    useState<Preferences>(initialPreferences);
  const [favourites, setFavourites] =
    useState<Favourites>(initialFavourites);
  const [emailFrequency, setEmailFrequency] = useState("Weekly");
  const [newsletterStatus, setNewsletterStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [activeFocus, setActiveFocus] = useState<FocusFilter | null>(null);

  useEffect(() => {
    if (!readLocalStorage) {
      return;
    }

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
  }, [readLocalStorage]);

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

  async function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = formData.get("newsletter-email");

    setNewsletterStatus(null);
    setNewsletterSubmitting(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          preferences,
          favourites,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        savedFeedPath?: string;
      };

      setNewsletterStatus({
        tone: response.ok && result.ok ? "success" : "error",
        message:
          result.message ??
          "Newsletter signup could not be saved right now.",
      });
    } catch {
      setNewsletterStatus({
        tone: "error",
        message: "Newsletter signup could not be saved right now.",
      });
    } finally {
      setNewsletterSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            {appConfig.name}
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
            {appConfig.feedIntro}
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

              <form className="mt-4 space-y-2.5" onSubmit={submitNewsletter}>
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="newsletter-email"
                >
                  Newsletter signup
                </label>
                <input
                  className="min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                  id="newsletter-email"
                  name="newsletter-email"
                  placeholder="you@example.com"
                  required
                  type="email"
                />
                <button
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  disabled={newsletterSubmitting}
                  type="submit"
                >
                  {newsletterSubmitting
                    ? "Saving..."
                    : `Sign up for ${emailFrequency.toLowerCase()} updates`}
                </button>
                {newsletterStatus ? (
                  <p
                    className={[
                      "rounded-md px-3 py-2 text-xs font-semibold leading-5",
                      newsletterStatus.tone === "success"
                        ? "bg-blue-50 text-blue-900"
                        : "bg-red-50 text-red-800",
                    ].join(" ")}
                  >
                    {newsletterStatus.message}
                  </p>
                ) : null}
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
