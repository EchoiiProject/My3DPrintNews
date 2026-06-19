"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FooterLinks } from "./footer-links";
import {
  defaultFavourites,
  defaultPreferences,
  FAVOURITES_KEY,
  Favourites,
  frequencyOptions,
  isFavouriteKey,
  normalisePreferences,
  normaliseFavourites,
  preferenceGroups,
  Preferences,
  STORAGE_KEY,
  storyCountOptions,
  toggleFavourite,
} from "./preferences";
import { useEffect, useState } from "react";

type MultiSelectKey =
  | "brands"
  | "models"
  | "creators"
  | "topics"
  | "technology";

function toggleSelection(current: string[], value: string): string[] {
  if (current.includes(value)) {
    return current.filter((item) => item !== value);
  }

  return [...current, value];
}

function HeartIcon({ filled }: { filled: boolean }) {
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

export default function Home() {
  const router = useRouter();
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      try {
        setPreferences(normalisePreferences(JSON.parse(saved)));
      } catch {
        setPreferences(defaultPreferences);
      }
    }

    const savedFavourites = localStorage.getItem(FAVOURITES_KEY);

    if (savedFavourites) {
      try {
        setFavourites(normaliseFavourites(JSON.parse(savedFavourites)));
      } catch {
        setFavourites(defaultFavourites);
      }
    }
  }, []);

  function updateMultiSelect(key: MultiSelectKey, value: string) {
    setPreferences((current) => ({
      ...current,
      [key]: toggleSelection(current[key], value),
    }));
  }

  function buildFeed() {
    const latestPreferences = normalisePreferences(preferences);
    const latestFavourites = normaliseFavourites(favourites);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(latestPreferences));
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(latestFavourites));
    router.push("/feed");
  }

  function updateFavourite(key: keyof Favourites, value: string) {
    setFavourites((current) => {
      const updated = toggleFavourite(current, key, value);

      localStorage.setItem(FAVOURITES_KEY, JSON.stringify(updated));
      return updated;
    });
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
        </nav>

        <div className="grid flex-1 items-start gap-8 py-10 lg:grid-cols-[0.86fr_1.14fr] lg:py-12">
          <div className="max-w-3xl lg:sticky lg:top-6">
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

            <div
              className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-5"
              id="delivery"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Frequency
                  </h2>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {frequencyOptions.map((option) => (
                      <button
                        className={[
                          "min-h-10 rounded-md border px-2.5 text-center text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
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
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    Stories
                  </h2>
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {storyCountOptions.map((option) => (
                      <button
                        className={[
                          "min-h-10 rounded-md border px-2.5 text-center text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
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

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="inline-flex min-h-16 items-center justify-center rounded-md bg-blue-600 px-9 text-lg font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 hover:shadow-blue-600/30 active:translate-y-px active:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
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
            <div className="mb-5 border-b border-slate-100 pb-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Feed Builder
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Customise Your Feed
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              {preferenceGroups.map((group) => (
                <div key={group.key}>
                  <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                    {group.title}
                  </h3>
                  <div className="mt-2 grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                    {group.options.map((option) => {
                      const favouriteKey = isFavouriteKey(group.key)
                        ? group.key
                        : null;
                      const selected =
                        preferences[group.key as MultiSelectKey].includes(
                          option,
                        );
                      const favourited = favouriteKey
                        ? favourites[favouriteKey].includes(option)
                        : false;

                      return (
                        <div className="relative" key={option}>
                          <button
                            className={[
                              "min-h-10 w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                              favouriteKey ? "pr-10" : "",
                              selected
                                ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100"
                                : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white",
                            ].join(" ")}
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
                          {favouriteKey ? (
                            <button
                              aria-label={
                                favourited
                                  ? `Remove ${option} from favourites`
                                  : `Add ${option} to favourites`
                              }
                              aria-pressed={favourited}
                              className={[
                                "absolute right-2 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                                favourited
                                  ? "text-blue-700 hover:bg-blue-100"
                                  : "text-slate-400 hover:bg-white hover:text-blue-700",
                              ].join(" ")}
                              onClick={() => updateFavourite(favouriteKey, option)}
                              type="button"
                            >
                              <HeartIcon filled={favourited} />
                            </button>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
