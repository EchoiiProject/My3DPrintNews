import Link from "next/link";
import { listNewsletterEditions } from "@/lib/editions";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "TBC";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default async function AdminEditionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const editions = await listNewsletterEditions();

  return (
    <AdminShell showOrganisations title="Newsletter Editions">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Edition Access"
        redirectTo="/admin/editions"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Editions</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Edition infrastructure
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Newsletter Editions
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Read-only view of saved editions that will power both browser
              editions and future email delivery.
            </p>
          </header>

          <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editions.length ? (
                    editions.map((edition) => (
                      <tr key={edition.id}>
                        <td className="px-4 py-3 font-bold text-slate-950">
                          {edition.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {edition.publicationName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(edition.editionDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {edition.frequency ?? "TBC"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {edition.itemCount}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold uppercase text-slate-600">
                            {edition.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-sm font-semibold text-slate-600"
                        colSpan={6}
                      >
                        No newsletter editions have been created yet.
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
