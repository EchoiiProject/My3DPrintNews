import Link from "next/link";
import { notFound } from "next/navigation";
import { sponsorById } from "@/config/sponsors";
import { demoUserById, verticalBySlug } from "@/config/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

const kpis = [
  { label: "Today's Stories", value: "12" },
  { label: "Subscribers", value: "214" },
  { label: "Newsletter Open Rate", value: "61%" },
  { label: "Advertising Revenue", value: "£640/month" },
  { label: "Active Campaigns", value: "4" },
  { label: "Featured Products", value: "18" },
];

const managementGroups = [
  {
    title: "Content",
    items: [
      { title: "Sources", href: "/sources", status: "Open" },
      { title: "Brands", href: null, status: "Coming Soon" },
      { title: "Creators", href: null, status: "Coming Soon" },
      { title: "Events", href: null, status: "Coming Soon" },
      { title: "Updates", href: "/updates", status: "Open" },
    ],
  },
  {
    title: "Commercial",
    items: [
      { title: "Advertising", href: "/admin/advertising", status: "Open" },
      { title: "Sponsors", href: "/admin/sponsors", status: "Open" },
      { title: "Products", href: "/admin/products", status: "Open" },
      { title: "Campaigns", href: "/admin/advertising", status: "Open" },
    ],
  },
  {
    title: "Audience",
    items: [
      { title: "Subscribers", href: null, status: "Coming Soon" },
      { title: "Newsletter", href: null, status: "Coming Soon" },
      { title: "Analytics", href: null, status: "Coming Soon" },
    ],
  },
  {
    title: "Settings",
    items: [
      { title: "Branding", href: null, status: "Coming Soon" },
      { title: "Owners", href: "/admin", status: "Open" },
      { title: "Navigation", href: null, status: "Coming Soon" },
      {
        title: "Platform Settings",
        href: "/admin",
        status: "Super Admin only",
      },
    ],
  },
];

const quickActions = [
  { label: "Add Product", href: "/admin/products" },
  { label: "Create Campaign", href: "/admin/advertising" },
  { label: "Review Sources", href: "/sources" },
  { label: "Preview Newsletter", href: "/newsletter-preview/demo" },
  { label: "View Live Site", href: "/" },
  { label: "View Catch Up", href: "/catch-up" },
];

const recentActivity = [
  "Newsletter generated",
  "Sponsor campaign approved",
  "New source added",
  "Products updated",
  "Campaign expires in 3 days",
];

function statusClass(status: string) {
  if (status === "Open") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "Super Admin only") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

export default async function VerticalAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const { vertical: verticalSlug } = await params;
  const vertical = verticalBySlug(verticalSlug);

  if (!vertical) {
    notFound();
  }

  const query = await searchParams;
  const currentUser = demoUserById(query?.view);
  const sponsor = vertical.sponsorId ? sponsorById[vertical.sponsorId] : null;
  const isSuperAdmin = currentUser.role === "platform_owner";

  return (
    <AdminShell title={`${vertical.name} Dashboard`}>
      <AdminAccessGate
        error={query?.error}
        loginTitle={`${vertical.name} Admin Access`}
        redirectTo={`/admin/${vertical.slug}`}
      >
        <div className="flex-1 py-10">
          <header className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>{vertical.name}</span>
            </div>
            <p className="text-sm font-semibold text-blue-700">
              {isSuperAdmin ? "Viewing as Super Admin" : "Welcome back"}
            </p>
            <h1 className="mt-2 max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {vertical.name}
            </h1>
            <p className="mt-2 text-xl font-bold text-slate-700">
              Owned by {vertical.ownerName}
            </p>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {vertical.description}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Managing
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {vertical.name}
                </p>
              </div>
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
                <p className="mt-1 text-sm font-semibold text-emerald-700">
                  {vertical.active ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Last updated
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  25 Jun 2026
                </p>
              </div>
            </div>
          </header>

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <article
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                key={kpi.label}
              >
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </p>
                <p className="mt-3 text-3xl font-bold text-slate-950">
                  {kpi.value}
                </p>
              </article>
            ))}
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {managementGroups.map((group) => (
              <section
                className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                key={group.title}
              >
                <h2 className="text-2xl font-bold text-slate-950">
                  {group.title}
                </h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => (
                    <article
                      className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
                      key={item.title}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-slate-950">
                          {item.title}
                        </h3>
                        <span
                          className={[
                            "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold",
                            statusClass(item.status),
                          ].join(" ")}
                        >
                          {item.status}
                        </span>
                      </div>
                      {item.href ? (
                        <Link
                          className="mt-4 inline-flex min-h-9 items-center justify-center rounded-md bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                          href={item.href}
                        >
                          Open
                        </Link>
                      ) : (
                        <p className="mt-4 text-sm font-bold text-slate-500">
                          Coming Soon
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              Quick Actions
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Link
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  href={action.href}
                  key={action.label}
                >
                  {action.label}
                </Link>
              ))}
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                href="/admin"
              >
                Back to Admin Hub
              </Link>
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              Recent Activity
            </h2>
            <div className="mt-4 space-y-3">
              {recentActivity.map((activity) => (
                <div
                  className="rounded-md border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-700"
                  key={activity}
                >
                  {activity}
                </div>
              ))}
            </div>
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
