import Link from "next/link";
import { currentSite } from "@/config/current-site";
import { buildNewsletterTemplate } from "@/lib/newsletter";
import { rankFeedArticles } from "@/lib/ranking";
import { fetchFeeds } from "@/lib/rss";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { FooterLinks } from "../../footer-links";
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

function PreviewShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            {currentSite.metadata.name}
          </Link>
          <Link className="text-sm font-bold text-blue-700" href="/feed">
            Live Feed
          </Link>
        </nav>
        <div className="flex-1 py-10">
          <h1 className="text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
            {title}
          </h1>
          {children}
        </div>
        <FooterLinks />
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";

export default async function NewsletterPreviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return (
      <PreviewShell title="Newsletter preview unavailable">
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          Supabase is not configured yet, so token-based newsletter previews are
          only available once the subscriber database is connected.
        </p>
      </PreviewShell>
    );
  }

  const subscriber = await supabase
    .from("subscribers")
    .select("email, preferences, favourites")
    .eq("token", token)
    .maybeSingle<SubscriberRow>();

  if (subscriber.error || !subscriber.data) {
    return (
      <PreviewShell title="Newsletter preview not found">
        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          This preview link could not be found. You can open your live feed or
          create a fresh set of preferences.
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
      </PreviewShell>
    );
  }

  const preferences = normalisePreferences(
    subscriber.data.preferences ?? defaultPreferences,
  );
  const favourites = normaliseFavourites(
    subscriber.data.favourites ?? defaultFavourites,
  );
  const articles = await fetchFeeds();
  const feedArticles = articles.length ? articles : placeholderStories;
  const storyCount = Number(preferences.storiesPerUpdate) || 10;
  const stories = rankFeedArticles(feedArticles, preferences, favourites, {
    limit: storyCount,
  });
  const template = buildNewsletterTemplate({
    siteName: currentSite.metadata.name,
    email: subscriber.data.email,
    preferences,
    favourites,
    stories,
  });

  return (
    <PreviewShell title="Your next My3DPrintNews update preview">
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
        This safe preview shows the ranked stories that would be included in the
        next personalised email. No newsletter is sent from this page.
      </p>

      <section className="mt-6 rounded-lg border border-blue-100 bg-white/85 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <p className="text-sm font-semibold text-blue-700">
          Email template foundation
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">
          {template.subject}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Plain text and basic HTML versions are generated in code for future
          scheduled sending.
        </p>
      </section>

      <section className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white/85 p-5 shadow-xl shadow-blue-950/8 backdrop-blur sm:grid-cols-2 lg:grid-cols-3">
        <SummaryList label="Subscriber email" values={[subscriber.data.email]} />
        <SummaryList
          label="Delivery schedule"
          values={[deliverySummary(preferences)]}
        />
        <SummaryList label="Story count" values={[`${storyCount} stories`]} />
        <SummaryList label="Brands" values={preferences.brands} />
        <SummaryList label="Model Platforms" values={preferences.models} />
        <SummaryList label="Creators" values={preferences.creators} />
        <SummaryList label="Sources" values={preferences.sources} />
        <SummaryList label="Topics" values={preferences.topics} />
        <SummaryList label="Technology" values={preferences.technology} />
        <SummaryList label="Favourite Brands" values={favourites.brands} />
        <SummaryList
          label="Favourite Platforms"
          values={favourites.modelPlatforms}
        />
        <SummaryList label="Favourite Creators" values={favourites.creators} />
        <SummaryList label="Favourite Sources" values={favourites.sources} />
      </section>

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-slate-950">
            Ranked story list
          </h2>
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {stories.length} stories
          </span>
        </div>
        <div className="space-y-4">
          {stories.length ? (
            stories.map((story) => (
              <article
                className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-5"
                key={`${story.article.source}-${story.article.link}`}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
                  {story.article.source}
                </p>
                <h3 className="mt-2 text-2xl font-bold leading-8 text-slate-950">
                  {story.article.title}
                </h3>
                <p className="mt-3 text-base leading-7 text-slate-600">
                  {story.article.summary}
                </p>
                <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-3">
                  <p className="text-sm font-bold text-blue-950">
                    Matched because:
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(story.matchedBecause.length
                      ? story.matchedBecause
                      : ["General match"]
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
                <a
                  className="mt-4 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
                  href={story.article.link}
                  rel="noreferrer"
                  target="_blank"
                >
                  {story.article.type === "video"
                    ? "Watch on YouTube"
                    : "Read original article"}
                </a>
              </article>
            ))
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h3 className="text-xl font-bold text-slate-950">
                No matching stories yet
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This preview will populate when current feed items match the
                saved preferences or favourites.
              </p>
            </div>
          )}
        </div>
      </section>
    </PreviewShell>
  );
}
