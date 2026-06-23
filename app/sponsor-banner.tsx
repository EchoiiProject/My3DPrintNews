import type { Sponsor } from "@/config/sponsors";

export function SponsorBanner({ sponsor }: { sponsor: Sponsor | null }) {
  if (!sponsor?.active) {
    return null;
  }

  return (
    <aside className="rounded-lg border border-blue-100 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {sponsor.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={sponsor.name}
              className="h-10 w-10 rounded-md border border-slate-100 object-contain"
              src={sponsor.logoUrl}
            />
          ) : null}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
              Presented by
            </p>
            <h2 className="text-lg font-bold text-slate-950">
              {sponsor.name}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {sponsor.description}
            </p>
          </div>
        </div>
        <a
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          href={sponsor.websiteUrl}
          rel="noreferrer"
          target="_blank"
        >
          Visit sponsor
        </a>
      </div>
    </aside>
  );
}
