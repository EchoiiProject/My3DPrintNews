// Reusable personalised feed engine with My3DPrintNews as the first vertical.
// This registry is the white-label boundary for selectable entities and feeds.

export type RegistryItemType =
  | "brand"
  | "model-platform"
  | "creator"
  | "source"
  | "topic"
  | "technology";

export type RegistryItem = {
  id: string;
  label: string;
  type: RegistryItemType;
  tag?: string;
  aliases?: string[];
  keywords?: string[];
  feedType?: "rss" | "youtube";
  url?: string;
  channelId?: string;
  relatedBrands?: string[];
};

export const registry = {
  brands: [
    {
      id: "bambu-lab",
      label: "Bambu Lab",
      type: "brand",
      tag: "Bambu",
      aliases: ["Bambu X1 Carbon", "Bambu P1S", "Bambu A1", "Bambu A1 Mini"],
      keywords: ["bambu", "x1 carbon", "p1s", "a1 mini", "bambu a1"],
    },
    {
      id: "prusa-research",
      label: "Prusa Research",
      type: "brand",
      tag: "Prusa",
      aliases: ["Prusa MK4S", "Prusa XL"],
      keywords: ["prusa", "mk4s", "prusa xl"],
    },
    {
      id: "creality",
      label: "Creality",
      type: "brand",
      tag: "Creality",
      aliases: ["Creality K1", "Creality K2 Plus"],
      keywords: ["creality", "k1", "k2 plus"],
    },
    {
      id: "elegoo",
      label: "Elegoo",
      type: "brand",
      tag: "Elegoo",
      keywords: ["elegoo"],
    },
    {
      id: "anycubic",
      label: "Anycubic",
      type: "brand",
      tag: "Anycubic",
      keywords: ["anycubic"],
    },
    {
      id: "flashforge",
      label: "Flashforge",
      type: "brand",
      tag: "Flashforge",
      keywords: ["flashforge"],
    },
  ],
  modelPlatforms: [
    {
      id: "printables",
      label: "Printables",
      type: "model-platform",
      tag: "Printables",
      keywords: ["printables"],
    },
    {
      id: "makerworld",
      label: "MakerWorld",
      type: "model-platform",
      tag: "MakerWorld",
      keywords: ["makerworld", "maker world"],
    },
    {
      id: "thingiverse",
      label: "Thingiverse",
      type: "model-platform",
      tag: "Thingiverse",
      keywords: ["thingiverse"],
    },
    {
      id: "thangs",
      label: "Thangs",
      type: "model-platform",
      tag: "Thangs",
      keywords: ["thangs"],
    },
    {
      id: "cults3d",
      label: "Cults3D",
      type: "model-platform",
      tag: "Cults3D",
      keywords: ["cults3d", "cults"],
    },
  ],
  creators: [
    {
      id: "makers-muse",
      label: "Maker's Muse",
      type: "creator",
      tag: "Maker's Muse",
      feedType: "youtube",
      channelId: "CHANNEL_ID_TODO_MAKERS_MUSE",
      keywords: ["maker's muse", "makers muse"],
    },
    {
      id: "cnc-kitchen",
      label: "CNC Kitchen",
      type: "creator",
      tag: "CNC Kitchen",
      feedType: "youtube",
      channelId: "CHANNEL_ID_TODO_CNC_KITCHEN",
      keywords: ["cnc kitchen"],
    },
    {
      id: "3d-printing-nerd",
      label: "3D Printing Nerd",
      type: "creator",
      tag: "3D Printing Nerd",
      feedType: "youtube",
      channelId: "CHANNEL_ID_TODO_3D_PRINTING_NERD",
      keywords: ["3d printing nerd"],
    },
    {
      id: "teaching-tech",
      label: "Teaching Tech",
      type: "creator",
      tag: "Teaching Tech",
      feedType: "youtube",
      channelId: "CHANNEL_ID_TODO_TEACHING_TECH",
      keywords: ["teaching tech"],
    },
    {
      id: "thomas-sanladerer",
      label: "Thomas Sanladerer",
      type: "creator",
      tag: "Thomas Sanladerer",
      feedType: "youtube",
      channelId: "CHANNEL_ID_TODO_THOMAS_SANLADERER",
      keywords: ["thomas sanladerer", "toms3d"],
    },
    {
      id: "aurora-tech",
      label: "Aurora Tech",
      type: "creator",
      tag: "Aurora Tech",
      feedType: "youtube",
      channelId: "CHANNEL_ID_TODO_AURORA_TECH",
      keywords: ["aurora tech"],
    },
  ],
  sources: [
    {
      id: "3d-printing-industry",
      label: "3D Printing Industry",
      type: "source",
      feedType: "rss",
      url: "https://3dprintingindustry.com/feed/",
    },
    {
      id: "3dprint-com",
      label: "3DPrint.com",
      type: "source",
      feedType: "rss",
      url: "https://3dprint.com/feed/",
    },
    {
      id: "all3dp",
      label: "All3DP",
      type: "source",
      feedType: "rss",
      url: "https://all3dp.com/feed/",
    },
    {
      id: "prusa-blog",
      label: "Prusa Blog",
      type: "source",
      feedType: "rss",
      url: "https://blog.prusa3d.com/feed/",
      relatedBrands: ["prusa-research"],
    },
    {
      id: "bambu-lab-blog",
      label: "Bambu Lab Blog",
      type: "source",
      feedType: "rss",
      url: "https://blog.bambulab.com/feed/",
      relatedBrands: ["bambu-lab"],
    },
  ],
  topics: [
    {
      id: "new-printers",
      label: "New Printers",
      type: "topic",
      tag: "New Printers",
      keywords: ["new printer", "launch", "announces", "released", "debut"],
    },
    {
      id: "reviews",
      label: "Reviews",
      type: "topic",
      tag: "Reviews",
      keywords: ["review", "reviews", "tested", "hands-on", "benchmark"],
    },
    {
      id: "firmware-updates",
      label: "Firmware Updates",
      type: "topic",
      tag: "Firmware",
      keywords: ["firmware", "software update", "input shaping"],
    },
    {
      id: "3d-models-designs",
      label: "3D Models / Designs",
      type: "topic",
      tag: "Models",
      keywords: ["model", "models", "design", "printables", "makerworld"],
    },
    {
      id: "filament-materials",
      label: "Filament & Materials",
      type: "topic",
      tag: "Materials",
      keywords: ["material", "materials", "filament", "pla", "petg", "nylon"],
    },
    {
      id: "accessories",
      label: "Accessories",
      type: "topic",
      tag: "Accessories",
      keywords: ["accessory", "accessories", "upgrade", "hotend", "build plate"],
    },
    {
      id: "deals-discounts",
      label: "Deals & Discounts",
      type: "topic",
      tag: "Deals",
      keywords: ["deal", "deals", "discount", "sale", "bundle", "coupon"],
    },
    {
      id: "tutorials-guides",
      label: "Tutorials & Guides",
      type: "topic",
      tag: "Tutorials",
      keywords: ["tutorial", "tutorials", "guide", "how to", "calibration"],
    },
  ],
  technologies: [
    {
      id: "fdm-fff",
      label: "FDM / FFF",
      type: "technology",
      tag: "FDM",
      keywords: ["fdm", "fff", "filament"],
    },
    {
      id: "resin",
      label: "Resin",
      type: "technology",
      tag: "Resin",
      keywords: ["resin", "sla", "msla", "dlp"],
    },
    {
      id: "sls-mjf",
      label: "SLS / MJF",
      type: "technology",
      tag: "SLS",
      keywords: ["sls", "mjf", "powder bed"],
    },
    {
      id: "industrial-professional",
      label: "Industrial / Professional",
      type: "technology",
      tag: "Industrial",
      keywords: ["industrial", "professional", "production", "service bureau"],
    },
  ],
} as const satisfies Record<string, readonly RegistryItem[]>;

export const allFeedSources = [
  ...registry.sources,
  ...registry.creators.filter((creator) => creator.feedType === "youtube"),
];
