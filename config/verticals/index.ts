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

export const ownershipRoles: OwnershipRoleDefinition[] = [
  {
    id: "platform_owner",
    name: "Platform Owner",
    description: "Can manage all verticals and platform-level settings.",
    scope: "all verticals",
  },
  {
    id: "vertical_owner",
    name: "Vertical Owner",
    description: "Can manage only assigned verticals.",
    scope: "assigned vertical",
  },
  {
    id: "advertiser",
    name: "Advertiser",
    description: "Can manage only assigned campaigns.",
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

export function verticalBySlug(slug: string): Vertical | undefined {
  return verticals.find((vertical) => vertical.slug === slug);
}
