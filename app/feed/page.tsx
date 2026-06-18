"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  defaultPreferences,
  frequencyOptions,
  normalisePreferences,
  Preferences,
  STORAGE_KEY,
} from "../preferences";

const storyLibrary = [
  {
    category: "New Printers",
    printers: ["Bambu X1 Carbon", "Bambu P1S"],
    sourcePlatform: "MakerWorld",
    source: "Printer Industry Wire",
    title: "Bambu X1 Carbon and P1S expectations reshape desktop launches",
    summary:
      "Manufacturers are positioning enclosed CoreXY machines, faster calibration, and integrated monitoring as baseline expectations for serious home and studio users.",
  },
  {
    category: "New Printers",
    printers: ["Prusa XL", "Prusa MK4S"],
    sourcePlatform: "Printables",
    source: "Additive Hardware Brief",
    title: "Prusa XL and MK4S coverage tracks modular production workflows",
    summary:
      "Professional users are watching toolchanger workflows, enclosure options, and validated print profiles for mixed material jobs.",
  },
  {
    category: "Reviews",
    printers: ["Creality K1", "Creality K2 Plus"],
    sourcePlatform: "Thingiverse",
    source: "Maker Review Journal",
    title: "Creality K1 and K2 Plus reviews focus on thermal stability",
    summary:
      "Reviewers are moving beyond first prints to examine nozzle wear, belt tension, chamber temperatures, and firmware recovery after failed jobs.",
  },
  {
    category: "Firmware Updates",
    printers: ["Bambu A1", "Bambu A1 Mini"],
    sourcePlatform: "MakerWorld",
    source: "Open Motion Notes",
    title: "Bambu A1 firmware updates improve calibration and recovery",
    summary:
      "Recent placeholder release notes highlight tuning assistants, clearer error states, and safer pause/resume behavior for unattended prints.",
  },
  {
    category: "3D Models / Designs",
    printers: ["Prusa MK4S", "Bambu A1 Mini"],
    sourcePlatform: "Printables",
    source: "Model Library Digest",
    title: "Printables model trends highlight MK4S and A1 Mini workshop mods",
    summary:
      "Designers are publishing modular organisers, spool management upgrades, and calibration fixtures with better documentation and remix permissions.",
  },
  {
    category: "Filament & Materials",
    printers: ["Bambu X1 Carbon", "Creality K2 Plus"],
    sourcePlatform: "Thangs",
    source: "Materials Desk",
    title: "High-flow PLA blends and carbon-filled nylon get broader print profiles",
    summary:
      "Material suppliers are pairing performance claims with more complete slicer settings for popular consumer and prosumer machines.",
  },
  {
    category: "Accessories",
    printers: ["Bambu P1S", "Prusa XL"],
    sourcePlatform: "Thangs",
    source: "Workshop Equipment Review",
    title: "Dry boxes, build plates, and hotend upgrades dominate accessory demand",
    summary:
      "Accessory makers are focusing on repeatable first layers, moisture control, and quick-swap maintenance for multi-printer workspaces.",
  },
  {
    category: "Deals & Discounts",
    printers: ["Creality K1", "Bambu A1"],
    sourcePlatform: "Cults3D",
    source: "3D Printing Deals Monitor",
    title: "Bundle pricing shifts toward filament, spare parts, and starter kits",
    summary:
      "Retailers are using practical bundles to appeal to new buyers who want machines, materials, and maintenance parts in one order.",
  },
  {
    category: "Tutorials & Guides",
    printers: ["Bambu A1 Mini", "Prusa MK4S"],
    sourcePlatform: "Thingiverse",
    source: "Print Process Lab",
    title: "Beginner guides put more emphasis on calibration and material storage",
    summary:
      "New tutorials are framing successful prints as a workflow: setup, drying, slicing, first-layer inspection, and structured troubleshooting.",
  },
  {
    category: "Industrial / Professional",
    printers: ["Prusa XL", "Creality K2 Plus"],
    sourcePlatform: "Cults3D",
    source: "Production AM Weekly",
    title: "Service bureaus add automated quoting and traceability to print orders",
    summary:
      "Professional additive teams are improving order intake with material traceability, repeatable QA notes, and clearer lead-time estimates.",
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

  const groupedStories = useMemo(() => {
    return storyLibrary.reduce<Record<string, typeof storyLibrary>>(
      (groups, story) => {
        const selectedTopic = preferences.topics.includes(story.category);
        const selectedPrinter = story.printers.some((printer) =>
          preferences.printers.includes(printer),
        );
        const selectedSource = preferences.sources.includes(story.sourcePlatform);
        const selectedTechnology = preferences.technology.some((technology) =>
          story.title.includes(technology.split(" ")[0]),
        );
        const groupName =
          selectedTopic || selectedPrinter || selectedSource || selectedTechnology
            ? "Matched to your printers and sources"
            : story.category;

        groups[groupName] = [...(groups[groupName] ?? []), story];
        return groups;
      },
      {},
    );
  }, [preferences]);

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
            Ten placeholder stories are organised around {feedSummary} and your
            preferred update rhythm.
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
            {Object.entries(groupedStories).map(([category, stories]) => (
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
                  {stories.map((story) => (
                    <article
                      className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/40"
                      key={story.title}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                          {story.category} / {story.sourcePlatform}
                        </p>
                        <a
                          className="text-sm font-bold text-blue-700 hover:text-blue-900"
                          href="#source-placeholder"
                        >
                          Source attribution placeholder
                        </a>
                      </div>
                      <h3 className="mt-3 text-2xl font-bold leading-8 text-slate-950">
                        {story.title}
                      </h3>
                      <p className="mt-3 text-base leading-7 text-slate-600">
                        {story.summary}
                      </p>
                      <div
                        className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600"
                        id="source-placeholder"
                      >
                        Original source: {story.source}. Placeholder source
                        link and attribution text. Matched printers:{" "}
                        {story.printers.join(", ")}.
                      </div>
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
