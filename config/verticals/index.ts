export type Vertical = {
  id: string;
  name: string;
  slug: string;
  domain: string;
  description: string;
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
    ownerName: "Demo BMX Owner",
    ownerEmail: "bmx-owner@example.com",
    sponsorId: "sss-racing",
    active: true,
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z",
  },
];

export const demoAdminUsers: DemoAdminUser[] = [
  {
    id: "peter-rawling",
    name: "Peter Rawling",
    label: "Super Admin",
    role: "platform_owner",
    assignedVerticalIds: verticals.map((vertical) => vertical.id),
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
    return verticals;
  }

  return verticals.filter((vertical) =>
    user.assignedVerticalIds.includes(vertical.id),
  );
}
