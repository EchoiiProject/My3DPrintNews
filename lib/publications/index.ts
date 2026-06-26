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

export async function getPublicationByPublicSlug(
  slug: string,
): Promise<Vertical | null> {
  return getVerticalBySlug(publicationAliases[slug] ?? slug);
}

export async function getPublications(): Promise<Vertical[]> {
  return (await getVerticals()).filter(
    (vertical) => vertical.showInDiscover !== false,
  );
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
