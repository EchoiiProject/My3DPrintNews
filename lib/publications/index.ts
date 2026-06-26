import type { Vertical } from "@/config/verticals";
import { getVerticalBySlug, getVerticals } from "@/lib/verticals";

const publicationAliases: Record<string, string> = {
  "3dprint": "my3dprintnews",
  bmx: "mybmxnews",
  my3dprintnews: "my3dprintnews",
  mybmxnews: "mybmxnews",
};

export function publicationPath(vertical: Vertical) {
  const alias = Object.entries(publicationAliases).find(
    ([key, value]) => value === vertical.slug && key !== vertical.slug,
  )?.[0];

  return `/publications/${alias ?? vertical.slug}`;
}

export async function getPublicationByPublicSlug(
  slug: string,
): Promise<Vertical | null> {
  return getVerticalBySlug(publicationAliases[slug] ?? slug);
}

export async function getPublications(): Promise<Vertical[]> {
  return getVerticals();
}

export const publicationAliasMap = publicationAliases;
