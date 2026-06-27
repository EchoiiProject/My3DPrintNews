import { notFound } from "next/navigation";
import { balanceLatestArticles, getArticleArchive } from "@/lib/articles";
import {
  getPublicationProfileBySlug,
  getPublicationProfiles,
} from "@/lib/publications";
import { getManagedSources } from "@/lib/sources";
import {
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

  const title = `${profile.publicationName} Latest News`;

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

  const selectedRecent = query?.recent ?? "30";
  const showAllDates = selectedRecent === "all";
  const recentDays = showAllDates ? undefined : Number(selectedRecent);
  const archiveRecentDays =
    !showAllDates && Number.isFinite(recentDays) ? recentDays : undefined;
  const sources = await getManagedSources(profile.adminSlug);
  const publications = await getPublicationProfiles();
  const articles = await getArticleArchive({
    publicOnly: true,
    verticalSlug: profile.adminSlug,
    sourceId: query?.source || undefined,
    recentDays: archiveRecentDays,
  });
  const countArticles = await getArticleArchive({
    publicOnly: true,
    verticalSlug: profile.adminSlug,
    recentDays: archiveRecentDays,
  });

  return (
    <PublicationShell
      activeSection="latest"
      description={`Latest archived stories from ${profile.publicationName}.`}
      profile={profile}
      title={`${profile.publicationName} Latest News`}
    >
      <PublicationLinks
        publications={publications}
        profile={profile}
      />
      <ArchiveStoryCards
        articles={balanceLatestArticles(articles, {
          maxAgeDays: showAllDates ? null : 30,
        })}
        countArticles={countArticles}
        currentRecent={selectedRecent}
        currentSourceId={query?.source}
        heading="Latest News"
        publicationId={profile.vertical.databaseId}
        publicationName={profile.publicationName}
        publicationSlug={profile.slug}
        sources={sources}
      />
    </PublicationShell>
  );
}
