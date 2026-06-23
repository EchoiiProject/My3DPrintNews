export type SponsorTier = "presenting" | "supporting" | "community";

export type Sponsor = {
  id: string;
  name: string;
  logoUrl?: string;
  websiteUrl: string;
  description: string;
  vertical: string;
  active: boolean;
  featured: boolean;
  tier: SponsorTier;
  createdAt: string;
  updatedAt: string;
};

export type SponsorPlacementId = "homepage-sponsor" | "newsletter-sponsor-header";

export type SponsorPlacement = {
  id: SponsorPlacementId;
  name: string;
  description: string;
  location: string;
  enabled: boolean;
};

export const sponsorPlacements: SponsorPlacement[] = [
  {
    id: "homepage-sponsor",
    name: "Homepage Sponsor",
    description: "Understated sponsor banner near the top of a vertical homepage.",
    location: "homepage",
    enabled: true,
  },
  {
    id: "newsletter-sponsor-header",
    name: "Newsletter Sponsor Header",
    description: "Prepared sponsor header placement for future newsletters.",
    location: "newsletter",
    enabled: false,
  },
];

export const sponsors: Sponsor[] = [
  {
    id: "sss-racing",
    name: "SSS Racing",
    websiteUrl: "https://example.com/sss-racing",
    description:
      "Demo presenting sponsor for a future BMX vertical. Sample data only.",
    vertical: "mybmxnews",
    active: true,
    featured: true,
    tier: "presenting",
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    id: "prusa-research",
    name: "Prusa Research",
    websiteUrl: "https://www.prusa3d.com/",
    description:
      "Demo sponsor registry entry for platform validation. No commercial relationship implied.",
    vertical: "my3dprintnews",
    active: true,
    featured: false,
    tier: "supporting",
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    id: "bambu-lab",
    name: "Bambu Lab",
    websiteUrl: "https://bambulab.com/",
    description:
      "Demo sponsor registry entry for platform validation. No commercial relationship implied.",
    vertical: "my3dprintnews",
    active: true,
    featured: false,
    tier: "supporting",
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    id: "matterhackers",
    name: "MatterHackers",
    websiteUrl: "https://www.matterhackers.com/",
    description:
      "Demo sponsor registry entry for platform validation. No commercial relationship implied.",
    vertical: "my3dprintnews",
    active: true,
    featured: false,
    tier: "community",
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
];

export const sponsorById = Object.fromEntries(
  sponsors.map((sponsor) => [sponsor.id, sponsor]),
) as Record<string, Sponsor>;
