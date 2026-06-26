import { notFound } from "next/navigation";
import { getArticleArchive } from "@/lib/articles";
import {
  getPublicationByPublicSlug,
  getPublications,
  publicationAliasMap,
} from "@/lib/publications";
import { getManagedSources } from "@/lib/sources";
import {
  ArticleList,
  FeedFilters,
  PublicationLinks,
  PublicationShell,
} from "../publication-components";

export default async function PublicationFeedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ recent?: string; source?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const vertical = await getPublicationByPublicSlug(slug);

  if (!vertical) {
    notFound();
  }

  const recentDays = query?.recent ? Number(query.recent) : undefined;
  const sources = await getManagedSources(vertical.slug);
  const publications = await getPublications();
  const articles = await getArticleArchive({
    verticalSlug: vertical.slug,
    sourceId: query?.source || undefined,
    recentDays: Number.isFinite(recentDays) ? recentDays : undefined,
  });

  return (
    <PublicationShell
      description={`Archived feed stories from ${vertical.name}.`}
      title={`${vertical.name} Feed`}
    >
      <PublicationLinks
        publications={publications}
        slug={slug}
        vertical={vertical}
      />
      <FeedFilters
        currentRecent={query?.recent}
        currentSourceId={query?.source}
        sources={sources}
      />
      <ArticleList articles={articles} />
    </PublicationShell>
  );
}

export function generateStaticParams() {
  return Object.keys(publicationAliasMap).map((slug) => ({ slug }));
}
