import { fetchFeeds } from "@/lib/rss";
import { placeholderStories } from "../feed/placeholder-stories";
import { CatchUpClient } from "./catch-up-client";

export const dynamic = "force-dynamic";

export default async function CatchUpPage() {
  const articles = await fetchFeeds();
  const feedArticles = articles.length ? articles : placeholderStories;

  return (
    <CatchUpClient articles={feedArticles} usingFallback={!articles.length} />
  );
}
