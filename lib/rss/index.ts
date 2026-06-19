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
  imageUrl?: string;
};

type ParsedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  contentEncoded?: string;
  categories?: string[];
  enclosure?: {
    url?: string;
    type?: string;
  };
  mediaContent?: RssMediaValue;
  mediaThumbnail?: RssMediaValue;
  "media:content"?: RssMediaValue;
  "media:thumbnail"?: RssMediaValue;
  "content:encoded"?: string;
};

type RssMediaObject = {
  $?: {
    url?: string;
  };
  url?: string;
};

type RssMediaValue = RssMediaObject | RssMediaObject[];

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
  Creality: ["creality", "k1", "k2 plus"],
  Elegoo: ["elegoo"],
  Anycubic: ["anycubic"],
  Flashforge: ["flashforge"],
  "New Printers": ["new printer", "launch", "announces", "released", "debut"],
  Reviews: ["review", "tested", "hands-on", "benchmark"],
  Firmware: ["firmware", "software update", "input shaping"],
  Materials: ["material", "filament", "resin", "pla", "petg", "nylon"],
  Models: ["model", "design", "printables", "makerworld", "thingiverse"],
  Accessories: ["accessory", "accessories", "upgrade", "hotend", "build plate"],
  Deals: ["deal", "discount", "sale", "bundle", "coupon"],
  Tutorials: ["tutorial", "guide", "how to", "calibration", "beginner"],
  FDM: ["fdm", "fff", "filament"],
  Resin: ["resin", "sla", "msla", "dlp"],
  SLS: ["sls", "mjf", "powder bed"],
  Industrial: ["industrial", "professional", "production", "service bureau"],
};

const parser = new Parser<unknown, ParsedItem>({
  timeout: 10000,
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["content:encoded", "contentEncoded"],
    ],
  },
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

function mediaUrl(value: RssMediaValue | undefined): string | undefined {
  const media = Array.isArray(value) ? value[0] : value;

  return media?.url ?? media?.$?.url;
}

function firstImageFromHtml(value: string | undefined): string | undefined {
  const match = value?.match(/<img[^>]+src=["']([^"']+)["']/i);

  return match?.[1];
}

function isImageEnclosure(item: ParsedItem): boolean {
  const enclosureType = item.enclosure?.type?.toLowerCase() ?? "";
  const enclosureUrl = item.enclosure?.url?.toLowerCase() ?? "";

  return (
    enclosureType.startsWith("image/") ||
    /\.(avif|gif|jpe?g|png|webp)(\?|#|$)/.test(enclosureUrl)
  );
}

function articleImageUrl(item: ParsedItem): string | undefined {
  return (
    mediaUrl(item.mediaContent ?? item["media:content"]) ??
    mediaUrl(item.mediaThumbnail ?? item["media:thumbnail"]) ??
    (isImageEnclosure(item) ? item.enclosure?.url : undefined) ??
    firstImageFromHtml(item.contentEncoded ?? item["content:encoded"]) ??
    firstImageFromHtml(item.content) ??
    firstImageFromHtml(item.contentSnippet)
  );
}

function normaliseArticle(source: FeedSource, item: ParsedItem): Article | null {
  if (!item.title || !item.link) {
    return null;
  }

  const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
  const summary = stripHtml(
    item.contentSnippet ??
      item.content ??
      item.contentEncoded ??
      item["content:encoded"] ??
      "",
  );

  return {
    title: item.title,
    link: item.link,
    source: source.name,
    publishedAt,
    summary: summary || "Publisher summary unavailable. Read the original article for full details.",
    tags: tagArticle(item),
    imageUrl: articleImageUrl(item),
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
