import { notFound, redirect } from "next/navigation";
import { currentSite } from "@/config/current-site";
import { publicNetworkEnabled } from "@/config/launch-mode";
import { balanceLatestArticles, getArticleArchive } from "@/lib/articles";
import {
  getPublicationProfileBySlug,
  getPublicationProfiles,
} from "@/lib/publications";
import { getManagedSources } from "@/lib/sources";
import {
  PublicationFeedback,
  PublicationLinks,
  PublicationShell,
  PublicationStats,
} from "./publication-components";
import { ArchiveStoryCards } from "./archive-story-cards";

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

  return {
    title: `${profile.publicationName} | My3DPrintNews`,
    description: profile.description,
    openGraph: {
      title: profile.publicationName,
      description: profile.description,
    },
  };
}

export default async function PublicationHomePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const profile = await getPublicationProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  if (!publicNetworkEnabled && profile.adminSlug !== currentSite.verticalSlug) {
    notFound();
  }

  if (!publicNetworkEnabled) {
    redirect("/");
  }

  const articles = await getArticleArchive({
    publicOnly: true,
    verticalSlug: profile.adminSlug,
  });
  const sources = await getManagedSources(profile.adminSlug);
  const publications = publicNetworkEnabled ? await getPublicationProfiles() : [];

  return (
    <PublicationShell
      activeSection="home"
      description={profile.description}
      profile={profile}
      title={profile.publicationName}
    >
      <PublicationLinks
        publications={publications}
        profile={profile}
      />
      <PublicationStats
        articleCount={articles.length}
        sourceCount={sources.length}
        profile={profile}
      />
      <ArchiveStoryCards
        articles={balanceLatestArticles(articles).slice(0, 10)}
        heading="Latest News"
        publicationId={profile.vertical.databaseId}
        publicationName={profile.publicationName}
        publicationSlug={profile.slug}
      />
      <PublicationFeedback profile={profile} />
    </PublicationShell>
  );
}
