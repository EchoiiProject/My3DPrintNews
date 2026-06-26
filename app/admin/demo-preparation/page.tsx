import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { getOrganisations, getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";
import { DemoPreparationWizard } from "./demo-preparation-wizard";

export default async function DemoPreparationPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const canView = currentUser.role === "platform_owner";
  const organisations = await getOrganisations();
  const verticals = await getVerticals();

  return (
    <AdminShell showOrganisations={canView} title="Demo Preparation">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Demo Preparation Access"
        redirectTo="/admin/demo-preparation"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Demo Preparation</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Super Admin workflow
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Prepare New Demo
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Prepare a private publication demonstration before a sales
              meeting. This workflow does not publish or assign a licence
              holder.
            </p>
          </header>

          {!canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Super Admin only
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Demo preparation is restricted to Super Admin in this
                prototype.
              </p>
            </section>
          ) : (
            <div className="mt-8">
              <DemoPreparationWizard
                organisations={organisations}
                verticals={verticals}
              />
            </div>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
