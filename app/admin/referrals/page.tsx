import Link from "next/link";
import { demoUserById } from "@/config/verticals";
import { getReferralAnalytics } from "@/lib/referrals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";
import { ReferralAnalyticsDashboard } from "./referral-analytics-dashboard";

export default async function ReferralAnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const canView =
    currentUser.role === "platform_owner" ||
    currentUser.role === "vertical_owner";
  const analytics = getReferralAnalytics();

  return (
    <AdminShell
      showOrganisations={currentUser.role === "platform_owner"}
      title="Referral Analytics"
    >
      <AdminAccessGate
        error={params?.error}
        loginTitle="Referral Analytics Access"
        redirectTo="/admin/referrals"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Referral Analytics</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Demo referral reporting
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Referral Analytics
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Demonstrate how verticals send readers to sponsors, publishers,
              product partners, and destination sites.
            </p>
          </header>

          {!canView ? (
            <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <h2 className="text-2xl font-bold text-slate-950">
                Referral access unavailable
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Referral analytics are available to Super Admin and Vertical
                Admin roles.
              </p>
            </section>
          ) : (
            <div className="mt-8">
              <ReferralAnalyticsDashboard
                analytics={analytics}
                scopeName="all active verticals"
              />
            </div>
          )}
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
