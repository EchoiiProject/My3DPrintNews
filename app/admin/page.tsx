import Link from "next/link";
import { sponsorById } from "@/config/sponsors";
import {
  demoAdminUsers,
  demoUserById,
  ownershipRoles,
  publicationSlugForVertical,
} from "@/config/verticals";
import { getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "./admin-access";
import { AdminShell } from "./admin-shell";

const adminTools = [
  {
    title: "Advertising Management",
    description: "Campaigns, placements, showroom, and sponsor inventory.",
    href: "/admin/advertising",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Product Management",
    description: "Promotional products and product placement inventory.",
    href: "/admin/products",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Sponsor Management",
    description: "Platform-level presenting and supporting sponsor records.",
    href: "/admin/sponsors",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Source Management",
    description: "RSS source health, diagnostics, and feed coverage operations.",
    href: "/admin/sources",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Article Archive",
    description: "Collected articles from publication source libraries.",
    href: "/admin/articles",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Licence Holder Management",
    description: "Organisations, licence holders, and publication onboarding.",
    href: "/admin/organisations",
    roles: ["platform_owner"],
  },
  {
    title: "Platform Settings",
    description: "Scheduler, environment, and deployment-level settings.",
    href: "/admin/platform",
    roles: ["platform_owner"],
  },
  {
    title: "Feedback Management",
    description: "Private reader feedback, source suggestions, and issue reports.",
    href: "/admin/feedback",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Referral Analytics",
    description: "Demo referral traffic, outbound clicks, and destination reporting.",
    href: "/admin/referrals",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Discover More",
    description: "Reader-facing publication discovery across MyNewsNetwork.",
    href: "/discover-more",
    roles: ["platform_owner", "vertical_owner"],
  },
  {
    title: "Campaign Reporting",
    description: "Assigned campaign placement and reporting preview.",
    href: "/admin/advertising",
    roles: ["advertiser"],
  },
];

export default async function AdminHubPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const allVerticals = await getVerticals();
  const visibleVerticals =
    currentUser.role === "platform_owner"
      ? allVerticals.filter((vertical) => vertical.status === "active")
      : allVerticals.filter((vertical) =>
          currentUser.assignedVerticalIds.includes(vertical.id),
        );
  const visibleTools = adminTools.filter((tool) =>
    tool.roles.includes(currentUser.role),
  );

  return (
    <AdminShell
      showOrganisations={currentUser.role === "platform_owner"}
      title="Admin Hub"
    >
      <AdminAccessGate
        error={params?.error}
        loginTitle="Platform Admin Access"
        redirectTo="/admin"
      >
        <div className="flex-1 py-10">
          <header>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Platform administration
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Publications
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Manage MyNewsNetwork publications, licence holders, sponsors,
              products, campaigns, subscribers, sources, updates, and
              analytics.
            </p>
            <p className="mt-4 max-w-3xl rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-950">
              Future authentication will restrict each user to their assigned
              role and publication.
            </p>
          </header>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Access simulation
                </p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  Viewing as: {currentUser.label}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Prototype-only selector. This is not real security.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {demoAdminUsers.map((user) => (
                  <Link
                    className={[
                      "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
                      currentUser.id === user.id
                        ? "border-blue-500 bg-blue-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700",
                    ].join(" ")}
                    href={`/admin?view=${user.id}`}
                    key={user.id}
                  >
                    {user.label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {currentUser.role === "platform_owner" ? (
            <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    Sales preparation
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-blue-950">
                    Prepare a private demo publication
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-blue-900">
                    Set up licence holder, publication, sources, previews, and
                    Super Admin-only sales notes before a prospect meeting.
                  </p>
                </div>
                <Link
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  href="/admin/demo-preparation"
                >
                  Prepare New Demo
                </Link>
              </div>
            </section>
          ) : null}

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950">
              Publication Admin
            </h2>
            <div className="mt-4 grid gap-5 lg:grid-cols-2">
            {visibleVerticals.length ? (
              visibleVerticals.map((vertical) => {
              const sponsor = vertical.sponsorId
                ? sponsorById[vertical.sponsorId]
                : null;
              const publicSlug = publicationSlugForVertical(vertical);

              return (
                <article
                  className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur"
                  key={vertical.id}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-blue-700">
                        {vertical.slug}
                      </p>
                      <h2 className="mt-1 text-2xl font-bold text-slate-950">
                        {vertical.name}
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {vertical.description}
                      </p>
                    </div>
                    <span
                      className={[
                        "inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold",
                        vertical.active
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500",
                      ].join(" ")}
                    >
                      {vertical.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 rounded-md border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Current Licence Holder
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
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                      href={`/admin/${vertical.slug}`}
                    >
                      Open Admin
                    </Link>
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      href={`/publications/${publicSlug}`}
                    >
                      View Public Site
                    </Link>
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      href={`/admin/${vertical.slug}/sources`}
                    >
                      Sources
                    </Link>
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                      href={`/admin/${vertical.slug}/articles`}
                    >
                      Articles
                    </Link>
                  </div>
                </article>
              );
              })
            ) : (
              <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
                <h3 className="text-xl font-bold text-slate-950">
                  No publication access
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Advertisers will only see assigned campaigns and campaign
                  reporting in a future authenticated experience.
                </p>
              </div>
            )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-2xl font-bold text-slate-950">
              Platform tools
            </h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {visibleTools.map((tool) => (
                <Link
                  className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/50"
                  href={tool.href}
                  key={tool.href}
                >
                  <h3 className="text-xl font-bold text-slate-950">
                    {tool.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {tool.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
            <h2 className="text-2xl font-bold text-slate-950">
              Operating roles
            </h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {ownershipRoles.map((role) => (
                <article
                  className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
                  key={role.id}
                >
                  <p className="text-sm font-bold text-blue-700">{role.id}</p>
                  <h3 className="mt-2 text-lg font-bold text-slate-950">
                    {role.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {role.description}
                  </p>
                  <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Scope: {role.scope}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
