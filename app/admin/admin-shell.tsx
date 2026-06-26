import type { ReactNode } from "react";
import Link from "next/link";
import { FooterLinks } from "../footer-links";
import { GlobalNav } from "../global-nav";

const adminLinks = [
  { href: "/admin", label: "Admin Hub" },
  { href: "/admin/my3dprintnews", label: "My3DPrintNews" },
  { href: "/admin/mybmxnews", label: "MyBMXNews" },
  { href: "/admin/advertising", label: "Advertising" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/sponsors", label: "Sponsors" },
  { href: "/admin/sources", label: "Sources" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/feedback", label: "Feedback" },
  { href: "/admin/referrals", label: "Referrals" },
];

export function AdminShell({
  children,
  showOrganisations = false,
  title = "Platform Admin",
}: {
  children: ReactNode;
  showOrganisations?: boolean;
  title?: string;
}) {
  const visibleAdminLinks = showOrganisations
    ? [
        ...adminLinks,
        { href: "/admin/organisations", label: "Organisations" },
        { href: "/admin/platform", label: "Platform" },
      ]
    : adminLinks;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        <div className="mt-5 rounded-lg border border-slate-200 bg-white/80 p-3 shadow-sm shadow-blue-950/5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              {title}
            </p>
            <nav className="flex flex-wrap gap-2" aria-label="Admin navigation">
              {visibleAdminLinks.map((link) => (
                <Link
                  className="inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        {children}
        <FooterLinks />
      </section>
    </main>
  );
}
