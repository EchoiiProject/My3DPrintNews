import Link from "next/link";
import { currentSite } from "../config/current-site";

export function FooterLinks() {
  return (
    <footer className="border-t border-slate-200/80 py-6 text-sm text-slate-600">
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-base font-bold text-slate-950">
            {currentSite.metadata.name}
          </p>
          <p className="mt-1 font-semibold text-slate-600">
            {currentSite.metadata.tagline}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 font-semibold">
          {currentSite.metadata.footerLinks.map((link) => (
            <Link
              className="hover:text-blue-700"
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="max-w-4xl space-y-2 leading-6">
          <p>© 2026 3D Printed Products Ltd. All rights reserved.</p>
          <p>
            My3DPrintNews is a trading brand of 3D Printed Products Ltd.
          </p>
          <p>
            Articles remain the copyright of their respective publishers.
            Headlines, summaries and metadata are displayed with attribution and
            links to the original source.
          </p>
        </div>
      </div>
    </footer>
  );
}
