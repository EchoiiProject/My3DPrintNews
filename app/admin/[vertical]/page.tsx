import Link from "next/link";
import { notFound } from "next/navigation";
import { sponsorById } from "@/config/sponsors";
import { verticalBySlug } from "@/config/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

const managementAreas = [
  {
    title: "Advertising",
    description: "Campaigns, placements, creatives, and sponsorship inventory.",
    href: "/admin/advertising",
  },
  {
    title: "Products",
    description: "Promotional products and product placement inventory.",
    href: "/admin/products",
  },
  {
    title: "Sponsors",
    description: "Presenting and supporting sponsor relationships.",
    href: "/admin/sponsors",
  },
  {
    title: "Subscribers",
    description: "Saved feeds and newsletter subscriber profiles.",
    href: "/admin",
  },
  {
    title: "Sources",
    description: "RSS feeds, creators, and source registry coverage.",
    href: "/sources",
  },
  {
    title: "Updates",
    description: "Vertical-specific platform updates and changelog posts.",
    href: "/updates",
  },
  {
    title: "Analytics",
    description: "Coming soon: vertical traffic, engagement, and conversion data.",
    href: "/admin",
  },
];

const relationshipItems = [
  "Sponsors",
  "Products",
  "Campaigns",
  "Subscribers",
  "Sources",
  "Updates",
];

export default async function VerticalAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  const { vertical: verticalSlug } = await params;
  const vertical = verticalBySlug(verticalSlug);

  if (!vertical) {
    notFound();
  }

  const query = await searchParams;
  const sponsor = vertical.sponsorId ? sponsorById[vertical.sponsorId] : null;

  return (
    <AdminShell>
      <AdminAccessGate
        error={query?.error}
        loginTitle={`${vertical.name} Admin Access`}
        redirectTo={`/admin/${vertical.slug}`}
      >
        <div className="flex-1 py-10">
          <header>
            <Link
              className="mb-4 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
              href="/admin"
            >
              Back to admin hub
            </Link>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {vertical.name}
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {vertical.description}
            </p>
          </header>

          <section className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Owner
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {vertical.ownerName}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Domain
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {vertical.domain}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Sponsor
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {sponsor?.name ?? "No sponsor"}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Status
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {vertical.active ? "Active" : "Inactive"}
              </p>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950">
              Management surface
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {managementAreas.map((area) => (
                <Link
                  className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/50"
                  href={area.href}
                  key={area.title}
                >
                  <h3 className="text-xl font-bold text-slate-950">
                    {area.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {area.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              Vertical relationship model
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              Future database models should attach these objects to a vertical
              through `vertical_id` or equivalent ownership references.
            </p>
            <div className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-4">
              <p className="text-sm font-bold text-blue-950">Vertical</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {relationshipItems.map((item) => (
                  <div
                    className="rounded-md border border-blue-100 bg-white px-3 py-2 text-sm font-semibold text-blue-900"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
