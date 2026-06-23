import Link from "next/link";
import { redirect } from "next/navigation";
import {
  adminPasswordMatches,
  clearAdminAccessSession,
  hasAdminAccess,
  isAdminAccessConfigured,
  setAdminAccessSession,
} from "@/lib/admin-auth";
import { AdPlacement } from "../../ad-placement";
import { FooterLinks } from "../../footer-links";
import { GlobalNav } from "../../global-nav";
import {
  adCampaigns,
  adPlacements,
  AdCampaign,
} from "../../../config/advertising";
import {
  EventSpotlightDemo,
  FeaturedProductDemo,
  HomepageHeroDemo,
  NewsletterHeaderDemo,
  SponsoredStoryDemo,
  SupplierSpotlightDemo,
} from "./showroom";

function statusClass(status: AdCampaign["status"]): string {
  if (status === "Active") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "Paused") {
    return "border-amber-100 bg-amber-50 text-amber-700";
  }

  if (status === "Expired") {
    return "border-slate-200 bg-slate-50 text-slate-500";
  }

  return "border-blue-100 bg-blue-50 text-blue-700";
}

function placementStatusClass(status: string): string {
  if (status === "active") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

async function enterAdminPanel(formData: FormData) {
  "use server";

  if (adminPasswordMatches(formData.get("password"))) {
    await setAdminAccessSession();
    redirect("/admin/advertising");
  }

  redirect("/admin/advertising?error=invalid");
}

async function logoutAdmin() {
  "use server";

  await clearAdminAccessSession();
  redirect("/admin/advertising");
}

function AdminPageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        {children}
        <FooterLinks />
      </section>
    </main>
  );
}

function ReviewModeBanner() {
  return (
    <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
      <p className="text-sm font-bold text-amber-900">
        Review Mode - Admin security not configured
      </p>
      <p className="mt-1 text-sm leading-6 text-amber-800">
        Set ADMIN_ACCESS_PASSWORD to require password access for this admin
        area.
      </p>
    </section>
  );
}

function AdminLogin({ hasError }: { hasError: boolean }) {
  return (
    <AdminPageShell>
      <div className="flex flex-1 items-center py-12">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white/88 p-6 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Secure area</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Advertising Admin Access
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the admin password to manage platform advertising inventory.
          </p>
          <form action={enterAdminPanel} className="mt-5 space-y-4">
            <div>
              <label
                className="text-sm font-bold text-slate-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                autoComplete="current-password"
                className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                id="password"
                name="password"
                required
                type="password"
              />
            </div>
            {hasError ? (
              <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                That password was not accepted.
              </p>
            ) : null}
            <button
              className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              type="submit"
            >
              Enter admin panel
            </button>
          </form>
        </section>
      </div>
    </AdminPageShell>
  );
}

