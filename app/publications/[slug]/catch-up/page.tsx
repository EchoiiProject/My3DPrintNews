import Link from "next/link";
import { notFound } from "next/navigation";
import { getArticleArchive } from "@/lib/articles";
import {
  getPublicationByPublicSlug,
  getPublications,
  publicationAliasMap,
} from "@/lib/publications";
import {
  PublicationLinks,
  PublicationShell,
} from "../publication-components";
import { ArchiveStoryCards } from "../archive-story-cards";

const allowedWindows = [7, 14, 30];

export default async function PublicationCatchUpPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ days?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const vertical = await getPublicationByPublicSlug(slug);

  if (!vertical) {
    notFound();
  }

  const requestedDays = query?.days ? Number(query.days) : 7;
  const days = allowedWindows.includes(requestedDays) ? requestedDays : 7;
  const publications = await getPublications();
  const articles = await getArticleArchive({
    verticalSlug: vertical.slug,
    recentDays: days,
  });

  return (
    <PublicationShell
      description={`Catch up on the last ${days} days from ${vertical.name}.`}
      title={`${vertical.name} Catch Up`}
    >
      <PublicationLinks
        publications={publications}
        slug={slug}
        vertical={vertical}
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
            href={`/publications/${slug}/catch-up?days=${windowDays}`}
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
      />
    </PublicationShell>
  );
}

export function generateStaticParams() {
  return Object.keys(publicationAliasMap).map((slug) => ({ slug }));
}
