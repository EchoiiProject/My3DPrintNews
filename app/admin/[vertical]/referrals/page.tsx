import Link from "next/link";
import { notFound } from "next/navigation";
import { demoUserById } from "@/config/verticals";
import { getReferralAnalytics } from "@/lib/referrals";
import { getVerticalBySlug } from "@/lib/verticals";
import { AdminAccessGate } from "../../admin-access";
import { AdminShell } from "../../admin-shell";
import { ReferralAnalyticsDashboard } from "../../referrals/referral-analytics-dashboard";

export default async function VerticalReferralAnalyticsPage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const { vertical: verticalSlug } = await params;
  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical) {
    notFound();
  }

  const query = await searchParams;
  const currentUser = demoUserById(query?.view);
  const canView =
    currentUser.role === "platform_owner" ||
    currentUser.assignedVerticalIds.includes(vertical.id);

  if (!canView) {
    notFound();
  }

  const analytics = getReferralAnalytics(vertical.id);

  return (
    <AdminShell
      showOrganisations={currentUser.role === "platform_owner"}
      title={`${vertical.name} Referrals`}
    >
      <AdminAccessGate
        error={query?.error}
        loginTitle={`${vertical.name} Referral Access`}
        redirectTo={`/admin/${vertical.slug}/referrals`}
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
                href={`/admin/${vertical.slug}`}
              >
                {vertical.name}
              </Link>
              <span>/</span>
              <span>Referral Analytics</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Demo referral reporting
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {vertical.name} Referrals
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Show the referral traffic this vertical is generating for its
              owner and commercial partners.
            </p>
          </header>

          <div className="mt-8">
            <ReferralAnalyticsDashboard
              analytics={analytics}
              scopeName={vertical.name}
            />
          </div>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
