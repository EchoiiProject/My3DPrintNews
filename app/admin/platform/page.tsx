import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

function currentEnvironment() {
  return process.env.VERCEL ? "Vercel Hobby" : "Unknown";
}

export default async function PlatformSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const canView = currentUser.role === "platform_owner";

  return (
    <AdminShell showOrganisations title="Platform Settings">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Platform Settings Access"
        redirectTo="/admin/platform"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Platform Settings</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Platform operations
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Platform Settings
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review deployment-level settings for article archive automation.
            </p>
          </header>

          {canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Automatic Article Fetch
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Automatic Fetch
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">ON</p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Current Schedule
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    Daily (02:00 UTC)
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Current Environment
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {currentEnvironment()}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    Current scheduler: Daily
                  </p>
                </div>
                <div className="rounded-md border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Preferred Schedule
                  </p>
                  <div className="mt-3 space-y-2 text-sm font-semibold text-slate-700">
                    <label className="flex items-center gap-2">
                      <input checked readOnly type="radio" />
                      Daily
                    </label>
                    <label className="flex items-center gap-2">
                      <input readOnly type="radio" />
                      Every 4 Hours (Requires Vercel Pro)
                    </label>
                    <label className="flex items-center gap-2">
                      <input readOnly type="radio" />
                      Manual Only
                    </label>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Platform settings unavailable
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Platform settings are available to Super Admin roles.
              </p>
            </section>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
