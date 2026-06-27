"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { currentSite } from "../../config/current-site";
import type { Article } from "@/lib/rss";
import { displayMediaLabel } from "@/lib/media-types";
import {
  matchesFocus,
  preferenceFocusFilters,
  type ScoredArticle,
  type FocusFilter,
} from "@/lib/matching";
import {
  getPublishedTimestamp,
  hasPersonalisedSignal,
  rankFeedArticles,
} from "@/lib/ranking";
import { FooterLinks } from "../footer-links";
import { ActionLinks, GlobalNav } from "../global-nav";
import { DiscoverMorePanel } from "../discover-more-components";
import { EditorialReportButton } from "../editorial-report-button";
import { FeedbackPanel } from "../feedback-panel";
import {
  defaultFavourites,
  defaultPreferences,
  FAVOURITES_KEY,
  DeliveryFrequency,
  Favourites,
  frequencyOptions,
  monthlyTimingOptions,
  normalisePreferences,
  normaliseFavourites,
  Preferences,
  STORAGE_KEY,
  toggleFavourite,
  weeklyDayOptions,
} from "../preferences";
import { AdPlacement } from "../ad-placement";
import { MyNewsNetworkEmailDialog } from "../components/my-news-network-dialog";

const appConfig = currentSite.metadata;
const SAVED_ITEMS_KEY = "mynewsnetwork-saved-items";
const READER_EMAIL_KEY = "mynewsnetwork-reader-email";
const HIDDEN_ITEMS_KEY = "mynewsnetwork-hidden-items";
const HIDDEN_SOURCES_KEY = "mynewsnetwork-hidden-sources";

type SavedArticle = {
  articleId?: string;
  publicationId?: string;
  publicationName?: string;
  title: string;
  source: string;
  url: string;
  summary?: string;
  imageUrl?: string;
  savedAt: string;
};

type HiddenSourcePreference = {
  mutedUntil?: string | null;
  sourceId: string;
  sourceName: string;
  verticalId?: string;
};

function savedArticleKey(article: Article) {
  return `${article.source}:${article.link}`;
}

function hiddenArticleKey(article: Article) {
  return article.id ?? article.link;
}

function savedArticles(): SavedArticle[] {
  try {
    const value = localStorage.getItem(SAVED_ITEMS_KEY);

    return value ? (JSON.parse(value) as SavedArticle[]) : [];
  } catch {
    return [];
  }
}

function hiddenArticleKeys(): string[] {
  try {
    const value = localStorage.getItem(HIDDEN_ITEMS_KEY);

    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function hiddenSources(): HiddenSourcePreference[] {
  try {
    const value = localStorage.getItem(HIDDEN_SOURCES_KEY);

    return value ? (JSON.parse(value) as HiddenSourcePreference[]) : [];
  } catch {
    return [];
  }
}

function activeHiddenSources(): HiddenSourcePreference[] {
  const now = Date.now();

  return hiddenSources().filter((source) => {
    if (!source.mutedUntil) return true;

    const mutedUntil = new Date(source.mutedUntil).getTime();

    return Number.isFinite(mutedUntil) && mutedUntil > now;
  });
}

function activeHiddenSourceIds(): string[] {
  return activeHiddenSources().map((source) => source.sourceId);
}

async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
  }
}

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

function SourceHeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
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

function frequencyValue(option: string): DeliveryFrequency {
  return option.toLowerCase() as DeliveryFrequency;
}

function newsletterPreferences(
  preferences: Preferences,
  emailFrequency: string,
): Preferences {
  const frequency = frequencyValue(emailFrequency);

  return {
    ...preferences,
    frequency: emailFrequency,
    delivery: {
      ...preferences.delivery,
      frequency,
    },
  };
}

function hasSignupSignal(
  preferences: Preferences,
  favourites: Favourites,
): boolean {
  return [
    preferences.brands,
    preferences.models,
    preferences.creators,
    preferences.sources,
    preferences.topics,
    preferences.technology,
    favourites.brands,
    favourites.modelPlatforms,
    favourites.creators,
    favourites.sources,
  ].some((values) => values.length > 0);
}

