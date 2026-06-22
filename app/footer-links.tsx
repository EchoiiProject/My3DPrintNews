import Link from "next/link";
import { currentSite } from "../config/current-site";

export function FooterLinks() {
  return (
    <footer className="flex flex-wrap items-center gap-4 border-t border-slate-200/80 py-5 text-sm font-medium text-slate-500">
      {currentSite.metadata.footerLinks.map((link) => (
        <Link className="hover:text-blue-700" href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </footer>
  );
}
