export type RssFeedSource = {
  id: string;
  name: string;
  url: string;
};

export type RssFeedItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt?: string;
  summary?: string;
};

export async function fetchRssFeedItems(
  sources: RssFeedSource[],
): Promise<RssFeedItem[]> {
  void sources;

  return [];
}

export async function summariseRssFeedItem(
  item: RssFeedItem,
): Promise<RssFeedItem> {
  return item;
}
