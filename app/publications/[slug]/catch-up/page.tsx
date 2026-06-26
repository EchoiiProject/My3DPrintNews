import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleArchive } from "@/lib/articles";
import {
  getPublicationProfileBySlug,
  getPublicationProfiles,
} from "@/lib/publications";
import {
  PublicationLinks,
  PublicationShell,
} from "../publication-components";
import { ArchiveStoryCards } from "../archive-story-cards";

export const dynamic = "force-dynamic";

const allowedWindows = [7, 14, 30];

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

  const title = `${profile.publicationName} Catch Up`;

  return {
    title: `${title} | MyNewsNetwork`,
    description: profile.description,
    openGraph: {
      title,
      description: profile.description,
    },
  };
}

export default async function PublicationCatchUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ days?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const profile = await getPublicationProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const requestedDays = query?.days ? Number(query.days) : 7;
  const days = allowedWindows.includes(requestedDays) ? requestedDays : 7;
  const publications = await getPublicationProfiles();
  const articles = await getArticleArchive({
    verticalSlug: profile.adminSlug,
    recentDays: days,
  });

  return (
    <PublicationShell
      description={`Catch up on the last ${days} days from ${profile.publicationName}.`}
      profile={profile}
      title={`${profile.publicationName} Catch Up`}
    >
      <PublicationLinks
        publications={publications}
        profile={profile}
      />
      <div className="mt-8 flex flex-wrap gap-2">
        {allowedWindows.map((windowDays) => (
          <Link
            className={[
              "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold",
              windowDays === days
                ? "border-blue-500 bg-blue-600 text-white"
                : "border-blue-200 bg-white text-blue-700",
            ].join(" ")}
            href={`/publications/${profile.slug}/catch-up?days=${windowDays}`}
            key={windowDays}
          >
            {windowDays} days
          </Link>
        ))}
      </div>
      <ArchiveStoryCards
        articles={articles}
        heading={`Stories from the last ${days} days`}
        periodDays={days}
        publicationName={profile.publicationName}
      />
    </PublicationShell>
  );
}
