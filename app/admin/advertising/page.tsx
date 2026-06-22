import Link from "next/link";
import { AdPlacement } from "../../ad-placement";
import { FooterLinks } from "../../footer-links";
import { GlobalNav } from "../../global-nav";
import {
  adCampaigns,
  adPlacements,
  AdCampaign,
} from "../../../config/advertising";

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

export default function AdvertisingAdminPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />

        <div className="flex-1 py-10">
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

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-semibold text-blue-700">
                Placements
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-950">
                Placement inventory
              </h2>
              <div className="mt-5 grid gap-3">
                {adPlacements.map((placement) => (
                  <article
                    className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
                    key={placement.id}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-950">
                          {placement.id}
                        </h3>
                        <p className="mt-1 text-sm font-semibold text-slate-600">
                          {placement.name}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {placement.description}
                        </p>
                      </div>
                      <span
                        className={[
                          "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold",
                          placement.enabled
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-500",
                        ].join(" ")}
                      >
                        {placement.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {placement.supportedFormats.map((format) => (
                        <span
                          className="rounded-md bg-white px-2.5 py-1 text-xs font-bold text-slate-600"
                          key={format}
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm font-bold text-blue-700">
                      Recommended price: {placement.recommendedPrice}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <aside className="space-y-6">
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
                    ["Monthly price", "£750"],
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
                  Ad preview
                </p>
                <AdPlacement placementId="feed-inline-1" />
              </section>
            </aside>
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

        <FooterLinks />
      </section>
    </main>
  );
}
