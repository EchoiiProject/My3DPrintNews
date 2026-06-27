import Link from "next/link";
import { listEditorialCases } from "@/lib/editorial";
import { AdminAccessGate } from "../admin-access";
import { EditorialActionButtons } from "../editorial-action-buttons";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function EditorialGovernancePage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const cases = await listEditorialCases();

  return (
    <AdminShell showOrganisations title="Editorial Governance">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Editorial Governance Access"
        redirectTo="/admin/editorial"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Editorial</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Governance
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Editorial Governance
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review reader reports, licence-holder requests, and platform
              overrides. Autopilot stays on unless an exception is recorded.
            </p>
          </header>

          <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Case</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3">Item</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Raised</th>
                    <th className="px-4 py-3">Platform Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cases.length ? (
                    cases.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-950">
                            {item.severity}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.raisedByRole}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.publicationName}
                        </td>
                        <td className="max-w-sm px-4 py-3 text-slate-700">
                          {item.articleTitle ??
                            item.campaignTitle ??
                            "Network-level concern"}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {item.reason}
                          {item.notes ? (
                            <p className="mt-1 text-xs text-slate-500">
                              {item.notes}
                            </p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold uppercase text-slate-600">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="min-w-72 px-4 py-3">
                          <EditorialActionButtons
                            actions={[
                              {
                                actionType: "pause_article",
                                label: "Pause article",
                              },
                              {
                                actionType: "resume_article",
                                label: "Resume article",
                              },
                              {
                                actionType: "hide_from_publication",
                                label: "Hide article",
                              },
                              {
                                actionType: "block_platform_wide",
                                label: "Block platform-wide",
                              },
                              {
                                actionType: "resolve_case",
                                label: "Resolve case",
                              },
                              {
                                actionType: "dismiss_case",
                                label: "Dismiss case",
                              },
                            ]}
                            articleId={item.articleId}
                            caseId={item.id}
                            role="platform"
                            verticalId={item.verticalId}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-sm font-semibold text-slate-600"
                        colSpan={7}
                      >
                        No editorial cases have been raised yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
