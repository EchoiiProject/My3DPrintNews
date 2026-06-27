import { notFound } from "next/navigation";
import { getArticleArchive } from "@/lib/articles";
import {
  getPublicationProfileBySlug,
  getPublicationProfiles,
} from "@/lib/publications";
import { getManagedSources } from "@/lib/sources";
import {
  FeedFilters,
  PublicationLinks,
  PublicationShell,
} from "../publication-components";
import { ArchiveStoryCards } from "../archive-story-cards";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicationProfileBySlug(slug);

  if (!profile) {
    return {};
  }

  const title = `${profile.publicationName} Feed`;

  return {
    title: `${title} | MyNewsNetwork`,
    description: profile.description,
    openGraph: {
      title,
      description: profile.description,
    },
  };
}

export default async function PublicationFeedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ recent?: string; source?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = await getPublicationProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const recentDays = query?.recent ? Number(query.recent) : undefined;
  const sources = await getManagedSources(profile.adminSlug);
  const publications = await getPublicationProfiles();
  const articles = await getArticleArchive({
    verticalSlug: profile.adminSlug,
    sourceId: query?.source || undefined,
    recentDays: Number.isFinite(recentDays) ? recentDays : undefined,
  });

  return (
    <PublicationShell
      description={`Archived feed stories from ${profile.publicationName}.`}
      profile={profile}
      title={`${profile.publicationName} Feed`}
    >
      <PublicationLinks
        publications={publications}
        profile={profile}
      />
      <FeedFilters
        currentRecent={query?.recent}
        currentSourceId={query?.source}
        sources={sources}
      />
      <ArchiveStoryCards
        articles={articles}
        heading="Archived feed stories"
        publicationId={profile.vertical.databaseId}
        publicationName={profile.publicationName}
        publicationSlug={profile.slug}
      />
    </PublicationShell>
  );
}
