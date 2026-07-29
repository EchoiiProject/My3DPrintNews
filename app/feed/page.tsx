import { getLatestArticles } from "@/lib/articles";
import { FeedClient } from "./feed-client";
import { placeholderStories } from "./placeholder-stories";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const articles = await getLatestArticles();

  return (
    <FeedClient
      articles={articles.length ? articles : placeholderStories}
      usingFallback={!articles.length}
    />
  );
}
