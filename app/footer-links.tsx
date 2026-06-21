import Link from "next/link";

export function FooterLinks() {
  return (
    <footer className="flex flex-wrap items-center gap-4 border-t border-slate-200/80 py-5 text-sm font-medium text-slate-500">
      <Link className="hover:text-blue-700" href="/contact">
        Contact
      </Link>
      <Link className="hover:text-blue-700" href="/privacy">
        Privacy
      </Link>
      <Link className="hover:text-blue-700" href="/terms">
        Terms
      </Link>
      <Link className="hover:text-blue-700" href="/publisher-policy">
        Publisher Policy
      </Link>
      <Link className="hover:text-blue-700" href="/updates">
        Updates
      </Link>
    </footer>
  );
}
