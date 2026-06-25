import Link from "next/link";
import { notFound } from "next/navigation";
import {
  averageFeedbackRating,
  feedbackCountByCategory,
} from "@/config/feedback";
import { sponsorById } from "@/config/sponsors";
import { demoUserById } from "@/config/verticals";
import { getFeedbackByVertical, getVerticalBySlug } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

type CentreItem = {
  label: string;
  href: string | null;
  status: "Live" | "Ready" | "Planned";
};

type ManagementCentre = {
  title: string;
  description: string;
  stats: { label: string; value: string }[];
  actions: { label: string; href: string | null }[];
  items: CentreItem[];
};

const managementCentres: ManagementCentre[] = [
  {
    title: "Content",
    description:
      "Manage the content graph that powers the vertical publication.",
    stats: [
      { label: "Active sources", value: "17" },
      { label: "Articles today", value: "12" },
      { label: "Feed health", value: "94%" },
    ],
    actions: [
      { label: "Review Sources", href: null },
      { label: "View Updates", href: "/updates" },
      { label: "Open Feed", href: "/feed" },
    ],
    items: [
      { label: "Sources", href: null, status: "Live" },
      { label: "Brands", href: null, status: "Planned" },
      { label: "Creators", href: null, status: "Planned" },
      { label: "Events", href: null, status: "Planned" },
      { label: "Topics", href: "/sources", status: "Ready" },
      { label: "Articles", href: "/feed", status: "Live" },
      { label: "Feed Health", href: null, status: "Planned" },
    ],
  },
  {
    title: "Commercial",
    description:
      "Manage sponsor, advertising, campaign, and product promotion activity.",
    stats: [
      { label: "Monthly revenue", value: "£640" },
      { label: "Active campaigns", value: "4" },
      { label: "Featured products", value: "18" },
    ],
    actions: [
      { label: "Open Sponsors", href: "/admin/sponsors" },
      { label: "Open Advertising", href: "/admin/advertising" },
      { label: "Open Products", href: "/admin/products" },
    ],
    items: [
      { label: "Sponsors", href: "/admin/sponsors", status: "Live" },
      { label: "Advertising", href: "/admin/advertising", status: "Live" },
      { label: "Campaigns", href: "/admin/advertising", status: "Ready" },
      { label: "Products", href: "/admin/products", status: "Live" },
      { label: "Placements", href: "/admin/advertising", status: "Ready" },
      { label: "Revenue", href: null, status: "Planned" },
    ],
  },
  {
    title: "Audience",
    description:
      "Understand and grow the reader, subscriber, and saved-feed audience.",
    stats: [
      { label: "Subscribers", value: "214" },
      { label: "Open rate", value: "61%" },
      { label: "Saved feeds", value: "83" },
    ],
    actions: [
      { label: "Preview Newsletter", href: "/newsletter-preview/demo" },
      { label: "View Catch Up", href: "/catch-up" },
      { label: "Review Feedback", href: null },
      { label: "View Analytics", href: null },
    ],
    items: [
      { label: "Subscribers", href: null, status: "Planned" },
      { label: "Newsletter", href: null, status: "Planned" },
      { label: "Saved Feeds", href: null, status: "Planned" },
      { label: "Feedback", href: null, status: "Ready" },
      { label: "Analytics", href: null, status: "Planned" },
      { label: "Growth", href: null, status: "Planned" },
    ],
  },
  {
    title: "Platform",
    description:
      "Configure ownership, navigation, access, domain, and integrations.",
    stats: [
      { label: "Users", value: "3" },
      { label: "Roles", value: "3" },
      { label: "Integrations", value: "2" },
    ],
    actions: [
      { label: "Admin Hub", href: "/admin" },
      { label: "Preview Discover More", href: "/discover-more" },
      { label: "Manage Owners", href: "/admin" },
      { label: "Review Roles", href: "/admin" },
    ],
    items: [
      { label: "Branding", href: null, status: "Planned" },
      { label: "Organisation", href: "/admin", status: "Ready" },
      { label: "Navigation", href: null, status: "Planned" },
      { label: "Owners", href: "/admin", status: "Ready" },
      { label: "Users", href: null, status: "Planned" },
      { label: "Roles", href: "/admin", status: "Ready" },
      { label: "Domain", href: null, status: "Planned" },
      { label: "Integrations", href: null, status: "Planned" },
    ],
  },
];

