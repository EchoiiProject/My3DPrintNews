"use client";

import Link from "next/link";
import { currentSite } from "@/config/current-site";
import { verticalBySlug, verticals, type Vertical } from "@/config/verticals";
import { publicationPath } from "@/lib/publications";

const publicRecommendations = ["mybmxnews", "mydronenews", "mymakernews"];

export function formatSubscriberCount(count: number): string {
  return `${count.toLocaleString("en-GB")} Subscribers`;
}

export function getCurrentVertical(): Vertical {
  return verticalBySlug(currentSite.verticalSlug) ?? verticals[0];
}

export function getRelatedVerticals(vertical: Vertical): Vertical[] {
  return vertical.relatedVerticalIds
    .map((id) => verticals.find((candidate) => candidate.id === id))
    .filter((candidate): candidate is Vertical => Boolean(candidate));
}

export function VerticalPublicationCard({
  compact = false,
  showSubscriberCount = false,
  vertical,
}: {
  compact?: boolean;
  showSubscriberCount?: boolean;
  vertical: Vertical;
}) {
  const isComingSoon = vertical.comingSoon || vertical.status === "coming-soon";
  const href = isComingSoon ? vertical.publicUrl : publicationPath(vertical);

  return (
    <article
      className={[
        "rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-sm font-black text-blue-700">
          {vertical.logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-slate-950">
              {vertical.name}
            </h3>
            <span
              className={[
                "rounded-full border px-2 py-0.5 text-[11px] font-bold",
                isComingSoon
                  ? "border-slate-200 bg-slate-50 text-slate-500"
                  : "border-emerald-100 bg-emerald-50 text-emerald-700",
              ].join(" ")}
            >
              {isComingSoon ? "Coming Soon" : "Live"}
            </span>
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            {vertical.sector}
          </p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {vertical.description}
      </p>
      {showSubscriberCount && !isComingSoon ? (
        <p className="mt-3 text-sm font-bold text-slate-700">
          {formatSubscriberCount(vertical.subscriberCount)}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          href={href}
        >
          Visit
        </Link>
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white transition hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          type="button"
        >
          {isComingSoon ? "Register Interest" : "Subscribe"}
        </button>
      </div>
    </article>
  );
}

export function DiscoverMorePanel() {
  const currentVertical = getCurrentVertical();
  const recommendations = publicRecommendations
    .map((id) => verticals.find((vertical) => vertical.id === id))
    .filter((vertical): vertical is Vertical => Boolean(vertical));

  return (
    <section className="border-t border-slate-200/80 py-8">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-blue-700">Discover More</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Enjoying {currentVertical.name}?
          </h2>
        </div>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white/90 px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          href="/discover-more"
        >
          Explore all publications
        </Link>
      </div>
      <p className="mb-4 text-sm leading-6 text-slate-600">
        You might also enjoy:
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        {recommendations.map((vertical) => (
          <VerticalPublicationCard
            compact
            key={vertical.id}
            vertical={vertical}
          />
        ))}
      </div>
    </section>
  );
}
