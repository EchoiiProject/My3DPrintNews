import Link from "next/link";
import { notFound } from "next/navigation";
import { sponsorById } from "@/config/sponsors";
import { demoUserById } from "@/config/verticals";
import { getOrganisationById } from "@/lib/verticals";
import { AdminAccessGate } from "../../admin-access";
import { AdminShell } from "../../admin-shell";
import { NewVerticalForm } from "./new-vertical-form";

export default async function OrganisationDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const currentUser = demoUserById(query?.view);
  const organisation = await getOrganisationById(id);

  if (!organisation) {
    notFound();
  }

  const canView = currentUser.role === "platform_owner";

  return (
    <AdminShell
      showOrganisations={canView}
      title={`${organisation.name} Organisation`}
    >
      <AdminAccessGate
        error={query?.error}
        loginTitle="Organisation Admin Access"
        redirectTo={`/admin/organisations/${organisation.id}`}
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
                href="/admin/organisations"
              >
                Organisations
              </Link>
              <span>/</span>
              <span>{organisation.name}</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Organisation profile
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {organisation.name}
            </h1>
          </header>

          {!canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Super Admin only
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Organisation profiles are restricted to Super Admin in this
                prototype.
              </p>
            </section>
          ) : (
            <>
              <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_22rem]">
                <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
                  <h2 className="text-2xl font-bold text-slate-950">
                    Profile
                  </h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Website
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {organisation.websiteUrl ?? "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Contact email
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {organisation.contactEmail ?? "Not set"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Owned verticals
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {organisation.verticals.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Onboarding status
                      </p>
                      <p className="mt-1 text-sm font-semibold text-emerald-700">
                        {organisation.status === "active"
                          ? "Active"
                          : "Prospect"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50/80 p-5">
                  <h2 className="text-2xl font-bold text-blue-950">
                    Sponsor relationships
                  </h2>
                  <div className="mt-4 space-y-2">
                    {organisation.verticals.some((vertical) => vertical.sponsorId) ? (
                      organisation.verticals.map((vertical) =>
                        vertical.sponsorId ? (
                          <p
                            className="rounded-md border border-blue-100 bg-white/80 px-3 py-2 text-sm font-semibold text-blue-900"
                            key={vertical.id}
                          >
                            {vertical.name}:{" "}
                            {sponsorById[vertical.sponsorId]?.name ??
                              vertical.sponsorId}
                          </p>
                        ) : null,
                      )
                    ) : (
                      <p className="text-sm leading-6 text-blue-900">
                        No sponsor relationships configured.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
                <h2 className="text-2xl font-bold text-slate-950">
                  Owned verticals
                </h2>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {organisation.verticals.map((vertical) => (
                    <Link
                      className="rounded-md border border-slate-200 bg-slate-50/70 p-4 transition hover:border-blue-200 hover:bg-blue-50/60"
                      href={`/admin/${vertical.slug}`}
                      key={vertical.id}
                    >
                      <p className="text-sm font-bold text-blue-700">
                        {vertical.status}
                      </p>
                      <h3 className="mt-1 text-xl font-bold text-slate-950">
                        {vertical.name}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {vertical.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              <NewVerticalForm organisationId={organisation.id} />
            </>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
