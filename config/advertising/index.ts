export type AdPlacementId =
  | "homepage-hero"
  | "feed-inline-1"
  | "feed-inline-2"
  | "feed-sidebar"
  | "newsletter-header"
  | "newsletter-inline"
  | "sources-sidebar"
  | "updates-sidebar";

export type AdPlacement = {
  id: AdPlacementId;
  name: string;
  description: string;
  location: string;
  enabled: boolean;
};

export type AdCreative = {
  id: string;
  headline: string;
  description: string;
  image?: string;
  targetUrl: string;
};

export type AdCampaign = {
  id: string;
  advertiser: string;
  active: boolean;
  creative: AdCreative;
  placements: AdPlacementId[];
};

export const adPlacements: AdPlacement[] = [
  {
    id: "homepage-hero",
    name: "Homepage Hero",
    description: "Prominent sponsor slot near the homepage onboarding area.",
    location: "homepage",
    enabled: false,
  },
  {
    id: "feed-inline-1",
    name: "Feed Inline 1",
    description: "Inline sponsor card after several feed stories.",
    location: "feed",
    enabled: true,
  },
  {
    id: "feed-inline-2",
    name: "Feed Inline 2",
    description: "Secondary inline sponsor card deeper in the feed.",
    location: "feed",
    enabled: false,
  },
  {
    id: "feed-sidebar",
    name: "Feed Sidebar",
    description: "Compact sponsor placement in the feed sidebar.",
    location: "feed",
    enabled: false,
  },
  {
    id: "newsletter-header",
    name: "Newsletter Header",
    description: "Sponsor placement prepared for the top of newsletters.",
    location: "newsletter",
    enabled: false,
  },
  {
    id: "newsletter-inline",
    name: "Newsletter Inline",
    description: "Sponsor placement prepared between newsletter stories.",
    location: "newsletter",
    enabled: false,
  },
  {
    id: "sources-sidebar",
    name: "Sources Sidebar",
    description: "Sponsor placement for the expanded source selector.",
    location: "sources",
    enabled: false,
  },
  {
    id: "updates-sidebar",
    name: "Updates Sidebar",
    description: "Sponsor placement for platform updates pages.",
    location: "updates",
    enabled: false,
  },
];

export const adCampaigns: AdCampaign[] = [
  {
    id: "test-prusa-research",
    advertiser: "Prusa Research",
    active: true,
    creative: {
      id: "test-prusa-feed",
      headline: "Explore reliable desktop 3D printing workflows",
      description:
        "A test campaign slot for validating sponsor inventory across feed products.",
      targetUrl: "https://www.prusa3d.com/",
    },
    placements: ["feed-inline-1", "newsletter-header"],
  },
  {
    id: "test-bambu-lab",
    advertiser: "Bambu Lab",
    active: true,
    creative: {
      id: "test-bambu-feed",
      headline: "Fast setup for modern maker workspaces",
      description:
        "Sample creative used to prove reusable advertising placement rendering.",
      targetUrl: "https://bambulab.com/",
    },
    placements: ["feed-inline-2", "newsletter-inline"],
  },
  {
    id: "test-matterhackers",
    advertiser: "MatterHackers",
    active: true,
    creative: {
      id: "test-matterhackers-sources",
      headline: "Materials, tools, and 3D printing supplies",
      description:
        "Placeholder sponsor record for future source and sidebar inventory.",
      targetUrl: "https://www.matterhackers.com/",
    },
    placements: ["feed-sidebar", "sources-sidebar", "updates-sidebar"],
  },
];

export function campaignForPlacement(
  placementId: AdPlacementId,
): AdCampaign | null {
  const placement = adPlacements.find((item) => item.id === placementId);

  if (!placement?.enabled) {
    return null;
  }

  return (
    adCampaigns.find(
      (campaign) =>
        campaign.active && campaign.placements.includes(placementId),
    ) ?? null
  );
}
