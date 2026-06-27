import Link from "next/link";
import { notFound } from "next/navigation";
import { demoUserById } from "@/config/verticals";
import { getArticleArchive } from "@/lib/articles";
import { getManagedSources } from "@/lib/sources";
import { getVerticalBySlug } from "@/lib/verticals";
import { AdminAccessGate } from "../../admin-access";
import { AdminShell } from "../../admin-shell";
import { ArticleArchiveTable } from "../../articles/article-archive-table";

export default async function VerticalArticleArchivePage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams?: Promise<{
    error?: string;
    recent?: string;
    source?: string;
    view?: string;
  }>;
}) {
  const { vertical: verticalSlug } = await params;
  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical) {
    notFound();
  }

  const query = await searchParams;
  const currentUser = demoUserById(query?.view);
  const canView =
    currentUser.role === "platform_owner" ||
    currentUser.assignedVerticalIds.includes(vertical.id);

  if (!canView) {
    notFound();
  }

  const recentDays = query?.recent ? Number(query.recent) : undefined;
  const sources = await getManagedSources(vertical.slug);
  const articles = await getArticleArchive({
    verticalSlug: vertical.slug,
    sourceId: query?.source || undefined,
    recentDays: Number.isFinite(recentDays) ? recentDays : undefined,
  });

  return (
    <AdminShell
      currentPublicationSlug={vertical.slug}
      showOrganisations={currentUser.role === "platform_owner"}
      title={`${vertical.name} Articles`}
    >
      <AdminAccessGate
        error={query?.error}
        loginTitle={`${vertical.name} Article Access`}
        redirectTo={`/admin/${vertical.slug}/articles`}
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <Link
                className="text-blue-700 hover:text-blue-900"
                href={`/admin/${vertical.slug}`}
              >
                {vertical.name}
              </Link>
              <span>/</span>
              <span>Articles</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Article archive
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {vertical.name} Articles
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review archived articles collected from this publication&apos;s
              enabled RSS sources.
            </p>
          </header>

          <div className="mt-8">
            <ArticleArchiveTable
              articles={articles}
              currentRecent={query?.recent}
              currentSourceId={query?.source}
              currentVertical={vertical.slug}
              editorialRole={
                currentUser.role === "platform_owner"
                  ? "platform"
                  : "licence_holder"
              }
              sources={sources}
              verticalLocked
              verticals={[vertical]}
            />
          </div>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
