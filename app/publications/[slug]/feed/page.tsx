import { notFound } from "next/navigation";
import {
  articleCollection,
  balanceLatestArticles,
  getArticleArchive,
} from "@/lib/articles";
import {
  getPublicationProfileBySlug,
  getPublicationProfiles,
} from "@/lib/publications";
import { getManagedSources } from "@/lib/sources";
import {
  PublicationFeedControls,
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
  searchParams?: Promise<{
    collection?: string;
    range?: string;
    recent?: string;
    source?: string;
  }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = await getPublicationProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const sources = await getManagedSources(profile.adminSlug);
  const publications = await getPublicationProfiles();
  const todayArticles = await getArticleArchive({
    publicOnly: true,
    verticalSlug: profile.adminSlug,
    recentDays: 1,
  });
  const selectedRange = query?.range ?? query?.recent ?? (todayArticles.length ? "today" : "7d");
  const rangeDays =
    selectedRange === "today"
      ? 1
      : selectedRange === "7d"
        ? 7
        : selectedRange === "14d"
          ? 14
          : selectedRange === "month"
            ? 30
            : selectedRange === "all"
              ? undefined
              : 7;
  const selectedCollection = query?.collection ?? "all";
  const showAllDates = selectedRange === "all";
  const articles = await getArticleArchive({
    publicOnly: true,
    verticalSlug: profile.adminSlug,
    sourceId: query?.source || undefined,
    recentDays: rangeDays,
  });
  const countArticles = await getArticleArchive({
    publicOnly: true,
    verticalSlug: profile.adminSlug,
    recentDays: rangeDays,
  });
  const collectionArticles =
    selectedCollection === "all"
      ? articles
      : articles.filter(
          (article) =>
            articleCollection(article).toLowerCase() === selectedCollection,
        );

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
      <PublicationFeedControls
        articles={countArticles}
        currentCollection={selectedCollection}
        currentRange={selectedRange}
        currentSourceId={query?.source}
        publicationSlug={profile.slug}
        sources={sources}
      />
      <ArchiveStoryCards
        articles={balanceLatestArticles(collectionArticles, {
          maxAgeDays: showAllDates ? null : (rangeDays ?? 30),
        })}
        currentCollection={selectedCollection}
        countArticles={countArticles}
        currentRange={selectedRange}
        currentSourceId={query?.source}
        heading="Latest News"
        publicationId={profile.vertical.databaseId}
        publicationName={profile.publicationName}
        publicationSlug={profile.slug}
        showFeedControls={false}
        sources={sources}
      />
    </PublicationShell>
  );
}
