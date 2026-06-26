import type { ReferralAnalytics } from "@/lib/referrals";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function ReferralAnalyticsDashboard({
  analytics,
  scopeName,
}: {
  analytics: ReferralAnalytics;
  scopeName: string;
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Platform Visitors",
            value: formatNumber(analytics.platformVisitors),
            detail: "Simulated visitor estimate",
          },
          {
            label: "Outbound Referral Clicks",
            value: formatNumber(analytics.outboundReferralClicks),
            detail: "Simulated click volume",
          },
          {
            label: "Overall Referral CTR",
            value: `${analytics.overallReferralCtr}%`,
            detail: "Simulated click-through rate",
          },
          {
            label: "Top Destination",
            value: analytics.topDestination,
            detail: "Simulated destination leader",
          },
        ].map((card) => (
          <article
            className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
            key={card.label}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {card.value}
            </p>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {card.detail}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-lg border border-blue-100 bg-blue-50/80 p-5">
        <p className="text-sm font-bold text-blue-700">Phase 1 demo data</p>
        <h2 className="mt-1 text-2xl font-bold text-blue-950">
          Referral Analytics for {scopeName}
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-900">
          These values demonstrate the licence-holder referral story before
          live click tracking is connected.
        </p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-2xl font-bold text-slate-950">
            Referral Breakdown
          </h2>
          <div className="mt-4 space-y-3">
            {analytics.breakdown.map((item) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
                key={item.surface}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-bold text-slate-900">
                    {item.label}
                  </p>
                  <p className="text-sm font-bold text-blue-700">
                    {item.percentage}%
                  </p>
                </div>
                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {formatNumber(item.clicks)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-2xl font-bold text-slate-950">
              Top Destination Sites
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Destination</th>
                  <th className="px-4 py-3">Clicks</th>
                  <th className="px-4 py-3">CTR</th>
                  <th className="px-4 py-3">Last Click</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {analytics.topDestinations.map((destination) => (
                  <tr key={destination.destination}>
                    <td className="px-4 py-3 font-bold text-slate-900">
                      {destination.destination}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatNumber(destination.clicks)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {destination.ctr}%
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(destination.lastClick)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-2xl font-bold text-slate-950">
            Top Performing Articles
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Article title</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Outbound clicks</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.topArticles.map((article) => (
                <tr key={`${article.title}-${article.destination}`}>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {article.title}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {article.source}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {formatNumber(article.outboundClicks)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {article.destination}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {article.ctr}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
