import { currentSite } from "@/config/current-site";
import { getLatestArticlesResult } from "@/lib/articles";
import { FeedClient } from "./feed-client";
import { placeholderStories } from "./placeholder-stories";

export const dynamic = "force-dynamic";

export default async function FeedPage() {
  const result = await getLatestArticlesResult({
    limit: 2000,
    verticalSlug: currentSite.verticalSlug,
  });
  const usingFallback =
    result.status === "unconfigured" && process.env.NODE_ENV !== "production";
  const articles = usingFallback ? placeholderStories : result.articles;

  return (
    <FeedClient
      articles={articles}
      feedLoadError={result.errorMessage}
      feedLoadStatus={result.status}
      usingFallback={usingFallback}
    />
  );
}
