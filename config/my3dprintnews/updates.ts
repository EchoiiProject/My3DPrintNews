export type UpdatePost = {
  title: string;
  date: string;
  content: string;
};

// Network-level updates. Future white-label verticals can
// provide their own updates stream while reusing the /updates page structure.
export const updatePosts: UpdatePost[] = [
  {
    title: "Building the first personalised 3D printing feed",
    date: "21 June 2026",
    content:
      "We have launched the first working version of MyNewsNetwork, including personalised feed selection, RSS-powered articles, creator video feeds, source attribution, favourites, focus mode and newsletter signup foundations.",
  },
  {
    title: "Help shape what comes next",
    date: "21 June 2026",
    content:
      "We are actively improving source coverage, feed matching, favourites, saved feeds and catch-up views. If you have suggestions for sources, creators, publishers or features, please contact us.",
  },
];
