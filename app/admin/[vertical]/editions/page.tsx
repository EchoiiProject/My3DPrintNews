import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  generateNewsletterEdition,
  listNewsletterEditions,
  type EditionFrequency,
} from "@/lib/editions";
import { getVerticalBySlug } from "@/lib/verticals";
import { AdminAccessGate } from "../../admin-access";
import { AdminShell } from "../../admin-shell";

export const dynamic = "force-dynamic";

function formatDate(value: string | null): string {
  if (!value) return "TBC";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function isEditionFrequency(value: FormDataEntryValue | null): value is EditionFrequency {
  return value === "daily" || value === "weekly" || value === "monthly";
}

async function generateScopedTestEdition(formData: FormData) {
  "use server";

  const publication = String(formData.get("publication") ?? "");
  const frequencyValue = formData.get("frequency");
  const email = String(formData.get("email") ?? "").trim();
  const frequency = isEditionFrequency(frequencyValue)
    ? frequencyValue
    : "daily";
  const edition = await generateNewsletterEdition({
    verticalSlug: publication,
    frequency,
    readerEmail: email || null,
  });

  if (!edition) {
    redirect(`/admin/${publication}/editions?generated=error`);
  }

  const params = new URLSearchParams({
    generated: "success",
    token: edition.magicToken,
    title: edition.title,
    count: String(edition.itemCount),
  });

  redirect(`/admin/${publication}/editions?${params.toString()}`);
}

export default async function PublicationEditionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams?: Promise<{
    count?: string;
    error?: string;
    generated?: string;
    title?: string;
    token?: string;
  }>;
}) {
  const { vertical: verticalSlug } = await params;
  const query = await searchParams;
  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical) {
    notFound();
  }

  const editions = await listNewsletterEditions({ verticalSlug: vertical.slug });
  const publicationName = vertical.publicationName ?? vertical.name;

  return (
    <AdminShell
      currentPublicationSlug={vertical.slug}
      showOrganisations
      title={`${publicationName} Editions`}
    >
      <AdminAccessGate
        error={query?.error}
        loginTitle={`${publicationName} Edition Access`}
        redirectTo={`/admin/${vertical.slug}/editions`}
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <Link
                className="text-blue-700 hover:text-blue-900"
                href={`/admin/${vertical.slug}`}
              >
                {publicationName}
              </Link>
              <span>/</span>
              <span>Editions</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Publication editions
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {publicationName} Editions
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Generate and inspect saved editions for this publication only.
            </p>
          </header>

          <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Test edition
                </p>
                <h2 className="mt-1 text-2xl font-bold text-blue-950">
                  Generate Test Edition
                </h2>
                <p className="mt-2 text-sm leading-6 text-blue-900">
                  Publication: {publicationName}. No email is sent.
                </p>
              </div>
              <form
                action={generateScopedTestEdition}
                className="grid w-full gap-3 rounded-lg border border-blue-100 bg-white p-4 lg:max-w-xl"
              >
                <input name="publication" type="hidden" value={vertical.slug} />
                <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Publication
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-950">
                    {publicationName}
                  </p>
                </div>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  Frequency
                  <select
                    className="min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
                    name="frequency"
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  Optional reader email
                  <input
                    className="min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
                    name="email"
                    placeholder="reader@example.com"
                    type="email"
                  />
                </label>
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white hover:bg-blue-700"
                  type="submit"
                >
                  Generate Test Edition
                </button>
              </form>
            </div>
          </section>

          {query?.generated ? (
            <section className="mt-5 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8">
              {query.generated === "success" && query.token ? (
                <>
                  <p className="text-sm font-semibold text-blue-700">
                    Edition generated
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {query.title ?? "Newsletter edition"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {query.count ?? "0"} items saved for {publicationName}.
                  </p>
                  <Link
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                    href={`/editions/${query.token}`}
                  >
                    Open saved edition
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-slate-950">
                    Edition could not be generated
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Check Supabase configuration and archived articles for{" "}
                    {publicationName}.
                  </p>
                </>
              )}
            </section>
          ) : null}

          <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white/88 shadow-xl shadow-blue-950/8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Publication</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Frequency</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {editions.length ? (
                    editions.map((edition) => (
                      <tr key={edition.id}>
                        <td className="px-4 py-3 font-bold text-slate-950">
                          {edition.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {edition.publicationName}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(edition.editionDate)}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {edition.frequency ?? "TBC"}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {edition.itemCount}
                        </td>
                        <td className="px-4 py-3">
                          <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-bold uppercase text-slate-600">
                            {edition.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-6 text-sm font-semibold text-slate-600"
                        colSpan={6}
                      >
                        No editions have been created for {publicationName} yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