function SummaryList({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
        {values.length ? values.join(", ") : "No selection"}
      </p>
    </div>
  );
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

function storyBadge(article: Article): string {
  return displayMediaLabel({
    sourceType: article.type === "video" ? "youtube" : undefined,
    tags: article.tags,
    source: article.source,
  });
}

export function FeedStoryCards({
  displayMode = "standard",
  favourites,
  onToggleSourceFavourite,
  publicationId,
  publicationName = "MyNewsNetwork",
  publicationSlug,
  publicationUrl,
  showFeedAds = true,
  stories,
}: {
  displayMode?: "compact" | "standard" | "visual";
  favourites: Favourites;
  onToggleSourceFavourite: (source: string) => void;
  publicationId?: string;
  publicationName?: string;
  publicationSlug?: string;
  publicationUrl?: string;
  showFeedAds?: boolean;
  stories: ScoredArticle[];
}) {
  const isCompact = displayMode === "compact";
  const isVisual = displayMode === "visual";
  const [savedKeys, setSavedKeys] = useState<string[]>([]);
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [hiddenSourceIds, setHiddenSourceIds] = useState<string[]>([]);
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [emailArticleRequest, setEmailArticleRequest] =
    useState<Article | null>(null);
  const [readerEmail, setReaderEmail] = useState("");
  const [sourceMenuArticleKey, setSourceMenuArticleKey] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setReaderEmail(localStorage.getItem(READER_EMAIL_KEY) ?? "");
    setSavedKeys(savedArticles().map((article) => article.url));
    setHiddenKeys(hiddenArticleKeys());
    setHiddenSourceIds(activeHiddenSourceIds());

    function handleSourcePreferencesChanged() {
      setHiddenSourceIds(activeHiddenSourceIds());
    }

    window.addEventListener(
      "mynewsnetwork:source-preferences-changed",
      handleSourcePreferencesChanged,
    );

    return () => {
      window.removeEventListener(
        "mynewsnetwork:source-preferences-changed",
        handleSourcePreferencesChanged,
      );
    };
  }, []);

  function setStatus(article: Article, message: string) {
    setActionStatus((current) => ({
      ...current,
      [savedArticleKey(article)]: message,
    }));
  }

  async function syncSavedArticle(article: Article, action: "save" | "unsave") {
    const email = localStorage.getItem(READER_EMAIL_KEY);

    if (!email || !article.id) return;

    try {
      await fetch("/api/reader-actions/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          articleId: article.id,
          verticalId: publicationId,
          action,
        }),
      });
    } catch {
      // Local save remains the reader-facing source until account sync exists.
    }
  }

  async function syncHiddenArticle(article: Article) {
    const email = localStorage.getItem(READER_EMAIL_KEY);

    if (!email || !article.id) return;

    try {
      await fetch("/api/reader-actions/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleId: article.id,
          email,
          verticalId: publicationId,
        }),
      });
    } catch {
      // Local hide is enough for anonymous/current-browser filtering.
    }
  }

  async function syncUnhiddenArticle(article: Article): Promise<boolean> {
    const email = localStorage.getItem(READER_EMAIL_KEY);

    if (!email || !article.id) return true;

    try {
      const response = await fetch("/api/reader-actions/hide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unhide",
          articleId: article.id,
          email,
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  async function syncHiddenSource(
    article: Article,
    mutedUntil?: string | null,
  ): Promise<boolean> {
    const email = localStorage.getItem(READER_EMAIL_KEY);

    if (!email || !article.sourceId) return true;

    try {
      const response = await fetch("/api/reader-actions/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mutedUntil,
          reason: mutedUntil ? "reader_mute" : "reader_hide",
          sourceId: article.sourceId,
          verticalId: publicationId,
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  function hideArticle(article: Article) {
    const key = hiddenArticleKey(article);
    const next = Array.from(new Set([...hiddenArticleKeys(), key]));

    localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify(next));
    setHiddenKeys(next);
    setStatus(article, "Hidden from your feed.");
    void syncHiddenArticle(article);
  }

  function undoHideArticle(article: Article) {
    const key = hiddenArticleKey(article);
    const next = hiddenArticleKeys().filter((item) => item !== key);

    localStorage.setItem(HIDDEN_ITEMS_KEY, JSON.stringify(next));
    setHiddenKeys(next);
    setStatus(article, "Restored to your feed.");
    void syncUnhiddenArticle(article).then((ok) => {
      if (!ok) {
        setStatus(
          article,
          "Restored here. We could not update your saved preference yet.",
        );
      }
    });
  }

  function hideSource(article: Article, days?: number) {
    if (!article.sourceId) {
      setStatus(article, "Source controls need an archived source record.");
      return;
    }

    const mutedUntil = days
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const next = [
      ...hiddenSources().filter((source) => source.sourceId !== article.sourceId),
      {
        mutedUntil,
        sourceId: article.sourceId,
        sourceName: article.source,
        verticalId: publicationId,
      },
    ];

    localStorage.setItem(HIDDEN_SOURCES_KEY, JSON.stringify(next));
    setHiddenSourceIds(activeHiddenSourceIds());
    window.dispatchEvent(
      new CustomEvent("mynewsnetwork:source-preferences-changed"),
    );
    setSourceMenuArticleKey(null);
    setStatus(
      article,
      days
        ? `Muted ${article.source} for ${days} days.`
        : `Hidden ${article.source}.`,
    );
    void syncHiddenSource(article, mutedUntil).then((ok) => {
      if (!ok) {
        setStatus(
          article,
          "Preference saved here. We could not sync it yet.",
        );
      }
    });
  }

  function saveArticle(article: Article) {
    const current = savedArticles();
    const exists = current.some((item) => item.url === article.link);
    const next = exists
      ? current.filter((item) => item.url !== article.link)
      : [
          {
            articleId: article.id,
            publicationId,
            publicationName,
            title: article.title,
            source: article.source,
            url: article.link,
            summary: article.summary,
            imageUrl: article.imageUrl,
            savedAt: new Date().toISOString(),
          },
          ...current,
        ];

    localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(next));
    setSavedKeys(next.map((item) => item.url));
    setStatus(article, exists ? "Removed from saved items." : "Saved.");
    void syncSavedArticle(article, exists ? "unsave" : "save");
  }

  async function shareArticle(article: Article) {
    const shareUrl = article.link;

    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: shareUrl,
        });
        setStatus(article, "Share opened.");
        return;
      }

      await copyText(shareUrl);
      setStatus(article, "Link copied.");
    } catch {
      try {
        await copyText(shareUrl);
        setStatus(article, "Link copied.");
      } catch {
        setStatus(article, "Share unavailable.");
      }
    }
  }

  async function emailArticle(article: Article, email: string) {
    localStorage.setItem(READER_EMAIL_KEY, email);
    setReaderEmail(email);
    const response = await fetch("/api/reader-actions/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        requestType: "article",
        verticalId: publicationId,
        articleId: article.id,
        publicationName,
        publicationUrl:
          publicationUrl ?? `${window.location.origin}${window.location.pathname}`,
        filterContext: {
          publicationSlug,
          source: article.source,
        },
        articleTitle: article.title,
        articleSource: article.source,
        articleSummary: article.summary,
        articleUrl: article.link,
      }),
    });
    const result = (await response.json()) as { message?: string };

    setStatus(
      article,
      response.ok
        ? result.message ?? "Email request queued."
        : result.message ?? "Email request failed.",
    );
  }

  return (
    <div className="space-y-4">
      <MyNewsNetworkEmailDialog
        body={
          emailArticleRequest
            ? `Send "${emailArticleRequest.title}" to your email.`
            : undefined
        }
        confirmLabel="Send to me"
        defaultEmail={readerEmail}
        heading="Send Article"
        onCancel={() => setEmailArticleRequest(null)}
        onSubmit={(email) => {
          if (!emailArticleRequest) return;

          const article = emailArticleRequest;

          setEmailArticleRequest(null);
          void emailArticle(article, email);
        }}
        open={Boolean(emailArticleRequest)}
      />
      {stories
        .filter(
          (story) =>
            !story.article.sourceId ||
            !hiddenSourceIds.includes(story.article.sourceId),
        )
        .map((scoredArticle, index) => {
        const hasImage = Boolean(scoredArticle.article.imageUrl);
        const articleGridClass =
          hasImage && isCompact
            ? "grid gap-3 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-start"
            : hasImage && !isVisual
              ? "grid gap-5 lg:grid-cols-[minmax(15rem,38%)_minmax(0,1fr)] lg:items-start"
              : "";
        const imageClass = [
          "overflow-hidden rounded-md border border-slate-100 bg-slate-50",
          isCompact
            ? "aspect-[4/3] sm:aspect-square"
            : isVisual
              ? "mb-4 aspect-video max-h-[28rem]"
              : "aspect-video max-h-[18rem]",
        ].join(" ");
        const badge = storyBadge(scoredArticle.article);
        const articleKey = savedArticleKey(scoredArticle.article);
        const hiddenKey = hiddenArticleKey(scoredArticle.article);
        const isHidden = hiddenKeys.includes(hiddenKey);
        const isSaved = savedKeys.includes(scoredArticle.article.link);
        const sourceMenuOpen = sourceMenuArticleKey === articleKey;

        return (
          <div
            className="space-y-4"
            key={`${scoredArticle.article.source}-${scoredArticle.article.link}`}
          >
            {isHidden ? (
              <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8">
                <p className="text-sm font-bold text-slate-950">
                  Article hidden from your feed.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                    onClick={() => undoHideArticle(scoredArticle.article)}
                    type="button"
                  >
                    Undo
                  </button>
                  <EditorialReportButton
                    articleId={scoredArticle.article.id}
                    onHide={() => hideArticle(scoredArticle.article)}
                    verticalId={publicationId}
                  />
                  {actionStatus[articleKey] ? (
                    <span className="text-sm font-semibold text-blue-700">
                      {actionStatus[articleKey]}
                    </span>
                  ) : null}
                </div>
              </section>
            ) : (
              <article
              className={[
                "rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/40",
                isCompact ? "p-3 sm:p-4" : "p-4 sm:p-5",
              ].join(" ")}
            >
              <div className={articleGridClass}>
                {scoredArticle.article.imageUrl ? (
                  <div className={imageClass}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={scoredArticle.article.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      src={scoredArticle.article.imageUrl}
                    />
                  </div>
                ) : null}
                <div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-blue-600 px-2 py-1 text-xs font-bold uppercase tracking-wide text-white">
                        {badge}
                      </span>
                      <div className="inline-flex flex-wrap items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-blue-700">
                        <span>{scoredArticle.article.source.toUpperCase()}</span>
                        <button
                          aria-label={
                            favourites.sources.includes(
                              scoredArticle.article.source,
                            )
                              ? `Remove ${scoredArticle.article.source} from favourite sources`
                              : `Add ${scoredArticle.article.source} to favourite sources`
                          }
                          aria-pressed={favourites.sources.includes(
                            scoredArticle.article.source,
                          )}
                          className={[
                            "inline-flex h-6 w-6 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                            favourites.sources.includes(
                              scoredArticle.article.source,
                            )
                              ? "text-red-600 hover:bg-red-50"
                              : "text-slate-600 hover:bg-white hover:text-red-600",
                          ].join(" ")}
                          onClick={() =>
                            onToggleSourceFavourite(scoredArticle.article.source)
                          }
                          type="button"
                        >
                          <SourceHeartIcon
                            filled={favourites.sources.includes(
                              scoredArticle.article.source,
                            )}
                          />
                        </button>
                        <span>{"\u2022"}</span>
                        <span>{formatDate(scoredArticle.article.publishedAt)}</span>
                      </div>
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
                  <h3
                    className={[
                      "mt-3 font-bold text-slate-950",
                      isCompact ? "text-xl leading-7" : "text-2xl leading-8",
                    ].join(" ")}
                  >
                    {scoredArticle.article.title}
                  </h3>
                  <p
                    className={[
                      "mt-3 text-slate-600",
                      isCompact ? "text-sm leading-6" : "text-base leading-7",
                    ].join(" ")}
                  >
                    {scoredArticle.article.summary}
                  </p>
                  <div
                    className={
                      isCompact
                        ? "mt-3 flex flex-wrap gap-1.5"
                        : "mt-4 flex flex-wrap gap-2"
                    }
                  >
                    {(scoredArticle.generatedTags.length
                      ? scoredArticle.generatedTags
                      : ["General"]
                    ).map((tag) => (
                      <span
                        className={[
                          "rounded-md bg-slate-50 font-semibold text-slate-600",
                          isCompact
                            ? "px-2 py-1 text-xs"
                            : "px-3 py-2 text-sm",
                        ].join(" ")}
                        key={tag}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div
                    className={[
                      "rounded-md border border-blue-100 bg-blue-50 px-3",
                      isCompact ? "mt-3 py-2" : "mt-4 py-3",
                    ].join(" ")}
                  >
                    <p className="text-sm font-bold text-blue-950">
                      Matched because:
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(scoredArticle.matchedBecause.length
                        ? scoredArticle.matchedBecause
                        : ["General match"]
                      ).map((reason) => (
                        <span
                          className="text-sm font-semibold text-blue-900"
                          key={reason}
                        >
                          {"\u2713"} {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p
                    className={[
                      "rounded-md bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900",
                      isCompact ? "mt-3" : "mt-4",
                    ].join(" ")}
                  >
                    Publisher attribution: {scoredArticle.article.source}.
                    Summary and metadata are attributed to the source above.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <button
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => saveArticle(scoredArticle.article)}
                      type="button"
                    >
                      {isSaved ? "Saved" : "Save"}
                    </button>
                    <button
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => shareArticle(scoredArticle.article)}
                      type="button"
                    >
                      Share
                    </button>
                    <button
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => setEmailArticleRequest(scoredArticle.article)}
                      type="button"
                    >
                      Send to me
                    </button>
                    <EditorialReportButton
                      articleId={scoredArticle.article.id}
                      onHide={() => hideArticle(scoredArticle.article)}
                      verticalId={publicationId}
                    />
                    <button
                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                      onClick={() => hideArticle(scoredArticle.article)}
                      type="button"
                    >
                      Hide from my feed
                    </button>
                    <div className="relative">
                      <button
                        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                        onClick={() =>
                          setSourceMenuArticleKey((current) =>
                            current === articleKey ? null : articleKey,
                          )
                        }
                        type="button"
                      >
                        Less from this source
                      </button>
                      {sourceMenuOpen ? (
                        <div className="absolute z-10 mt-2 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-xl shadow-blue-950/10">
                          <button
                            className="block w-full rounded px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => hideSource(scoredArticle.article, 7)}
                            type="button"
                          >
                            Mute source for 7 days
                          </button>
                          <button
                            className="block w-full rounded px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => hideSource(scoredArticle.article, 30)}
                            type="button"
                          >
                            Mute source for 30 days
                          </button>
                          <button
                            className="block w-full rounded px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                            onClick={() => hideSource(scoredArticle.article)}
                            type="button"
                          >
                            Hide this source
                          </button>
                        </div>
                      ) : null}
                    </div>
                    {actionStatus[articleKey] ? (
                      <span className="text-sm font-semibold text-blue-700">
                        {actionStatus[articleKey]}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
              </article>
            )}
            {showFeedAds && index === 2 ? (
              <AdPlacement placementId="feed-inline-1" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function FeedClient({
  articles,
  usingFallback,
  initialPreferences = defaultPreferences,
  initialFavourites = defaultFavourites,
  readLocalStorage = true,
  showNavigation = true,
  showHeader = true,
  showNewsletterPanel = true,
  showFeedAds = true,
  storySectionHeading,
  periodDays,
}: {
  articles: Article[];
  usingFallback: boolean;
  initialPreferences?: Preferences;
  initialFavourites?: Favourites;
  readLocalStorage?: boolean;
  showNavigation?: boolean;
  showHeader?: boolean;
  showNewsletterPanel?: boolean;
  showFeedAds?: boolean;
  storySectionHeading?: string;
  periodDays?: number;
}) {
  const [preferences, setPreferences] =
    useState<Preferences>(initialPreferences);
  const [favourites, setFavourites] =
    useState<Favourites>(initialFavourites);
  const [emailFrequency, setEmailFrequency] = useState("Weekly");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [showNewsletterReview, setShowNewsletterReview] = useState(false);
  const [savedFeedPath, setSavedFeedPath] = useState<string | null>(null);
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

  const hasPreferenceTags = hasPersonalisedSignal(preferences, favourites);
  const requestedStoryCount = Number(preferences.storiesPerUpdate);
  const matchedStories = useMemo(
    () =>
      rankFeedArticles(articles, preferences, favourites, {
        limit: requestedStoryCount,
        periodDays,
      }),
    [articles, favourites, periodDays, preferences, requestedStoryCount],
  );

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

  const currentNewsletterPreferences = useMemo(
    () => newsletterPreferences(preferences, emailFrequency),
    [emailFrequency, preferences],
  );
  const hasNewsletterSignal = hasSignupSignal(preferences, favourites);

  function reviewNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setSavedFeedPath(null);
    setNewsletterStatus(null);

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    setShowNewsletterReview(true);
  }

  async function confirmNewsletterSignup() {
    setNewsletterSubmitting(true);
    setNewsletterStatus(null);
    setSavedFeedPath(null);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: newsletterEmail,
          preferences: currentNewsletterPreferences,
          favourites,
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
        mode?: string;
        savedFeedPath?: string;
      };

      if (response.ok && result.ok) {
        setShowNewsletterReview(false);
        setSavedFeedPath(result.savedFeedPath ?? null);
      }

      setNewsletterStatus({
        tone: response.ok && result.ok ? "success" : "error",
        message:
          response.ok && result.ok && result.mode !== "development"
            ? "You're subscribed. Your personalised update settings have been saved."
            : result.message ??
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

  function toggleSourceFavourite(source: string) {
    setFavourites((current) => {
      const updated = toggleFavourite(current, "sources", source);

      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto w-full max-w-7xl px-6 py-6 sm:px-8 lg:px-12">
        {showNavigation ? (
          <GlobalNav />
        ) : null}

        {showHeader ? (
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
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                href="/"
              >
                Edit my feed
              </Link>
              <ActionLinks
                links={[
                  {
                    href: "/catch-up",
                    label: "Catch up on missed stories",
                  },
                  { href: "/sources", label: "Browse all sources" },
                  { href: "/updates", label: "Latest platform updates" },
                ]}
              />
            </div>
          </header>
        ) : null}

        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <aside className="space-y-4">
            {showNewsletterPanel ? (
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
                  favouriteValues={favourites.modelPlatforms}
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
                  favouriteValues={favourites.sources}
                  label="Sources"
                  onToggleFocus={toggleFocus}
                  values={preferences.sources}
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
                  values={favourites.modelPlatforms}
                />
                <FavouriteSection
                  label="Favourite Creators"
                  values={favourites.creators}
                />
                <FavouriteSection
                  label="Favourite Sources"
                  values={favourites.sources}
                />
              </div>
              </section>
            ) : null}

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
                    onClick={() => {
                      setEmailFrequency(option);
                      setShowNewsletterReview(false);
                      setSavedFeedPath(null);
                      setNewsletterStatus(null);
                    }}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>

              <form className="mt-4 space-y-2.5" onSubmit={reviewNewsletter}>
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
                  onChange={(event) => {
                    setNewsletterEmail(event.target.value);
                    localStorage.setItem(READER_EMAIL_KEY, event.target.value);
                    setShowNewsletterReview(false);
                    setSavedFeedPath(null);
                    setNewsletterStatus(null);
                  }}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={newsletterEmail}
                />
                <button
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  disabled={newsletterSubmitting}
                  type="submit"
                >
                  Review my update settings
                </button>
                {showNewsletterReview ? (
                  <div className="space-y-4 rounded-lg border border-blue-100 bg-blue-50/80 p-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-950">
                        Confirm your personalised update
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        We&apos;ll use these preferences to prepare your
                        personalised MyNewsNetwork updates.
                      </p>
                    </div>
                    {!hasNewsletterSignal ? (
                      <p className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                        No specific preferences selected yet. We&apos;ll send a
                        general 3D printing update.
                      </p>
                    ) : null}
                    <div className="space-y-3">
                      <SummaryList
                        label="Email address"
                        values={[newsletterEmail]}
                      />
                      <SummaryList
                        label="Frequency"
                        values={[
                          deliverySummary(currentNewsletterPreferences),
                        ]}
                      />
                      <SummaryList
                        label="Story count"
                        values={[
                          `${currentNewsletterPreferences.storiesPerUpdate} stories`,
                        ]}
                      />
                      <SummaryList
                        label="Brands"
                        values={currentNewsletterPreferences.brands}
                      />
                      <SummaryList
                        label="Model Platforms"
                        values={currentNewsletterPreferences.models}
                      />
                      <SummaryList
                        label="Creators"
                        values={currentNewsletterPreferences.creators}
                      />
                      <SummaryList
                        label="Sources"
                        values={currentNewsletterPreferences.sources}
                      />
                      <SummaryList
                        label="Topics"
                        values={currentNewsletterPreferences.topics}
                      />
                      <SummaryList
                        label="Technology"
                        values={currentNewsletterPreferences.technology}
                      />
                      <SummaryList
                        label="Favourite Brands"
                        values={favourites.brands}
                      />
                      <SummaryList
                        label="Favourite Platforms"
                        values={favourites.modelPlatforms}
                      />
                      <SummaryList
                        label="Favourite Creators"
                        values={favourites.creators}
                      />
                      <SummaryList
                        label="Favourite Sources"
                        values={favourites.sources}
                      />
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                        disabled={newsletterSubmitting}
                        onClick={confirmNewsletterSignup}
                        type="button"
                      >
                        {newsletterSubmitting
                          ? "Saving..."
                          : "Confirm and subscribe"}
                      </button>
                      <button
                        className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                        disabled={newsletterSubmitting}
                        onClick={() => {
                          setShowNewsletterReview(false);
                          setNewsletterStatus(null);
                        }}
                        type="button"
                      >
                        Go back and edit
                      </button>
                    </div>
                  </div>
                ) : null}
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
                {savedFeedPath ? (
                  <Link
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                    href={savedFeedPath}
                  >
                    Open your saved feed
                  </Link>
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
                    {storySectionHeading ??
                      (hasPreferenceTags
                        ? "Matched to your preferences"
                        : "Latest general stories")}
                  </h2>
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {focusedStories.length}{" "}
                    {hasPreferenceTags ? "matching stories" : "stories"}
                  </span>
                </div>

                <FeedStoryCards
                  favourites={favourites}
                  onToggleSourceFavourite={toggleSourceFavourite}
                  showFeedAds={showFeedAds}
                  stories={focusedStories}
                />
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

        <FeedbackPanel />
        <DiscoverMorePanel />
        <FooterLinks />
      </section>
    </main>
  );
}
