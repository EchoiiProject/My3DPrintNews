import {
  adminSlugForPublicationSlug,
  publicationSlugByAdminSlug,
  publicationSlugForVertical,
  type Vertical,
} from "@/config/verticals";
import { getVerticalBySlug, getVerticals } from "@/lib/verticals";

const publicationAliases: Record<string, string> = {
  ...Object.fromEntries(
    Object.entries(publicationSlugByAdminSlug).map(([adminSlug, publicSlug]) => [
      publicSlug,
      adminSlug,
    ]),
  ),
  my3dprintnews: "my3dprintnews",
  mybmxnews: "mybmxnews",
};

export function publicationPath(vertical: Vertical) {
  return `/publications/${publicationSlugForVertical(vertical)}`;
}

export type PublicationProfile = {
  publicationName: string;
  description: string;
  slug: string;
  adminSlug: string;
  publicationType: "industry" | "interest" | "place";
  defaultCollections: string[];
  hostname: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  primaryColour: string | null;
  visibility: "private" | "demo" | "public";
  publicationStatus: "draft" | "live" | "archived";
  showFeedback: boolean;
  showNewsletterSignup: boolean;
  showInDiscover: boolean;
  vertical: Vertical;
};

export function publicationProfileFromVertical(
  vertical: Vertical,
): PublicationProfile {
  return {
    publicationName: vertical.publicationName ?? vertical.name,
    description:
      vertical.publicationDescription ??
      vertical.description ??
      "Specialist news, updates and original-source links.",
    slug: publicationSlugForVertical(vertical),
    adminSlug: vertical.slug,
    publicationType: vertical.publicationType ?? "industry",
    defaultCollections: vertical.defaultCollections ?? [],
    hostname: vertical.hostname ?? null,
    logoUrl: vertical.logoUrl ?? null,
    heroImageUrl: vertical.heroImageUrl ?? null,
    primaryColour: vertical.primaryColour ?? null,
    visibility: vertical.visibility ?? "public",
    publicationStatus: vertical.publicationStatus ?? "live",
    showFeedback: vertical.showFeedback ?? true,
    showNewsletterSignup: vertical.showNewsletterSignup ?? true,
    showInDiscover: vertical.showInDiscover ?? true,
    vertical,
  };
}

export async function getPublicationByPublicSlug(
  slug: string,
): Promise<Vertical | null> {
  return getVerticalBySlug(publicationAliases[slug] ?? slug);
}

export async function getPublicationProfileBySlug(
  slug: string,
): Promise<PublicationProfile | null> {
  const vertical = await getPublicationByPublicSlug(slug);

  return vertical ? publicationProfileFromVertical(vertical) : null;
}

export async function getPublications(): Promise<Vertical[]> {
  return (await getVerticals()).filter(
    (vertical) => vertical.showInDiscover !== false,
  );
}

export async function getPublicationProfiles(): Promise<PublicationProfile[]> {
  return (await getPublications()).map(publicationProfileFromVertical);
}

export const publicationAliasMap = {
  ...publicationAliases,
  ...Object.fromEntries(
    Object.values(publicationSlugByAdminSlug).map((slug) => [
      slug,
      adminSlugForPublicationSlug(slug) ?? slug,
    ]),
  ),
};
