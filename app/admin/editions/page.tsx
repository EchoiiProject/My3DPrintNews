import Link from "next/link";
import { redirect } from "next/navigation";
import {
  generateNewsletterEdition,
  listNewsletterEditions,
  type EditionFrequency,
} from "@/lib/editions";
import { getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { AdminShell } from "../admin-shell";

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

async function generateTestEdition(formData: FormData) {
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
    redirect("/admin/editions?generated=error");
  }

  const params = new URLSearchParams({
    generated: "success",
    token: edition.magicToken,
    title: edition.title,
    count: String(edition.itemCount),
  });

  redirect(`/admin/editions?${params.toString()}`);
}

export default async function AdminEditionsPage({
  searchParams,
}: {
  searchParams?: Promise<{
    count?: string;
    error?: string;
    generated?: string;
    title?: string;
    token?: string;
  }>;
}) {
  const params = await searchParams;
  const publications = (await getVerticals()).filter(
    (vertical) => vertical.status === "active",
  );
  const editions = await listNewsletterEditions();

  return (
    <AdminShell showOrganisations title="Newsletter Editions">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Edition Access"
        redirectTo="/admin/editions"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Editions</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Edition infrastructure
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Newsletter Editions
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Generate and inspect saved editions that will power both browser
              editions and future email delivery.
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
                  Creates a draft/ready saved edition from archived publication
                  articles. No email is sent.
                </p>
              </div>
              <form
                action={generateTestEdition}
                className="grid w-full gap-3 rounded-lg border border-blue-100 bg-white p-4 lg:max-w-xl"
              >
                <label className="grid gap-1 text-sm font-bold text-slate-700">
                  Publication
                  <select
                    className="min-h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900"
                    name="publication"
                    required
                  >
                    {publications.map((publication) => (
                      <option key={publication.slug} value={publication.slug}>
                        {publication.publicationName ?? publication.name}
                      </option>
                    ))}
                  </select>
                </label>
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

          {params?.generated ? (
            <section className="mt-5 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8">
              {params.generated === "success" && params.token ? (
                <>
                  <p className="text-sm font-semibold text-blue-700">
                    Edition generated
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {params.title ?? "Newsletter edition"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {params.count ?? "0"} items saved. Magic token:{" "}
                    <span className="font-mono text-slate-950">
                      {params.token}
                    </span>
                  </p>
                  <Link
                    className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
                    href={`/editions/${params.token}`}
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
                    Check Supabase configuration and archived articles for the
                    selected publication.
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
                        No newsletter editions have been created yet.
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
