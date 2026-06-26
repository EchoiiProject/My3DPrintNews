import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { getArticleArchive } from "@/lib/articles";
import { getManagedSources } from "@/lib/sources";
import { getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";
import { ArticleArchiveTable } from "./article-archive-table";

export default async function ArticleArchivePage({
  searchParams,
}: {
  searchParams?: Promise<{
    error?: string;
    recent?: string;
    source?: string;
    vertical?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const canView =
    currentUser.role === "platform_owner" ||
    currentUser.role === "vertical_owner";
  const recentDays = params?.recent ? Number(params.recent) : undefined;
  const verticals = await getVerticals();
  const sources = await getManagedSources(params?.vertical);
  const articles = await getArticleArchive({
    verticalSlug: params?.vertical || undefined,
    sourceId: params?.source || undefined,
    recentDays: Number.isFinite(recentDays) ? recentDays : undefined,
  });

  return (
    <AdminShell
      showOrganisations={currentUser.role === "platform_owner"}
      title="Article Archive"
    >
      <AdminAccessGate
        error={params?.error}
        loginTitle="Article Archive Access"
        redirectTo="/admin/articles"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Articles</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Article archive
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Article Archive
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review articles collected from publication RSS source libraries.
            </p>
          </header>

          {canView ? (
            <div className="mt-8">
              <ArticleArchiveTable
                articles={articles}
                currentRecent={params?.recent}
                currentSourceId={params?.source}
                currentVertical={params?.vertical}
                sources={sources}
                verticals={verticals}
              />
            </div>
          ) : (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Article access unavailable
              </h2>
            </section>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
