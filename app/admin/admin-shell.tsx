import type { ReactNode } from "react";
import { FooterLinks } from "../footer-links";
import { GlobalNav } from "../global-nav";

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        {children}
        <FooterLinks />
      </section>
    </main>
  );
}
