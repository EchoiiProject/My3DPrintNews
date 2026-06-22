type DemoAd = {
  placementName: string;
  advertiser: string;
  headline: string;
  description: string;
  cta: string;
};

function DemoButton({ label }: { label: string }) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
      type="button"
    >
      {label}
    </button>
  );
}

function SponsoredHeader({
  advertiser,
  placementName,
}: {
  advertiser: string;
  placementName: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-700">
      <span>Sponsored</span>
      <span className="text-slate-300">/</span>
      <span>{advertiser}</span>
      <span className="text-slate-300">/</span>
      <span>{placementName}</span>
    </div>
  );
}

export function HomepageHeroDemo({ ad }: { ad: DemoAd }) {
  return (
    <article className="rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#eff6ff,#ffffff)] p-6 shadow-xl shadow-blue-950/8">
      <SponsoredHeader
        advertiser={ad.advertiser}
        placementName={ad.placementName}
      />
      <h3 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-slate-950">
        {ad.headline}
      </h3>
      <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
        {ad.description}
      </p>
      <div className="mt-5">
        <DemoButton label={ad.cta} />
      </div>
    </article>
  );
}

export function NewsletterHeaderDemo({ ad }: { ad: DemoAd }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/8">
      <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
        <SponsoredHeader
          advertiser={ad.advertiser}
          placementName={ad.placementName}
        />
        <h3 className="mt-3 text-2xl font-bold text-slate-950">
          {ad.headline}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {ad.description}
        </p>
        <div className="mt-4">
          <DemoButton label={ad.cta} />
        </div>
      </div>
    </article>
  );
}

export function FeaturedProductDemo({ ad }: { ad: DemoAd }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/8">
      <SponsoredHeader
        advertiser={ad.advertiser}
        placementName={ad.placementName}
      />
      <div className="mt-4 aspect-video rounded-md border border-slate-100 bg-slate-100" />
      <h3 className="mt-4 text-2xl font-bold text-slate-950">{ad.headline}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{ad.description}</p>
      <div className="mt-4">
        <DemoButton label={ad.cta} />
      </div>
    </article>
  );
}

export function SupplierSpotlightDemo({ ad }: { ad: DemoAd }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/8">
      <SponsoredHeader
        advertiser={ad.advertiser}
        placementName={ad.placementName}
      />
      <h3 className="mt-4 text-xl font-bold text-slate-950">{ad.headline}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{ad.description}</p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="rounded-md bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
          Supplier spotlight
        </span>
        <DemoButton label={ad.cta} />
      </div>
    </article>
  );
}

export function SponsoredStoryDemo({ ad }: { ad: DemoAd }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-xl shadow-blue-950/8">
      <SponsoredHeader
        advertiser={ad.advertiser}
        placementName={ad.placementName}
      />
      <h3 className="mt-4 text-2xl font-bold leading-8 text-slate-950">
        {ad.headline}
      </h3>
      <p className="mt-3 text-base leading-7 text-slate-600">
        {ad.description}
      </p>
      <div className="mt-4">
        <DemoButton label={ad.cta} />
      </div>
    </article>
  );
}

export function EventSpotlightDemo({ ad }: { ad: DemoAd }) {
  return (
    <article className="rounded-lg border border-blue-100 bg-blue-50/70 p-5 shadow-xl shadow-blue-950/8">
      <SponsoredHeader
        advertiser={ad.advertiser}
        placementName={ad.placementName}
      />
      <p className="mt-4 text-xs font-bold uppercase tracking-wide text-blue-700">
        Event spotlight
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-950">{ad.headline}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{ad.description}</p>
      <div className="mt-4">
        <DemoButton label={ad.cta} />
      </div>
    </article>
  );
}
