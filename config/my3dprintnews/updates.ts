export type UpdatePost = {
  title: string;
  date: string;
  content: string;
};

// Network-level updates. Future white-label verticals can
// provide their own updates stream while reusing the /updates page structure.
export const updatePosts: UpdatePost[] = [
  {
    title: "Building the MyNewsNetwork platform",
    date: "21 June 2026",
    content:
      "We have launched the first working version of MyNewsNetwork, including publication pages, RSS-powered article archives, source attribution, feedback capture, review-mode previews and admin foundations.",
  },
  {
    title: "Help shape what comes next",
    date: "21 June 2026",
    content:
      "We are actively improving publication coverage, archive quality, referral reporting, newsletters and licence-holder tools. If you have suggestions for sources, publishers, organisations or features, please contact us.",
  },
];
