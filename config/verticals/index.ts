export type Vertical = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  description: string;
  sector: string;
  status: "active" | "coming-soon";
  relatedVerticalIds: string[];
  publicUrl: string;
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
    domain: "my3dprintnews.vercel.app",
    description: "Personalised 3D printing news, videos, products, and updates.",
    sector: "Making and manufacturing",
    status: "active",
    relatedVerticalIds: ["mymakernews", "mymanufacturingnews", "mycncnews"],
    publicUrl: "/",
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
    domain: "mybmxnews.example.com",
    description: "Demo BMX vertical for reusable personalised feed products.",
    sector: "Cycling and action sports",
    status: "active",
    relatedVerticalIds: ["mycyclingnews", "mymountainbikenews", "mymotonews"],
    publicUrl: "/admin/mybmxnews",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
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
    publicUrl: "/network",
    ownerName: "Demo Network Owner",
    ownerEmail: "network-owner@example.com",
    sponsorId: null,
    active: false,
    createdAt: "2026-06-25T00:00:00.000Z",
    updatedAt: "2026-06-25T00:00:00.000Z",
  },
];

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
