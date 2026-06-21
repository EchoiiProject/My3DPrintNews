import type { FeedSource } from "../lib/rss";

// Reusable personalised feed engine with My3DPrintNews as the first vertical.

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

// TODO: Expand with additional verified RSS and YouTube sources as publisher
// coverage grows; keep this as the single registry rendered by /sources.
export const sourceExpansionBacklog: FeedSource[] = [];
