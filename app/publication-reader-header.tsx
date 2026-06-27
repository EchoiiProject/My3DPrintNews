import Link from "next/link";

export type PublicationSectionKey = "home" | "latest" | "edition" | "catch-up";

export function PublicationReaderHeader({
  activeSection,
  catchUpHref,
  description,
  editionHref,
  latestHref,
  publicationName,
  title,
}: {
  activeSection: PublicationSectionKey;
  catchUpHref?: string;
  description?: string;
  editionHref?: string;
  latestHref?: string;
  publicationName: string;
  title?: string;
}) {
  const navigation = [
    { href: latestHref, key: "latest", label: "Latest News" },
    { href: editionHref, key: "edition", label: "Today's Edition" },
    { href: catchUpHref, key: "catch-up", label: "Catch Up" },
  ] as const;

  return (
    <header className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8 backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <Link
            className="text-sm font-black tracking-normal text-slate-950 hover:text-blue-700"
            href="/"
          >
            MyNewsNetwork
          </Link>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-blue-700">
            {publicationName}
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight text-slate-950 sm:text-4xl">
            {title ?? publicationName}
          </h1>
          {description ? (
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {description}
            </p>
          ) : null}
        </div>
        <nav className="flex flex-wrap gap-2">
          {navigation.map((item) =>
            item.href ? (
              <Link
                className={[
                  "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold",
                  activeSection === item.key
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-blue-200 bg-white text-blue-700 hover:bg-blue-50",
                ].join(" ")}
                href={item.href}
                key={item.key}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={[
                  "inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-bold",
                  activeSection === item.key
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-slate-50 text-slate-500",
                ].join(" ")}
                key={item.key}
              >
                {item.label}
              </span>
            ),
          )}
        </nav>
      </div>
    </header>
  );
}
