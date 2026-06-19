import Link from "next/link";
import { fetchFeeds } from "@/lib/rss";
import { FeedClient } from "../feed/feed-client";
import { placeholderStories } from "../feed/placeholder-stories";

const filters = [
  "Last 7 days",
  "Last 14 days",
  "Last 30 days",
  "My Favourites",
  "My Focus",
];

export const dynamic = "force-dynamic";

export default async function CatchUpPage() {
  const articles = await fetchFeeds();

  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] px-6 pt-8 text-slate-950 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl rounded-lg border border-blue-100 bg-white/80 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Link
              className="text-lg font-bold tracking-tight text-slate-950"
              href="/"
            >
              My3DPrintNews
            </Link>
            <Link className="text-sm font-bold text-blue-700" href="/feed">
              Live Feed
            </Link>
          </div>
          <h1 className="mt-6 text-4xl font-bold text-slate-950">Catch Up</h1>
          <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
            See the stories, videos and updates you may have missed.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                key={filter}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>
      <FeedClient
        articles={articles.length ? articles : placeholderStories}
        usingFallback={!articles.length}
      />
    </div>
  );
}
