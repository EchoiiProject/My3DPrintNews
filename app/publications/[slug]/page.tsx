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
  PublicationFeedback,
  PublicationLinks,
  PublicationShell,
  PublicationStats,
} from "./publication-components";

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
    <PublicationShell description={vertical.description} title={vertical.name}>
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
      <section className="mt-8">
        <h2 className="text-2xl font-bold text-slate-950">Latest stories</h2>
        <ArticleList articles={articles.slice(0, 10)} />
      </section>
      <PublicationFeedback />
    </PublicationShell>
  );
}

export function generateStaticParams() {
  return Object.keys(publicationAliasMap).map((slug) => ({ slug }));
}