function statusClass(status: CentreItem["status"]) {
  if (status === "Live") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }

  if (status === "Ready") {
    return "border-blue-100 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

function ManagementCentreCard({ centre }: { centre: ManagementCentre }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            {centre.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {centre.description}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {centre.stats.map((stat) => (
          <div
            className="rounded-md border border-slate-200 bg-slate-50/70 p-3"
            key={stat.label}
          >
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {centre.actions.map((action) =>
          action.href ? (
            <Link
              className="inline-flex min-h-9 items-center justify-center rounded-md bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              href={action.href}
              key={action.label}
            >
              {action.label}
            </Link>
          ) : (
            <span
              className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-500"
              key={action.label}
            >
              {action.label} - Coming Soon
            </span>
          ),
        )}
      </div>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        {centre.items.map((item) => (
          <div
            className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
            key={item.label}
          >
            {item.href ? (
              <Link
                className="text-sm font-bold text-slate-800 hover:text-blue-700"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-sm font-bold text-slate-700">
                {item.label}
              </span>
            )}
            <span
              className={[
                "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold",
                statusClass(item.status),
              ].join(" ")}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function VerticalAdminPage({
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
  const sponsor = vertical.sponsorId ? sponsorById[vertical.sponsorId] : null;
  const isSuperAdmin = currentUser.role === "platform_owner";
  const verticalFeedback = await getFeedbackByVertical(vertical.slug);
  const verticalManagementCentres = managementCentres.map((centre) => {
    if (centre.title === "Platform" && isSuperAdmin) {
      return {
        ...centre,
        actions: [
          ...centre.actions,
          { label: "Organisations", href: "/admin/organisations" },
        ],
        items: [
          ...centre.items,
          {
            label: "Organisations",
            href: "/admin/organisations",
            status: "Ready" as const,
          },
        ],
      };
    }

    if (centre.title !== "Audience") {
      if (centre.title === "Content") {
        return {
          ...centre,
          actions: centre.actions.map((action) =>
            action.label === "Review Sources"
              ? { ...action, href: `/admin/${vertical.slug}/sources` }
              : action,
          ),
          items: centre.items.map((item) =>
            item.label === "Sources"
              ? { ...item, href: `/admin/${vertical.slug}/sources` }
              : item,
          ),
        };
      }

      return centre;
    }

    return {
      ...centre,
      stats: [
        {
          label: "New suggestions",
          value: String(
            verticalFeedback.filter((item) => item.status === "new").length,
          ),
        },
        {
          label: "Source requests",
          value: String(
            feedbackCountByCategory(verticalFeedback, "source_request"),
          ),
        },
        {
          label: "Bug reports",
          value: String(feedbackCountByCategory(verticalFeedback, "bug_report")),
        },
        {
          label: "Feedback score",
          value: averageFeedbackRating(verticalFeedback),
        },
      ],
      actions: centre.actions.map((action) =>
        action.label === "Review Feedback"
          ? { ...action, href: `/admin/${vertical.slug}/feedback` }
          : action,
      ),
      items: centre.items.map((item) =>
        item.label === "Feedback"
          ? { ...item, href: `/admin/${vertical.slug}/feedback` }
          : item,
      ),
    };
  });

  return (
    <AdminShell
      showOrganisations={isSuperAdmin}
      title={`${vertical.name} Management Centre`}
    >
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
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              {vertical.description}
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Managing
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {vertical.name}
                </p>
              </div>
            </div>
          </header>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              Organisation
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Organisation name
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {vertical.ownerName}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Website
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {vertical.domain}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Primary Sponsor
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {sponsor?.name ?? "No sponsor"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Primary Contact
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {vertical.ownerEmail}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Platform
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  Personalised News Platform
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Owned Vertical
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {vertical.name}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2">
            {verticalManagementCentres.map((centre) => (
              <ManagementCentreCard centre={centre} key={centre.title} />
            ))}
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
