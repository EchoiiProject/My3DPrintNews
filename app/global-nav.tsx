import Link from "next/link";
const primaryLinks = [
  { href: "/feed", label: "Feed" },
  { href: "/catch-up", label: "Catch Up" },
  { href: "/sources", label: "Sources" },
  { href: "/updates", label: "Updates" },
  { href: "/discover-more", label: "Discover More" },
];

export function GlobalNav({
  brandName = "MyNewsNetwork",
  links = primaryLinks,
}: {
  brandName?: string;
  links?: { href: string; label: string }[];
}) {
  return (
    <nav className="flex flex-col gap-3 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center sm:justify-between">
      <Link
        className="text-lg font-bold tracking-tight text-slate-950"
        href="/"
      >
        {brandName}
      </Link>
      <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600 sm:gap-5">
        {links.map((link) => (
          <Link
            className="transition hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
            href={link.href}
            key={link.href}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function ActionLinks({
  links,
}: {
  links: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white/90 px-3 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
          href={link.href}
          key={`${link.href}-${link.label}`}
        >
          {link.label}
        </Link>
      ))}
    </div>
  );
}
