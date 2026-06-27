import Link from "next/link";
import { listCampaigns } from "@/lib/campaigns";
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

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const campaigns = await listCampaigns();

  return (
    <AdminShell showOrganisations title="Campaigns">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Campaign Access"
        redirectTo="/admin/campaigns"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Campaigns</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Placement infrastructure
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Campaigns
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Read-only list of future platform and licence-holder campaign
              placements.
            </p>
          </header>

          <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Campaign</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3">Owner Scope</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Starts</th>
                    <th className="px-4 py-3">Ends</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.length ? (
                    campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-950">
                            {campaign.title}
                          </p>
                          {campaign.destinationUrl ? (
                            <a
                              className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                              href={campaign.destinationUrl}
                              rel="noreferrer"
                              target="_blank"
                            >
                              Destination
                            </a>
                          ) : null}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {campaign.publicationName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {campaign.ownerScope === "licence_holder"
                            ? "Licence holder"
                            : "Platform"}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold uppercase text-slate-600">
                            {campaign.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(campaign.startAt)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(campaign.endAt)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-sm font-semibold text-slate-600"
                        colSpan={6}
                      >
                        No campaigns have been created yet.
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
