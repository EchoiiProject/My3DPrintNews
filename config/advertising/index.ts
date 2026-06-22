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
  supportedFormats: string[];
  recommendedPrice: string;
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
  name: string;
  vertical: string;
  advertiser: string;
  status: "Draft" | "Active" | "Paused" | "Expired";
  startDate: string;
  endDate: string;
  price: string;
  ctaLabel: string;
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
    supportedFormats: ["Sponsored card", "Image optional"],
    recommendedPrice: "£950 / month",
    enabled: false,
  },
  {
    id: "feed-inline-1",
    name: "Feed Inline 1",
    description: "Inline sponsor card after several feed stories.",
    location: "feed",
    supportedFormats: ["Sponsored card", "Text + CTA", "Image optional"],
    recommendedPrice: "£750 / month",
    enabled: true,
  },
  {
    id: "feed-inline-2",
    name: "Feed Inline 2",
    description: "Secondary inline sponsor card deeper in the feed.",
    location: "feed",
    supportedFormats: ["Sponsored card", "Text + CTA", "Image optional"],
    recommendedPrice: "£550 / month",
    enabled: false,
  },
  {
    id: "feed-sidebar",
    name: "Feed Sidebar",
    description: "Compact sponsor placement in the feed sidebar.",
    location: "feed",
    supportedFormats: ["Compact card", "Text + CTA"],
    recommendedPrice: "£450 / month",
    enabled: false,
  },
  {
    id: "newsletter-header",
    name: "Newsletter Header",
    description: "Sponsor placement prepared for the top of newsletters.",
    location: "newsletter",
    supportedFormats: ["Email banner", "Text + CTA"],
    recommendedPrice: "£850 / month",
    enabled: false,
  },
  {
    id: "newsletter-inline",
    name: "Newsletter Inline",
    description: "Sponsor placement prepared between newsletter stories.",
    location: "newsletter",
    supportedFormats: ["Email inline card", "Text + CTA"],
    recommendedPrice: "£650 / month",
    enabled: false,
  },
  {
    id: "sources-sidebar",
    name: "Sources Sidebar",
    description: "Sponsor placement for the expanded source selector.",
    location: "sources",
    supportedFormats: ["Sidebar card", "Text + CTA"],
    recommendedPrice: "£350 / month",
    enabled: false,
  },
  {
    id: "updates-sidebar",
    name: "Updates Sidebar",
    description: "Sponsor placement for platform updates pages.",
    location: "updates",
    supportedFormats: ["Sidebar card", "Text + CTA"],
    recommendedPrice: "£300 / month",
    enabled: false,
  },
];

export const adCampaigns: AdCampaign[] = [
  {
    id: "test-prusa-research",
    name: "Prusa workflow campaign",
    vertical: "my3dprintnews",
    advertiser: "Prusa Research",
    status: "Active",
    startDate: "2026-06-01",
    endDate: "2026-06-30",
    price: "£750 / month",
    ctaLabel: "Learn more",
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
    name: "Bambu launch spotlight",
    vertical: "my3dprintnews",
    advertiser: "Bambu Lab",
    status: "Paused",
    startDate: "2026-07-01",
    endDate: "2026-07-31",
    price: "£550 / month",
    ctaLabel: "Learn more",
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
    name: "MatterHackers supplier feature",
    vertical: "my3dprintnews",
    advertiser: "MatterHackers",
    status: "Draft",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    price: "£450 / month",
    ctaLabel: "Learn more",
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
  {
    id: "test-bmx-supplier-launch",
    name: "BMX supplier launch campaign",
    vertical: "mybmxnews",
    advertiser: "Prototype BMX Supplier",
    status: "Expired",
    startDate: "2026-05-01",
    endDate: "2026-05-31",
    price: "£500 / month",
    ctaLabel: "View launch",
    active: false,
    creative: {
      id: "test-bmx-supplier-feed",
      headline: "New supplier launch for specialist vertical feeds",
      description:
        "White-label example campaign showing that advertising inventory is platform-level.",
      targetUrl: "https://example.com/",
    },
    placements: ["homepage-hero", "feed-inline-1"],
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
