import { notFound } from "next/navigation";
import { getArticleArchive } from "@/lib/articles";
import {
  getPublicationProfileBySlug,
  getPublicationProfiles,
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
    title: `${profile.publicationName} | MyNewsNetwork`,
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

  const articles = await getArticleArchive({ verticalSlug: profile.adminSlug });
  const sources = await getManagedSources(profile.adminSlug);
  const publications = await getPublicationProfiles();

  return (
    <PublicationShell
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
        articles={articles.slice(0, 10)}
        heading="Latest stories"
        publicationName={profile.publicationName}
      />
      <PublicationFeedback profile={profile} />
    </PublicationShell>
  );
}

export function generateStaticParams() {
  return Object.keys(publicationAliasMap).map((slug) => ({ slug }));
}
