import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { getOrganisations } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";
import { NewOrganisationForm } from "./new-organisation-form";

export default async function OrganisationsAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const organisations = await getOrganisations();
  const canView = currentUser.role === "platform_owner";

  return (
    <AdminShell showOrganisations={canView} title="Licence Holder Management">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Licence Holder Admin Access"
        redirectTo="/admin/organisations"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Licence Holders</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Super Admin
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Licence Holders
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Manage organisations that operate MyNewsNetwork publications
              under licence.
            </p>
          </header>

          {!canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Super Admin only
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Licence holder management is hidden from Publication Admin and
                Advertiser roles in this prototype.
              </p>
            </section>
          ) : (
            <>
              <NewOrganisationForm />

              <section className="mt-8 grid gap-4">
                {organisations.map((organisation) => (
                  <Link
                    className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/50"
                    href={`/admin/organisations/${organisation.id}`}
                    key={organisation.id}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-bold text-blue-700">
                          {organisation.status}
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-950">
                          {organisation.name}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {organisation.websiteUrl ?? "No website set"}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {organisation.contactEmail ?? "No contact email set"}
                        </p>
                      </div>
                      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Licensed publications
                        </p>
                        <p className="mt-1 text-2xl font-bold text-slate-950">
                          {organisation.verticals.length}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {organisation.verticals.length ? (
                        organisation.verticals.map((vertical) => (
                          <span
                            className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
                            key={vertical.id}
                          >
                            {vertical.name}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                          No publications linked
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </section>
            </>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
