import Parser from "rss-parser";

export type FeedSource = {
  id: string;
  name: string;
  url: string;
};

export type Article = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  tags: string[];
};

type ParsedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  categories?: string[];
};

export const feedRegistry: FeedSource[] = [
  {
    id: "3d-printing-industry",
    name: "3D Printing Industry",
    url: "https://3dprintingindustry.com/feed/",
  },
  {
    id: "3dprint-com",
    name: "3DPrint.com",
    url: "https://3dprint.com/feed/",
  },
  {
    id: "all3dp",
    name: "All3DP",
    url: "https://all3dp.com/feed/",
  },
  {
    id: "prusa-blog",
    name: "Prusa Blog",
    url: "https://blog.prusa3d.com/feed/",
  },
  {
    id: "bambu-lab-blog",
    name: "Bambu Lab Blog",
    url: "https://blog.bambulab.com/feed/",
  },
];

const tagKeywords: Record<string, string[]> = {
  Bambu: ["bambu", "x1 carbon", "p1s", "bambu a1", "a1 mini"],
  Prusa: ["prusa", "mk4s", "prusa xl"],
  "New Printers": ["new printer", "launch", "announces", "released", "debut"],
  Reviews: ["review", "tested", "hands-on", "benchmark"],
  Firmware: ["firmware", "software update", "input shaping"],
  Materials: ["material", "filament", "resin", "pla", "petg", "nylon"],
  Models: ["model", "design", "printables", "makerworld", "thingiverse"],
  FDM: ["fdm", "fff", "filament"],
  Resin: ["resin", "sla", "msla", "dlp"],
};

const parser = new Parser<unknown, ParsedItem>({
  timeout: 10000,
});

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagArticle(item: ParsedItem): string[] {
  const text = [
    item.title,
    item.contentSnippet,
    item.content,
    ...(item.categories ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return Object.entries(tagKeywords)
    .filter(([, keywords]) => keywords.some((keyword) => text.includes(keyword)))
    .map(([tag]) => tag);
}

function normaliseArticle(source: FeedSource, item: ParsedItem): Article | null {
  if (!item.title || !item.link) {
    return null;
  }

  const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
  const summary = stripHtml(item.contentSnippet ?? item.content ?? "");

  return {
    title: item.title,
    link: item.link,
    source: source.name,
    publishedAt,
    summary: summary || "Publisher summary unavailable. Read the original article for full details.",
    tags: tagArticle(item),
  };
}

export async function fetchFeeds(
  sources: FeedSource[] = feedRegistry,
): Promise<Article[]> {
  const settledFeeds = await Promise.allSettled(
    sources.map(async (source) => {
      const feed = await parser.parseURL(source.url);

      return feed.items
        .map((item) => normaliseArticle(source, item))
        .filter((article): article is Article => Boolean(article));
    }),
  );

  return settledFeeds
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, 30);
}
