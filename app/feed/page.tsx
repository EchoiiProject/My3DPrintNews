"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  defaultPreferences,
  Preferences,
  STORAGE_KEY,
} from "../preferences";

const placeholderStories = [
  {
    source: "Printer Industry Wire",
    topic: "New Printers",
    title: "Compact high-speed FDM systems push toward small-batch production",
    summary:
      "A placeholder briefing for printer launches, motion systems, and desktop production trends matched to your saved interests.",
  },
  {
    source: "Materials Desk",
    topic: "Filament & Materials",
    title: "Engineering polymers and filled filaments gain broader profiles",
    summary:
      "A placeholder story card for material updates, compatibility notes, and professional print workflow changes.",
  },
  {
    source: "Maker Review Journal",
    topic: "Reviews",
    title: "Hands-on testing highlights reliability, firmware, and print quality",
    summary:
      "A placeholder review summary with clear attribution and a link back to the original source location.",
  },
];

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

export default function FeedPage() {
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      setPreferences({ ...defaultPreferences, ...JSON.parse(saved) });
    } catch {
      setPreferences(defaultPreferences);
    }
  }, []);

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
            Personalised briefing
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Your Personalised Feed
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Placeholder stories below are shaped by the preferences saved in
            your browser.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <aside className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <div className="mb-5 border-b border-slate-100 pb-4">
              <p className="text-sm font-semibold text-blue-700">
                Selected Preferences
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Your signal
              </h2>
            </div>

            <div className="space-y-5">
              <PreferenceSection label="Brands" values={preferences.brands} />
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
          </aside>

          <section className="space-y-4" aria-label="Placeholder stories">
            {placeholderStories.map((story) => (
              <article
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/40"
                key={story.title}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                    {story.topic}
                  </p>
                  <a
                    className="text-sm font-bold text-blue-700 hover:text-blue-900"
                    href="#source-placeholder"
                  >
                    Source placeholder
                  </a>
                </div>
                <h2 className="mt-3 text-2xl font-bold leading-8 text-slate-950">
                  {story.title}
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {story.summary}
                </p>
                <p
                  className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                  id="source-placeholder"
                >
                  Original source: {story.source}
                </p>
              </article>
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
