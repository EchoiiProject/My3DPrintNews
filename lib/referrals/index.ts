export type ReferralSourceSurface =
  | "feed"
  | "newsletter"
  | "homepage"
  | "discover_more";

export type ReferralEvent = {
  id: string;
  verticalId: string;
  articleId: string | null;
  destination: string;
  sourceSurface: ReferralSourceSurface;
  clickedAt: string;
};

export type ReferralBreakdown = {
  surface: ReferralSourceSurface;
  label: string;
  clicks: number;
  percentage: number;
};

export type ReferralDestination = {
  destination: string;
  clicks: number;
  ctr: number;
  lastClick: string;
};

export type ReferralArticle = {
  title: string;
  source: string;
  outboundClicks: number;
  destination: string;
  ctr: number;
};

export type ReferralAnalytics = {
  platformVisitors: number;
  outboundReferralClicks: number;
  overallReferralCtr: number;
  topDestination: string;
  breakdown: ReferralBreakdown[];
  topDestinations: ReferralDestination[];
  topArticles: ReferralArticle[];
  simulated: boolean;
};

const surfaceLabels: Record<ReferralSourceSurface, string> = {
  feed: "Feed referrals",
  newsletter: "Newsletter referrals",
  homepage: "Homepage referrals",
  discover_more: "Discover More referrals",
};

const demoEvents: ReferralEvent[] = [
  {
    id: "ref-demo-001",
    verticalId: "my3dprintnews",
    articleId: "article-bambu-h2d",
    destination: "Bambu Lab",
    sourceSurface: "feed",
    clickedAt: "2026-06-26T09:15:00.000Z",
  },
  {
    id: "ref-demo-002",
    verticalId: "my3dprintnews",
    articleId: "article-prusa-core-one",
    destination: "Prusa",
    sourceSurface: "newsletter",
    clickedAt: "2026-06-26T08:40:00.000Z",
  },
  {
    id: "ref-demo-003",
    verticalId: "my3dprintnews",
    articleId: "article-matterhackers-filament",
    destination: "MatterHackers",
    sourceSurface: "feed",
    clickedAt: "2026-06-25T17:25:00.000Z",
  },
  {
    id: "ref-demo-004",
    verticalId: "my3dprintnews",
    articleId: "article-bambu-h2d",
    destination: "Bambu Lab",
    sourceSurface: "homepage",
    clickedAt: "2026-06-25T12:05:00.000Z",
  },
  {
    id: "ref-demo-005",
    verticalId: "mybmxnews",
    articleId: "article-sss-racing-carbon",
    destination: "SSS Racing",
    sourceSurface: "feed",
    clickedAt: "2026-06-26T10:10:00.000Z",
  },
  {
    id: "ref-demo-006",
    verticalId: "mybmxnews",
    articleId: "article-sss-racing-carbon",
    destination: "SSS Racing",
    sourceSurface: "newsletter",
    clickedAt: "2026-06-26T07:20:00.000Z",
  },
  {
    id: "ref-demo-007",
    verticalId: "mybmxnews",
    articleId: "article-bmx-prusa-jigs",
    destination: "Prusa",
    sourceSurface: "discover_more",
    clickedAt: "2026-06-25T15:45:00.000Z",
  },
  {
    id: "ref-demo-008",
    verticalId: "mybmxnews",
    articleId: "article-bambu-track-tools",
    destination: "Bambu Lab",
    sourceSurface: "homepage",
    clickedAt: "2026-06-24T18:30:00.000Z",
  },
];

const demoArticleDetails: Record<
  string,
  Pick<ReferralArticle, "title" | "source" | "destination" | "ctr">
> = {
  "article-bambu-h2d": {
    title: "Bambu Lab H2D launch coverage drives upgrade interest",
    source: "3D Printing Industry",
    destination: "Bambu Lab",
    ctr: 8.4,
  },
  "article-prusa-core-one": {
    title: "Prusa Core One availability update",
    source: "Prusa Blog",
    destination: "Prusa",
    ctr: 6.9,
  },
  "article-matterhackers-filament": {
    title: "MatterHackers expands engineering filament range",
    source: "MatterHackers",
    destination: "MatterHackers",
    ctr: 5.2,
  },
  "article-sss-racing-carbon": {
    title: "SSS Racing carbon BMX components preview",
    source: "MyBMXNews",
    destination: "SSS Racing",
    ctr: 9.8,
  },
  "article-bmx-prusa-jigs": {
    title: "Workshop jigs for BMX race prep",
    source: "MyBMXNews",
    destination: "Prusa",
    ctr: 4.7,
  },
  "article-bambu-track-tools": {
    title: "Trackside tooling ideas for team mechanics",
    source: "MyBMXNews",
    destination: "Bambu Lab",
    ctr: 5.9,
  },
};

function percentage(part: number, total: number) {
  if (!total) return 0;

  return Math.round((part / total) * 100);
}

function ctr(clicks: number, visitors: number) {
  if (!visitors) return 0;

  return Number(((clicks / visitors) * 100).toFixed(1));
}

export function getReferralAnalytics(verticalId?: string): ReferralAnalytics {
  const events = verticalId
    ? demoEvents.filter((event) => event.verticalId === verticalId)
    : demoEvents;
  const platformVisitors = verticalId ? 1480 : 5240;
  const outboundReferralClicks = events.length * (verticalId ? 18 : 24);
  const destinations = Array.from(
    new Set(events.map((event) => event.destination)),
  );
  const topDestinations = destinations
    .map((destination) => {
      const destinationEvents = events.filter(
        (event) => event.destination === destination,
      );

      return {
        destination,
        clicks: destinationEvents.length * (verticalId ? 18 : 24),
        ctr: ctr(destinationEvents.length * (verticalId ? 18 : 24), platformVisitors),
        lastClick: destinationEvents
          .map((event) => event.clickedAt)
          .sort()
          .at(-1) ?? "2026-06-26T00:00:00.000Z",
      };
    })
    .sort((a, b) => b.clicks - a.clicks);

  const breakdown = (Object.keys(surfaceLabels) as ReferralSourceSurface[]).map(
    (surface) => {
      const clicks =
        events.filter((event) => event.sourceSurface === surface).length *
        (verticalId ? 18 : 24);

      return {
        surface,
        label: surfaceLabels[surface],
        clicks,
        percentage: percentage(clicks, outboundReferralClicks),
      };
    },
  );

  const topArticles = Array.from(
    new Set(events.map((event) => event.articleId).filter(Boolean)),
  )
    .map((articleId) => {
      const key = articleId ?? "";
      const articleEvents = events.filter((event) => event.articleId === key);
      const details = demoArticleDetails[key];

      return {
        title: details?.title ?? "Demo article",
        source: details?.source ?? "Demo source",
        outboundClicks: articleEvents.length * (verticalId ? 18 : 24),
        destination: details?.destination ?? articleEvents[0]?.destination ?? "Demo destination",
        ctr: details?.ctr ?? ctr(articleEvents.length * 18, platformVisitors),
      };
    })
    .sort((a, b) => b.outboundClicks - a.outboundClicks);

  return {
    platformVisitors,
    outboundReferralClicks,
    overallReferralCtr: ctr(outboundReferralClicks, platformVisitors),
    topDestination: topDestinations[0]?.destination ?? "No destination yet",
    breakdown,
    topDestinations,
    topArticles,
    simulated: true,
  };
}