export default async function AdvertisingAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const reviewMode = !isAdminAccessConfigured();
  const canAccess = reviewMode ? true : await hasAdminAccess();

  if (!canAccess) {
    const params = await searchParams;

    return <AdminLogin hasError={params?.error === "invalid"} />;
  }

  return (
    <AdminPageShell>

        <div className="flex-1 py-10">
          {reviewMode ? <ReviewModeBanner /> : null}
          <header>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Platform prototype
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Advertising Management
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review platform advertising inventory, campaign status, vertical
              coverage, indicative pricing, and sample sponsored creative before
              database-backed management is added.
            </p>
            {!reviewMode ? (
            <form action={logoutAdmin} className="mt-5">
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                type="submit"
              >
                Logout
              </button>
            </form>
            ) : null}
          </header>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Campaigns
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Campaign inventory
                </h2>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Static prototype data
              </p>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="py-3 pr-4">Campaign name</th>
                    <th className="py-3 pr-4">Vertical</th>
                    <th className="py-3 pr-4">Advertiser</th>
                    <th className="py-3 pr-4">Placement</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Start date</th>
                    <th className="py-3 pr-4">End date</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3">CTA</th>
                  </tr>
                </thead>
                <tbody>
                  {adCampaigns.map((campaign) => (
                    <tr
                      className="border-b border-slate-100 last:border-b-0"
                      key={campaign.id}
                    >
                      <td className="py-4 pr-4 font-bold text-slate-950">
                        {campaign.name}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {campaign.vertical}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {campaign.advertiser}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {campaign.placements.join(", ")}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
                            statusClass(campaign.status),
                          ].join(" ")}
                        >
                          {campaign.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {campaign.startDate}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {campaign.endDate}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {campaign.price}
                      </td>
                      <td className="py-4 font-semibold text-blue-700">
                        {campaign.ctaLabel}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Placement catalogue
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Available advertising placements
                </h2>
              </div>
              <p className="text-sm font-semibold text-slate-500">
                Platform-level inventory
              </p>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <th className="py-3 pr-4">Placement name</th>
                    <th className="py-3 pr-4">Placement ID</th>
                    <th className="py-3 pr-4">Location</th>
                    <th className="py-3 pr-4">Format</th>
                    <th className="py-3 pr-4">Audience</th>
                    <th className="py-3 pr-4">Suggested monthly price</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Notes / best use case</th>
                  </tr>
                </thead>
                <tbody>
                  {adPlacements.map((placement) => (
                    <tr
                      className="border-b border-slate-100 last:border-b-0"
                      key={placement.id}
                    >
                      <td className="py-4 pr-4 font-bold text-slate-950">
                        {placement.name}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-blue-700">
                        {placement.id}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {placement.location}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {placement.format}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {placement.audience}
                      </td>
                      <td className="py-4 pr-4 font-semibold text-slate-600">
                        {placement.recommendedPrice}
                      </td>
                      <td className="py-4 pr-4">
                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold capitalize",
                            placementStatusClass(placement.status),
                          ].join(" ")}
                        >
                          {placement.status}
                        </span>
                      </td>
                      <td className="py-4 font-semibold leading-6 text-slate-600">
                        {placement.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <p className="text-sm font-semibold text-blue-700">
              Advertising showroom
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              What placements look like
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Demo-only examples for future vertical owners. These previews do
              not make planned placements live on the public site.
            </p>
            <div className="mt-5 space-y-5">
              <HomepageHeroDemo
                ad={{
                  placementName: "Homepage Hero Sponsorship",
                  advertiser: "Demo Advertiser",
                  headline: "Own the first impression for a specialist audience",
                  description:
                    "A premium hero sponsorship for launches, seasonal campaigns, and broad brand awareness.",
                  cta: "Explore sponsorship",
                }}
              />
              <div className="grid gap-5 lg:grid-cols-2">
                <section>
                  <p className="mb-3 text-sm font-semibold text-blue-700">
                    Feed Inline Sponsored Card
                  </p>
                  <AdPlacement placementId="feed-inline-1" />
                </section>
                <NewsletterHeaderDemo
                  ad={{
                    placementName: "Newsletter Header Sponsor",
                    advertiser: "Demo Newsletter Partner",
                    headline: "Reach subscribers at the top of their update",
                    description:
                      "A clear newsletter sponsorship block prepared for future scheduled emails.",
                    cta: "View offer",
                  }}
                />
                <FeaturedProductDemo
                  ad={{
                    placementName: "Featured Product Card",
                    advertiser: "Demo Product Maker",
                    headline: "Featured product for buyers and enthusiasts",
                    description:
                      "A product-style card for hardware, accessories, software, or services.",
                    cta: "See product",
                  }}
                />
                <SupplierSpotlightDemo
                  ad={{
                    placementName: "Supplier Spotlight",
                    advertiser: "Demo Supplier",
                    headline: "Supplier spotlight for specialist audiences",
                    description:
                      "A compact supplier card for discovery-focused placement areas.",
                    cta: "Visit supplier",
                  }}
                />
                <SponsoredStoryDemo
                  ad={{
                    placementName: "Sponsored Story",
                    advertiser: "Demo Partner",
                    headline: "Tell a clearly labelled partner story",
                    description:
                      "An article-style sponsored card for longer commercial messages that remain visibly marked.",
                    cta: "Read story",
                  }}
                />
                <EventSpotlightDemo
                  ad={{
                    placementName: "Event Spotlight",
                    advertiser: "Demo Event Host",
                    headline: "Promote launches, webinars, and industry events",
                    description:
                      "A time-sensitive event card for audiences following a specialist vertical.",
                    cta: "View event",
                  }}
                />
              </div>
            </div>
          </section>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-semibold text-blue-700">
                Editor mock
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Campaign editor
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  ["Advertiser", "Prusa Research"],
                  ["Campaign headline", "Explore reliable desktop workflows"],
                  ["Description", "Sponsored message for a vertical feed."],
                  ["Button text", "Learn more"],
                  ["Target URL", "https://www.prusa3d.com/"],
                  ["Placement", "feed-inline-1"],
                  ["Start date", "2026-06-01"],
                  ["End date", "2026-06-30"],
                  ["Monthly price", "£250"],
                  ["Status", "Active"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      {label}
                    </label>
                    <div className="mt-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <p className="mb-3 text-sm font-semibold text-blue-700">
                Live public placement
              </p>
              <AdPlacement placementId="feed-inline-1" />
            </section>
          </div>

          <div className="mt-6">
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              href="/feed"
            >
              View live feed placement
            </Link>
          </div>
        </div>
    </AdminPageShell>
  );
}
