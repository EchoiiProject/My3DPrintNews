import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { getOrganisations } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

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
    <AdminShell showOrganisations={canView} title="Organisation Management">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Organisation Admin Access"
        redirectTo="/admin/organisations"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Organisations</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Super Admin
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Organisations
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Manage organisation records that own or operate vertical
              publications.
            </p>
          </header>

          {!canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Super Admin only
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Organisation management is hidden from Vertical Admin and
                Advertiser roles in this prototype.
              </p>
            </section>
          ) : (
            <>
              <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-950">
                      New Organisation
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-blue-900">
                      Mock creation form for onboarding a future vertical owner.
                      Saving will be connected after real auth and write
                      permissions are in place.
                    </p>
                  </div>
                  <button
                    className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                    type="button"
                  >
                    New Organisation
                  </button>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {[
                    "Organisation name",
                    "Website URL",
                    "Logo URL",
                    "Contact email",
                    "Notes",
                  ].map((field) => (
                    <label className="block" key={field}>
                      <span className="text-sm font-bold text-blue-950">
                        {field}
                      </span>
                      <input
                        className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
                        placeholder="Prototype only"
                        readOnly
                      />
                    </label>
                  ))}
                </div>
              </section>

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
                          Linked verticals
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
                          No verticals linked
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
