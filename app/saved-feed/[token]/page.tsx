import Link from "next/link";
import { fetchFeeds } from "@/lib/rss";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { FooterLinks } from "../../footer-links";
import { FeedClient } from "../../feed/feed-client";
import { placeholderStories } from "../../feed/placeholder-stories";
import {
  defaultFavourites,
  defaultPreferences,
  Favourites,
  monthlyTimingOptions,
  normaliseFavourites,
  normalisePreferences,
  Preferences,
  weeklyDayOptions,
} from "../../preferences";

type SubscriberRow = {
  email: string;
  preferences: Partial<Preferences>;
  favourites: Partial<Favourites>;
};

function deliverySummary(preferences: Preferences): string {
  if (preferences.delivery.frequency === "weekly") {
    const day =
      weeklyDayOptions.find(
        (option) => option.value === preferences.delivery.weeklyDay,
      ) ?? weeklyDayOptions[0];

    return `Weekly on ${day.long}`;
  }

  if (preferences.delivery.frequency === "monthly") {
    const timing =
      monthlyTimingOptions.find(
        (option) => option.value === preferences.delivery.monthlyTiming,
      ) ?? monthlyTimingOptions[0];

    return timing.summary;
  }

  return "Daily";
}

function ProfileSummary({ label, values }: { label: string; values: string[] }) {
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

export const dynamic = "force-dynamic";

export default async function SavedFeedPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
          <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
            <Link
              className="text-lg font-bold tracking-tight text-slate-950"
              href="/"
            >
              My3DPrintNews
            </Link>
          </nav>
          <div className="flex-1 py-12">
            <h1 className="text-4xl font-bold text-slate-950">
              Saved feed preview
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Supabase is not configured yet, so saved feed lookup is running in
              development mode.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
                href="/feed"
              >
                Go to live feed
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                href="/"
              >
                Edit preferences
              </Link>
            </div>
          </div>
          <FooterLinks />
        </section>
      </main>
    );
  }

  const subscriber = await supabase
    .from("subscribers")
    .select("email, preferences, favourites")
    .eq("token", token)
    .maybeSingle<SubscriberRow>();

  if (subscriber.error || !subscriber.data) {
    return (
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
        <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
          <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
            <Link
              className="text-lg font-bold tracking-tight text-slate-950"
              href="/"
            >
              My3DPrintNews
            </Link>
          </nav>
          <div className="flex-1 py-12">
            <h1 className="text-4xl font-bold text-slate-950">
              Saved feed not found
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              This saved feed link could not be found. You can still open the
              live feed or create a new set of preferences.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
                href="/feed"
              >
                Go to live feed
              </Link>
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
                href="/"
              >
                Edit preferences
              </Link>
            </div>
          </div>
          <FooterLinks />
        </section>
      </main>
    );
  }

  const preferences = normalisePreferences(
    subscriber.data.preferences ?? defaultPreferences,
  );
  const favourites = normaliseFavourites(
    subscriber.data.favourites ?? defaultFavourites,
  );
  const articles = await fetchFeeds();

  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] px-6 pt-8 text-slate-950 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-lg border border-blue-100 bg-white/80 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Saved feed</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Your saved My3DPrintNews feed
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Saved for {subscriber.data.email}. These stories use the saved
            preferences and favourites attached to this magic link.
          </p>
          <div className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white/80 p-4 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileSummary
              label="Subscriber email"
              values={[subscriber.data.email]}
            />
            <ProfileSummary
              label="Delivery schedule"
              values={[deliverySummary(preferences)]}
            />
            <ProfileSummary
              label="Story count"
              values={[`${preferences.storiesPerUpdate} stories`]}
            />
            <ProfileSummary label="Brands" values={preferences.brands} />
            <ProfileSummary
              label="Model Platforms"
              values={preferences.models}
            />
            <ProfileSummary label="Creators" values={preferences.creators} />
            <ProfileSummary label="Sources" values={preferences.sources} />
            <ProfileSummary label="Topics" values={preferences.topics} />
            <ProfileSummary label="Technology" values={preferences.technology} />
            <ProfileSummary
              label="Favourite Brands"
              values={favourites.brands}
            />
            <ProfileSummary
              label="Favourite Platforms"
              values={favourites.modelPlatforms}
            />
            <ProfileSummary
              label="Favourite Creators"
              values={favourites.creators}
            />
            <ProfileSummary
              label="Favourite Sources"
              values={favourites.sources}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
              href="/feed"
            >
              Go to live feed
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
              href="/"
            >
              Edit preferences
            </Link>
          </div>
        </div>
      </section>
      <FeedClient
        articles={articles.length ? articles : placeholderStories}
        initialFavourites={favourites}
        initialPreferences={preferences}
        readLocalStorage={false}
        showHeader={false}
        showNavigation={false}
        showNewsletterPanel={false}
        storySectionHeading="Matched to your saved preferences"
        usingFallback={!articles.length}
      />
    </div>
  );
}
