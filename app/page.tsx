"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  defaultPreferences,
  frequencyOptions,
  preferenceGroups,
  Preferences,
  STORAGE_KEY,
  storyCountOptions,
} from "./preferences";
import { useState } from "react";

type MultiSelectKey = "brands" | "models" | "topics" | "technology";

function toggleSelection(current: string[], value: string): string[] {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }

  return [...current, value];
}

export default function Home() {
  const router = useRouter();
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);

  function updateMultiSelect(key: MultiSelectKey, value: string) {
    setPreferences((current) => ({
      ...current,
      [key]: toggleSelection(current[key], value),
    }));
  }

  function buildFeed() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    router.push("/feed");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            My3DPrintNews
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
            <a className="hidden hover:text-blue-700 sm:inline" href="#topics">
              Topics
            </a>
            <a className="hidden hover:text-blue-700 sm:inline" href="#delivery">
              Delivery
            </a>
            <Link className="hover:text-blue-700" href="/publishers">
              Publishers
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[0.94fr_1.06fr] lg:py-16">
          <div className="max-w-3xl">
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Personalised additive manufacturing intelligence
            </p>
            <h1 className="text-5xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl lg:text-7xl">
              My3DPrintNews
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-700 sm:text-2xl">
              Your Personalised 3D Printing News
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              Choose the brands, model libraries, technologies, and story types
              you care about,
              then generate a focused 3D printing news feed.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                className="inline-flex min-h-14 items-center justify-center rounded-md bg-blue-600 px-7 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                onClick={buildFeed}
                type="button"
              >
                Build My Feed
              </button>
              <span className="text-sm font-medium text-slate-500">
                Saved locally on this device.
              </span>
            </div>
          </div>

          <section
            aria-label="Preference selector"
            className="relative rounded-lg border border-slate-200 bg-white/88 p-4 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-5"
            id="topics"
          >
            <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Feed Builder
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Tune your update
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {preferenceGroups.map((group) => (
                <div key={group.key}>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    {group.title}
                  </h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {group.options.map((option) => {
                      const selected =
                        preferences[group.key as MultiSelectKey].includes(
                          option,
                        );

                      return (
                        <button
                          className={[
                            "min-h-12 rounded-md border px-4 py-3 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100"
                              : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-blue-200 hover:bg-blue-50/60",
                          ].join(" ")}
                          key={option}
                          onClick={() =>
                            updateMultiSelect(
                              group.key as MultiSelectKey,
                              option,
                            )
                          }
                          type="button"
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div
                className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2"
                id="delivery"
              >
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Frequency
                  </h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {frequencyOptions.map((option) => (
                      <button
                        className={[
                          "min-h-11 rounded-md border px-3 text-center text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                          preferences.frequency === option
                            ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
                        ].join(" ")}
                        key={option}
                        onClick={() =>
                          setPreferences((current) => ({
                            ...current,
                            frequency: option,
                          }))
                        }
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Stories per update
                  </h3>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {storyCountOptions.map((option) => (
                      <button
                        className={[
                          "min-h-11 rounded-md border px-3 text-center text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                          preferences.storiesPerUpdate === option
                            ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-200"
                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50",
                        ].join(" ")}
                        key={option}
                        onClick={() =>
                          setPreferences((current) => ({
                            ...current,
                            storiesPerUpdate: option,
                          }))
                        }
                        type="button"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
