export type Vertical = {
  id: string;
  databaseId?: string;
  name: string;
  slug: string;
  publicationName?: string;
  publicationDescription?: string;
  publicationSlug?: string;
  hostname?: string | null;
  visibility?: "private" | "demo" | "public";
  publicationStatus?: "draft" | "live" | "archived";
  autoFetchEnabled?: boolean;
  showInDiscover?: boolean;
  showNewsletterSignup?: boolean;
  showFeedback?: boolean;
  logoUrl?: string | null;
  heroImageUrl?: string | null;
  primaryColour?: string | null;
  domain: string;
  description: string;
  sector: string;
  status: "active" | "coming-soon";
  relatedVerticalIds: string[];
  publicUrl: string;
  subscriberCount: number;
  comingSoon: boolean;
  logo: string;
  ownerName: string;
  ownerEmail: string;
  sponsorId: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OwnershipRole = "platform_owner" | "vertical_owner" | "advertiser";

export type OwnershipRoleDefinition = {
  id: OwnershipRole;
  name: string;
  description: string;
  scope: string;
};

export type DemoAdminUserId =
  | "peter-rawling"
  | "sss-racing-admin"
  | "demo-advertiser";

export type DemoAdminUser = {
  id: DemoAdminUserId;
  name: string;
  label: string;
  role: OwnershipRole;
  assignedVerticalIds: string[];
  assignedCampaignIds: string[];
};

export const ownershipRoles: OwnershipRoleDefinition[] = [
  {
    id: "platform_owner",
    name: "Super Admin",
    description:
      "Can manage all verticals, platform tools, subscribers, sources, updates, and analytics.",
    scope: "all verticals",
  },
  {
    id: "vertical_owner",
    name: "Vertical Admin",
    description:
      "Can manage only assigned verticals and their related platform objects.",
    scope: "assigned vertical",
  },
  {
    id: "advertiser",
    name: "Advertiser",
    description: "Can view only assigned campaigns and campaign reporting.",
    scope: "assigned campaigns",
  },
];

export const verticals: Vertical[] = [
  {
    id: "my3dprintnews",
    name: "My3DPrintNews",
    slug: "my3dprintnews",
    publicationName: "My3DPrintNews",
    publicationDescription:
      "Daily news, reviews and industry insight from the global 3D printing sector.",
    publicationSlug: "3dprint",
    hostname: "3dprint.mynewsnetwork.uk",
    visibility: "public",
    publicationStatus: "live",
    autoFetchEnabled: true,
    showInDiscover: true,
    showNewsletterSignup: true,
    showFeedback: true,
    domain: "my3dprintnews.vercel.app",
    description: "Personalised 3D printing news, videos, products, and updates.",
    sector: "Making and manufacturing",
    status: "active",
    relatedVerticalIds: ["mymakernews", "mymanufacturingnews", "mycncnews"],
    publicUrl: "/",
    subscriberCount: 1280,
    comingSoon: false,
    logo: "3D",
    ownerName: "Demo Platform Owner",
    ownerEmail: "owner@example.com",
    sponsorId: null,
    active: true,
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    id: "mybmxnews",
    name: "MyBMXNews",
    slug: "mybmxnews",
    publicationName: "MyBMXNews",
    publicationSlug: "bmx",
    hostname: "bmx.mynewsnetwork.uk",
    visibility: "demo",
    publicationStatus: "draft",
    autoFetchEnabled: true,
    showInDiscover: true,
    showNewsletterSignup: true,
    showFeedback: true,
    domain: "mybmxnews.example.com",
    description: "Demo BMX vertical for reusable personalised feed products.",
    sector: "Cycling and action sports",
    status: "active",
    relatedVerticalIds: ["mycyclingnews", "mymountainbikenews", "mymotonews"],
    publicUrl: "/discover-more",
    subscriberCount: 420,
    comingSoon: false,
    logo: "BX",
    ownerName: "Demo BMX Owner",
    ownerEmail: "bmx-owner@example.com",
    sponsorId: "sss-racing",
    active: true,
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
  {
    id: "mycyclingnews",
    name: "MyCyclingNews",
    slug: "mycyclingnews",
    domain: "mycyclingnews.example.com",
    description: "Personalised cycling news and updates.",
    sector: "Cycling",
    status: "coming-soon",
    relatedVerticalIds: ["mybmxnews", "mymountainbikenews", "mymotonews"],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "CY",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "mymountainbikenews",
    name: "MyMountainBikeNews",
    slug: "mymountainbikenews",
    domain: "mymountainbikenews.example.com",
    description: "Personalised mountain bike news and gear updates.",
    sector: "Cycling",
    status: "coming-soon",
    relatedVerticalIds: ["mybmxnews", "mycyclingnews", "mymotonews"],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "MTB",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "mymotonews",
    name: "MyMotoNews",
    slug: "mymotonews",
    domain: "mymotonews.example.com",
    description: "Personalised moto news and industry updates.",
    sector: "Motorsport",
    status: "coming-soon",
    relatedVerticalIds: ["mybmxnews", "mycyclingnews", "mymountainbikenews"],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "MO",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "mymakernews",
    name: "MyMakerNews",
    slug: "mymakernews",
    domain: "mymakernews.example.com",
    description: "Personalised maker culture and workshop news.",
    sector: "Making",
    status: "coming-soon",
    relatedVerticalIds: ["my3dprintnews", "mymanufacturingnews", "mycncnews"],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "MK",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "mymanufacturingnews",
    name: "MyManufacturingNews",
    slug: "mymanufacturingnews",
    domain: "mymanufacturingnews.example.com",
    description: "Personalised manufacturing news and technology updates.",
    sector: "Manufacturing",
    status: "coming-soon",
    relatedVerticalIds: ["my3dprintnews", "mymakernews", "mycncnews"],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "MF",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "mycncnews",
    name: "MyCNCNews",
    slug: "mycncnews",
    domain: "mycncnews.example.com",
    description: "Personalised CNC machining news and tooling updates.",
    sector: "Manufacturing",
    status: "coming-soon",
    relatedVerticalIds: ["my3dprintnews", "mymakernews", "mymanufacturingnews"],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "CN",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "mydronenews",
    name: "MyDroneNews",
    slug: "mydronenews",
    domain: "mydronenews.example.com",
    description: "Personalised drone industry news and operator updates.",
    sector: "Drones",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "DR",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "myrcnews",
    name: "MyRCNews",
    slug: "myrcnews",
    domain: "myrcnews.example.com",
    description: "Personalised radio control hobby news and product updates.",
    sector: "Hobbies",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "RC",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "myphotographynews",
    name: "MyPhotographyNews",
    slug: "myphotographynews",
    domain: "myphotographynews.example.com",
    description: "Personalised photography news, creator tools, and gear updates.",
    sector: "Photography",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "PH",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "myfishingnews",
    name: "MyFishingNews",
    slug: "myfishingnews",
    domain: "myfishingnews.example.com",
    description: "Personalised fishing news, venues, and tackle updates.",
    sector: "Fishing",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "FI",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "myainews",
    name: "MyAINews",
    slug: "myainews",
    domain: "myainews.example.com",
    description: "Personalised AI news, tools, research, and product updates.",
    sector: "Artificial intelligence",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "AI",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "myroboticsnews",
    name: "MyRoboticsNews",
    slug: "myroboticsnews",
    domain: "myroboticsnews.example.com",
    description: "Personalised robotics news, automation, and hardware updates.",
    sector: "Robotics",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "RB",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
  {
    id: "myelectricbikenews",
    name: "MyElectricBikeNews",
    slug: "myelectricbikenews",
    domain: "myelectricbikenews.example.com",
    description: "Personalised electric bike news, commuting, and product updates.",
    sector: "Electric bikes",
    status: "coming-soon",
    relatedVerticalIds: [],
    publicUrl: "/discover-more",
    subscriberCount: 0,
    comingSoon: true,
    logo: "EB",
    ownerName: "Demo Platform Owner",
    ownerEmail: "platform-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
];

export const publicationSlugByAdminSlug: Record<string, string> = {
  my3dprintnews: "3dprint",
  mybmxnews: "bmx",
};

export function adminSlugForPublicationSlug(slug: string): string | undefined {
  return Object.entries(publicationSlugByAdminSlug).find(
    ([, publicationSlug]) => publicationSlug === slug,
  )?.[0];
}

export function publicSlugForAdminSlug(slug: string): string | undefined {
  return publicationSlugByAdminSlug[slug];
}

export function publicationSlugForVertical(vertical: Vertical): string {
  return vertical.publicationSlug ?? publicSlugForAdminSlug(vertical.slug) ?? vertical.slug;
}

export const demoAdminUsers: DemoAdminUser[] = [
  {
    id: "peter-rawling",
    name: "Peter Rawling",
    label: "Super Admin",
    role: "platform_owner",
    assignedVerticalIds: verticals
      .filter((vertical) => vertical.status === "active")
      .map((vertical) => vertical.id),
    assignedCampaignIds: [],
  },
  {
    id: "sss-racing-admin",
    name: "SSS Racing",
    label: "MyBMXNews Vertical Admin",
    role: "vertical_owner",
    assignedVerticalIds: ["mybmxnews"],
    assignedCampaignIds: [],
  },
  {
    id: "demo-advertiser",
    name: "Demo Advertiser",
    label: "Demo Advertiser",
    role: "advertiser",
    assignedVerticalIds: [],
    assignedCampaignIds: ["test-prusa-research"],
  },
];

export function verticalBySlug(slug: string): Vertical | undefined {
  return verticals.find((vertical) => vertical.slug === slug);
}

export function demoUserById(id: string | undefined): DemoAdminUser {
  return (
    demoAdminUsers.find((user) => user.id === id) ?? demoAdminUsers[0]
  );
}

export function visibleVerticalsForUser(user: DemoAdminUser): Vertical[] {
  if (user.role === "platform_owner") {
    return verticals.filter((vertical) => vertical.status === "active");
  }

  return verticals.filter((vertical) =>
    user.assignedVerticalIds.includes(vertical.id),
  );
}
