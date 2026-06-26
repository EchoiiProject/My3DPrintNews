export type AdPlacementId =
  | "homepage-hero"
  | "feed-inline-1"
  | "feed-inline-2"
  | "feed-sidebar"
  | "newsletter-header"
  | "newsletter-inline"
  | "sources-sidebar"
  | "updates-sidebar"
  | "featured-product"
  | "sponsored-story"
  | "event-spotlight";

export type AdPlacementStatus = "active" | "planned";

export type AdPlacement = {
  id: AdPlacementId;
  name: string;
  description: string;
  location: string;
  format: string;
  audience: string;
  notes: string;
  supportedFormats: string[];
  recommendedPrice: string;
  status: AdPlacementStatus;
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
    format: "premium hero sponsorship",
    audience: "all visitors",
    notes: "Best for broad awareness and major launches.",
    supportedFormats: ["Hero sponsorship", "Text + CTA", "Image optional"],
    recommendedPrice: "£500/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "feed-inline-1",
    name: "Feed Inline #1",
    description: "Inline sponsor card after several feed stories.",
    location: "feed",
    format: "native sponsored card",
    audience: "feed readers",
    notes: "Primary live inventory for lightweight sponsor validation.",
    supportedFormats: ["Sponsored card", "Text + CTA", "Image optional"],
    recommendedPrice: "£250/month",
    status: "active",
    enabled: true,
  },
  {
    id: "feed-inline-2",
    name: "Feed Inline #2",
    description: "Secondary inline sponsor card deeper in the feed.",
    location: "feed",
    format: "native sponsored card",
    audience: "high-engagement readers",
    notes: "Useful once the feed has enough depth for a second inline slot.",
    supportedFormats: ["Sponsored card", "Text + CTA", "Image optional"],
    recommendedPrice: "£175/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "feed-sidebar",
    name: "Feed Sidebar",
    description: "Compact sponsor placement in the feed sidebar.",
    location: "feed",
    format: "supplier spotlight",
    audience: "desktop feed readers",
    notes: "Best for suppliers, marketplaces, services, and recurring offers.",
    supportedFormats: ["Supplier spotlight", "Compact card", "Text + CTA"],
    recommendedPrice: "£200/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "newsletter-header",
    name: "Newsletter Header",
    description: "Sponsor placement prepared for the top of newsletters.",
    location: "newsletter",
    format: "newsletter sponsor",
    audience: "subscribers",
    notes: "High-visibility email sponsor placement for future sending.",
    supportedFormats: ["Email banner", "Text + CTA"],
    recommendedPrice: "£750/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "newsletter-inline",
    name: "Newsletter Inline",
    description: "Sponsor placement prepared between newsletter stories.",
    location: "newsletter",
    format: "sponsored newsletter block",
    audience: "subscribers",
    notes: "Best for contextual offers within a personalised update.",
    supportedFormats: ["Email inline card", "Text + CTA"],
    recommendedPrice: "£400/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "sources-sidebar",
    name: "Sources Page Sponsor",
    description: "Sponsor placement for the expanded source selector.",
    location: "sources",
    format: "supplier / source discovery sponsor",
    audience: "users configuring their feed",
    notes: "Useful for discovery-stage buyers and active feed builders.",
    supportedFormats: ["Discovery sponsor", "Sidebar card", "Text + CTA"],
    recommendedPrice: "£150/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "updates-sidebar",
    name: "Updates Page Sponsor",
    description: "Sponsor placement for platform updates pages.",
    location: "updates",
    format: "platform update sponsor",
    audience: "product followers",
    notes: "Good for partners who want visibility with engaged followers.",
    supportedFormats: ["Update sponsor", "Sidebar card", "Text + CTA"],
    recommendedPrice: "£125/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "featured-product",
    name: "Featured Product",
    description: "Product-style sponsor card for buyer-oriented placements.",
    location: "cross-site",
    format: "product card",
    audience: "buyers / enthusiasts",
    notes: "Best for hardware, materials, accessories, and services.",
    supportedFormats: ["Product card", "Text + CTA", "Image optional"],
    recommendedPrice: "£300/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "sponsored-story",
    name: "Sponsored Story",
    description: "Sponsored article-style card for editorial-adjacent content.",
    location: "cross-site",
    format: "sponsored article-style card",
    audience: "readers",
    notes: "Best for longer partner messages that must remain clearly labelled.",
    supportedFormats: ["Sponsored story", "Text + CTA", "Image optional"],
    recommendedPrice: "£500/month",
    status: "planned",
    enabled: false,
  },
  {
    id: "event-spotlight",
    name: "Event Spotlight",
    description: "Event promotion placement for webinars, launches, and shows.",
    location: "cross-site",
    format: "event promotion card",
    audience: "enthusiasts / industry visitors",
    notes: "Best for time-bound events, launches, and industry programmes.",
    supportedFormats: ["Event card", "Text + CTA", "Date optional"],
    recommendedPrice: "£200/month",
    status: "planned",
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
    price: "£250/month",
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
    price: "£175/month",
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
    price: "£200/month",
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
    price: "£500/month",
    ctaLabel: "View launch",
    active: false,
    creative: {
      id: "test-bmx-supplier-feed",
      headline: "New supplier launch for specialist publication feeds",
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
