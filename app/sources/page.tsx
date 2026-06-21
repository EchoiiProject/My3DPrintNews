"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { selectableSources } from "../../config/registry";
import { FooterLinks } from "../footer-links";
import {
  defaultFavourites,
  defaultPreferences,
  FAVOURITES_KEY,
  Favourites,
  favouriteKeyForPreferenceGroup,
  normaliseFavourites,
  normalisePreferences,
  preferenceGroups,
  Preferences,
  STORAGE_KEY,
  toggleFavourite,
} from "../preferences";

type SelectionKey =
  | "brands"
  | "models"
  | "creators"
  | "sources"
  | "topics"
  | "technology";

type SelectorSection = {
  key: SelectionKey;
  title: string;
  options: string[];
};

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

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function toggleSelection(current: string[], value: string): string[] {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export default function SourcesPage() {
  const router = useRouter();
  const [preferences, setPreferences] =
    useState<Preferences>(defaultPreferences);
  const [favourites, setFavourites] =
    useState<Favourites>(defaultFavourites);

  const selectorSections = useMemo<SelectorSection[]>(() => {
    const baseSections = preferenceGroups.map((group) => ({
      key: group.key as SelectionKey,
      title: group.title,
      options: [...group.options],
    }));
    const sourceSection = {
      key: "sources" as const,
      title: "Sources",
      options: selectableSources.map((source) => source.label),
    };

    return [
      ...baseSections.slice(0, 3),
      sourceSection,
      ...baseSections.slice(3),
    ];
  }, []);

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

  function persistPreferences(nextPreferences: Preferences) {
    const normalised = normalisePreferences(nextPreferences);

    setPreferences(normalised);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalised));
  }

  function persistFavourites(nextFavourites: Favourites) {
    const normalised = normaliseFavourites(nextFavourites);

    setFavourites(normalised);
    localStorage.setItem(FAVOURITES_KEY, JSON.stringify(normalised));
  }

  function updateSelection(key: SelectionKey, value: string) {
    persistPreferences({
      ...preferences,
      [key]: toggleSelection(preferences[key], value),
    });
  }

  function selectAll(key: SelectionKey, options: string[]) {
    persistPreferences({
      ...preferences,
      [key]: unique([...preferences[key], ...options]),
    });
  }

  function clearSection(key: SelectionKey) {
    persistPreferences({
      ...preferences,
      [key]: [],
    });
  }

  function updateFavourite(key: keyof Favourites, value: string) {
    persistFavourites(toggleFavourite(favourites, key, value));
  }

  function buildFeed() {
    persistPreferences(preferences);
    persistFavourites(favourites);
    router.push("/feed");
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
          <Link className="text-sm font-bold text-blue-700" href="/">
            Back to builder
          </Link>
        </nav>

        <header className="py-9 sm:py-12">
          <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            Expanded feed builder
          </p>
          <h1 className="text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Select from all
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Build a broader 3D printing signal by choosing from all available
            brands, creators, sources, model platforms, topics and technologies.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              onClick={buildFeed}
              type="button"
            >
              Build My Feed
            </button>
            <span className="text-sm font-semibold text-slate-500">
              Selections save automatically on this device.
            </span>
          </div>
        </header>

        <div className="space-y-5">
          {selectorSections.map((section) => {
            const favouriteKey = favouriteKeyForPreferenceGroup(section.key);
            const selectedCount = preferences[section.key].length;

            return (
              <section
                className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-5"
                key={section.key}
              >
                <div className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {section.title}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {selectedCount} selected
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-xs font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      onClick={() => selectAll(section.key, section.options)}
                      type="button"
                    >
                      Select all
                    </button>
                    <button
                      className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      onClick={() => clearSection(section.key)}
                      type="button"
                    >
                      Clear section
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {section.options.map((option) => {
                    const selected = preferences[section.key].includes(option);
                    const favourited = favouriteKey
                      ? favourites[favouriteKey].includes(option)
                      : false;

                    return (
                      <div className="relative" key={option}>
                        <button
                          className={[
                            "min-h-11 w-full rounded-md border px-3 py-2 text-left text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                            favouriteKey ? "pr-10" : "",
                            selected
                              ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm shadow-blue-100"
                              : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white",
                          ].join(" ")}
                          onClick={() =>
                            updateSelection(section.key, option)
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
                              "absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                              favourited
                                ? "text-red-600 hover:bg-red-50"
                                : "text-slate-600 hover:bg-white hover:text-red-600",
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
              </section>
            );
          })}
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
