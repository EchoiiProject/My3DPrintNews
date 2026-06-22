"use client";

import { useState } from "react";
import type { Article } from "@/lib/rss";
import { FeedClient } from "../feed/feed-client";
import { ActionLinks, GlobalNav } from "../global-nav";

const catchUpPeriods = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 14 days", value: 14 },
  { label: "Last 30 days", value: 30 },
];

export function CatchUpClient({
  articles,
  usingFallback,
}: {
  articles: Article[];
  usingFallback: boolean;
}) {
  const [periodDays, setPeriodDays] = useState(7);

  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] px-6 pt-8 text-slate-950 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-lg border border-blue-100 bg-white/80 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <GlobalNav />
          <h1 className="mt-6 text-4xl font-bold text-slate-950">Catch Up</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            See the stories, videos and updates you may have missed.
          </p>
          <div className="mt-4">
            <ActionLinks
              links={[
                { href: "/feed", label: "Live Feed" },
                { href: "/sources", label: "Sources" },
                { href: "/updates", label: "Updates" },
              ]}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {catchUpPeriods.map((period) => (
              <button
                className={[
                  "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                  periodDays === period.value
                    ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                ].join(" ")}
                key={period.value}
                onClick={() => setPeriodDays(period.value)}
                type="button"
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </section>
      <FeedClient
        articles={articles}
        periodDays={periodDays}
        showFeedAds={false}
        showHeader={false}
        showNavigation={false}
        showNewsletterPanel={false}
        storySectionHeading="You may have missed"
        usingFallback={usingFallback}
      />
    </div>
  );
}
