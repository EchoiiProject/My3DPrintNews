import type { FeedSource } from "../lib/rss";
import { activeFeedSources, type RegistryItem } from "./registry";

// Reusable personalised feed engine with My3DPrintNews as the first vertical.

function sourceUrl(source: RegistryItem): string {
  if (source.url) {
    return source.url;
  }

  if (source.feedType === "youtube" && source.channelId) {
    return `https://www.youtube.com/feeds/videos.xml?channel_id=${source.channelId}`;
  }

  return "";
}

export const feedRegistry: FeedSource[] = (
  activeFeedSources as readonly RegistryItem[]
).map((source) => ({
  id: source.id,
  name: source.label,
  channelId: source.channelId,
  url: sourceUrl(source),
  type: source.feedType === "youtube" ? "video" : "article",
}));

// TODO: Expand with additional verified RSS and YouTube sources as publisher
// coverage grows; keep config/registry.ts as the canonical /sources registry.
export const sourceExpansionBacklog: FeedSource[] = [];
