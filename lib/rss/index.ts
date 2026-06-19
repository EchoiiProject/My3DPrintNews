import Parser from "rss-parser";

export type FeedSource = {
  id: string;
  name: string;
  url: string;
  type: "article" | "video";
  channelId?: string;
};

export type Article = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  summary: string;
  tags: string[];
  imageUrl?: string;
  type: "article" | "video";
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
  creator?: string;
  author?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  mediaGroup?: RssMediaGroup;
  mediaContent?: RssMediaValue;
  mediaThumbnail?: RssMediaValue;
  ytVideoId?: string;
  "media:group"?: RssMediaGroup;
  "media:content"?: RssMediaValue;
  "media:thumbnail"?: RssMediaValue;
  "yt:videoId"?: string;
  "content:encoded"?: string;
};

type RssMediaObject = {
  $?: {
    url?: string;
  };
  url?: string;
};

type RssMediaValue = RssMediaObject | RssMediaObject[];

type RssMediaGroup = {
  "media:description"?: string;
  "media:thumbnail"?: RssMediaValue;
  "media:title"?: string;
  mediaDescription?: string;
  mediaThumbnail?: RssMediaValue;
  mediaTitle?: string;
};

export const feedRegistry: FeedSource[] = [
  {
    id: "3d-printing-industry",
    name: "3D Printing Industry",
    url: "https://3dprintingindustry.com/feed/",
    type: "article",
  },
  {
    id: "3dprint-com",
    name: "3DPrint.com",
    url: "https://3dprint.com/feed/",
    type: "article",
  },
  {
    id: "all3dp",
    name: "All3DP",
    url: "https://all3dp.com/feed/",
    type: "article",
  },
  {
    id: "prusa-blog",
    name: "Prusa Blog",
    url: "https://blog.prusa3d.com/feed/",
    type: "article",
  },
  {
    id: "bambu-lab-blog",
    name: "Bambu Lab Blog",
    url: "https://blog.bambulab.com/feed/",
    type: "article",
  },
  {
    id: "makers-muse",
    name: "Maker's Muse",
    // TODO: Replace placeholder channel ID with the official Maker's Muse YouTube channel ID.
    channelId: "CHANNEL_ID_TODO_MAKERS_MUSE",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_TODO_MAKERS_MUSE",
    type: "video",
  },
  {
    id: "cnc-kitchen",
    name: "CNC Kitchen",
    // TODO: Replace placeholder channel ID with the official CNC Kitchen YouTube channel ID.
    channelId: "CHANNEL_ID_TODO_CNC_KITCHEN",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_TODO_CNC_KITCHEN",
    type: "video",
  },
  {
    id: "3d-printing-nerd",
    name: "3D Printing Nerd",
    // TODO: Replace placeholder channel ID with the official 3D Printing Nerd YouTube channel ID.
    channelId: "CHANNEL_ID_TODO_3D_PRINTING_NERD",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_TODO_3D_PRINTING_NERD",
    type: "video",
  },
  {
    id: "teaching-tech",
    name: "Teaching Tech",
    // TODO: Replace placeholder channel ID with the official Teaching Tech YouTube channel ID.
    channelId: "CHANNEL_ID_TODO_TEACHING_TECH",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_TODO_TEACHING_TECH",
    type: "video",
  },
  {
    id: "thomas-sanladerer",
    name: "Thomas Sanladerer",
    // TODO: Replace placeholder channel ID with the official Thomas Sanladerer YouTube channel ID.
    channelId: "CHANNEL_ID_TODO_THOMAS_SANLADERER",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_TODO_THOMAS_SANLADERER",
    type: "video",
  },
  {
    id: "aurora-tech",
    name: "Aurora Tech",
    // TODO: Replace placeholder channel ID with the official Aurora Tech YouTube channel ID.
    channelId: "CHANNEL_ID_TODO_AURORA_TECH",
    url: "https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID_TODO_AURORA_TECH",
    type: "video",
  },
];

const tagKeywords: Record<string, string[]> = {
  Bambu: ["bambu", "x1 carbon", "p1s", "bambu a1", "a1 mini"],
  Prusa: ["prusa", "mk4s", "prusa xl"],
  Creality: ["creality", "k1", "k2 plus"],
  Elegoo: ["elegoo"],
  Anycubic: ["anycubic"],
  Flashforge: ["flashforge"],
  "Maker's Muse": ["maker's muse", "makers muse"],
  "CNC Kitchen": ["cnc kitchen"],
  "3D Printing Nerd": ["3d printing nerd"],
  "Teaching Tech": ["teaching tech"],
  "Thomas Sanladerer": ["thomas sanladerer", "toms3d"],
  "Aurora Tech": ["aurora tech"],
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
      ["media:group", "mediaGroup"],
      ["yt:videoId", "ytVideoId"],
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
    item.mediaGroup?.mediaDescription,
    item.mediaGroup?.["media:description"],
    item.creator,
    item.author,
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
  const mediaGroup = item.mediaGroup ?? item["media:group"];

  return (
    mediaUrl(item.mediaContent ?? item["media:content"]) ??
    mediaUrl(item.mediaThumbnail ?? item["media:thumbnail"]) ??
    mediaUrl(mediaGroup?.mediaThumbnail ?? mediaGroup?.["media:thumbnail"]) ??
    (isImageEnclosure(item) ? item.enclosure?.url : undefined) ??
    firstImageFromHtml(item.contentEncoded ?? item["content:encoded"]) ??
    firstImageFromHtml(item.content) ??
    firstImageFromHtml(item.contentSnippet)
  );
}

function videoSummary(source: FeedSource, item: ParsedItem): string {
  const mediaGroup = item.mediaGroup ?? item["media:group"];
  const description =
    item.contentSnippet ??
    item.content ??
    item.contentEncoded ??
    item["content:encoded"] ??
    mediaGroup?.mediaDescription ??
    mediaGroup?.["media:description"] ??
    "";
  const cleanDescription = stripHtml(description);

  if (cleanDescription) {
    return cleanDescription;
  }

  return `${source.name} video: ${item.title ?? "Untitled video"}. Watch on YouTube for the full creator upload.`;
}

function normaliseArticle(source: FeedSource, item: ParsedItem): Article | null {
  if (!item.title || !item.link) {
    return null;
  }

  const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
  const summary =
    source.type === "video"
      ? videoSummary(source, item)
      : stripHtml(
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
    tags: Array.from(new Set([source.name, source.type, ...tagArticle(item)])),
    imageUrl: articleImageUrl(item),
    type: source.type,
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
