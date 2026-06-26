import { notFound } from "next/navigation";
import { getArticleArchive } from "@/lib/articles";
import {
  getPublicationByPublicSlug,
  getPublications,
  publicationAliasMap,
} from "@/lib/publications";
import { getManagedSources } from "@/lib/sources";
import {
  PublicationFeedback,
  PublicationLinks,
  PublicationShell,
  PublicationStats,
} from "./publication-components";
import { ArchiveStoryCards } from "./archive-story-cards";

export default async function PublicationHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const vertical = await getPublicationByPublicSlug(slug);

  if (!vertical) {
    notFound();
  }

  const articles = await getArticleArchive({ verticalSlug: vertical.slug });
  const sources = await getManagedSources(vertical.slug);
  const publications = await getPublications();

  return (
    <PublicationShell
      description={vertical.description}
      slug={slug}
      title={vertical.name}
      vertical={vertical}
    >
      <PublicationLinks
        publications={publications}
        slug={slug}
        vertical={vertical}
      />
      <PublicationStats
        articleCount={articles.length}
        sourceCount={sources.length}
        vertical={vertical}
      />
      <ArchiveStoryCards
        articles={articles.slice(0, 10)}
        heading="Latest stories"
      />
      <PublicationFeedback vertical={vertical} />
    </PublicationShell>
  );
}

export function generateStaticParams() {
  return Object.keys(publicationAliasMap).map((slug) => ({ slug }));
}
