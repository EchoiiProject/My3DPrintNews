import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { checkRssSources } from "@/lib/rss/diagnostics";
import { getManagedSources, sourceDiagnostics } from "@/lib/sources";
import { getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";
import { SourceManagementClient } from "./source-management-client";

export const dynamic = "force-dynamic";

export default async function SourceManagementPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const canView =
    currentUser.role === "platform_owner" ||
    currentUser.role === "vertical_owner";
  const verticals = await getVerticals();
  const visibleVerticals =
    currentUser.role === "platform_owner"
      ? verticals
      : verticals.filter((vertical) =>
          currentUser.assignedVerticalIds.includes(vertical.id),
        );
  const sources = canView ? await getManagedSources() : [];
  const feedDiagnostics = canView ? await checkRssSources(sources) : [];
  const diagnostics = await sourceDiagnostics(
    undefined,
    sources,
    feedDiagnostics,
  );

  return (
    <AdminShell
      showOrganisations={currentUser.role === "platform_owner"}
      title="Source Management"
    >
      <AdminAccessGate
        error={params?.error}
        loginTitle="Source Management Access"
        redirectTo="/admin/sources"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Sources</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Feed operations
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Publication Source Management Centre
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Manage, monitor, and improve the quality of each publication&apos;s
              RSS-powered news feed.
            </p>
          </header>

          {!canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Source access unavailable
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Source management is available to Super Admin and Publication
                Admin roles.
              </p>
            </section>
          ) : (
            <div className="mt-8">
              <SourceManagementClient
                diagnostics={diagnostics}
                sources={sources}
                verticals={visibleVerticals}
              />
            </div>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
