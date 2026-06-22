import {
  AdPlacementId,
  campaignForPlacement,
} from "../config/advertising";

export function AdPlacement({ placementId }: { placementId: AdPlacementId }) {
  const campaign = campaignForPlacement(placementId);

  if (!campaign) {
    return null;
  }

  return (
    <aside className="rounded-lg border border-blue-100 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
            Sponsored
          </p>
          <h3 className="mt-2 text-xl font-bold leading-7 text-slate-950">
            {campaign.creative.headline}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {campaign.creative.description}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            {campaign.advertiser}
          </p>
        </div>
        <a
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
          href={campaign.creative.targetUrl}
          rel="sponsored noreferrer"
          target="_blank"
        >
          Learn more
        </a>
      </div>
    </aside>
  );
}
