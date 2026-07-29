export type UpdatePost = {
  title: string;
  date: string;
  content: string;
};

export const updatePosts: UpdatePost[] = [
  {
    title: "Preparing My3DPrintNews for launch",
    date: "21 June 2026",
    content:
      "We have launched the first working version of My3DPrintNews, including RSS-powered article archives, source attribution, feedback capture, reader preferences and newsletter foundations.",
  },
  {
    title: "Help shape what comes next",
    date: "21 June 2026",
    content:
      "We are actively improving 3D printing coverage, archive quality, newsletters and reader tools. If you have suggestions for sources, publishers, creators or features, please contact us.",
  },
];
