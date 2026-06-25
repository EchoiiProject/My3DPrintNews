import Link from "next/link";
import { notFound } from "next/navigation";
import { demoUserById } from "@/config/verticals";
import { getFeedbackByVertical, getVerticalBySlug, getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "../../admin-access";
import { AdminShell } from "../../admin-shell";
import { FeedbackTable } from "../../feedback-table";

export default async function VerticalFeedbackPage({
  params,
  searchParams,
}: {
  params: Promise<{ vertical: string }>;
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const { vertical: verticalSlug } = await params;
  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical) {
    notFound();
  }

  const query = await searchParams;
  const currentUser = demoUserById(query?.view);
  const canView =
    currentUser.role === "platform_owner" ||
    currentUser.assignedVerticalIds.includes(vertical.id);

  if (!canView) {
    notFound();
  }

  const feedbackItems = await getFeedbackByVertical(vertical.slug);
  const allVerticals = await getVerticals();
  const verticalsById = Object.fromEntries(
    allVerticals.map((item) => [item.id, item]),
  );

  return (
    <AdminShell title={`${vertical.name} Feedback`}>
      <AdminAccessGate
        error={query?.error}
        loginTitle={`${vertical.name} Feedback Access`}
        redirectTo={`/admin/${vertical.slug}/feedback`}
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
                {vertical.name}
              </Link>
              <span>/</span>
              <span>Feedback</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Private reader channel
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              {vertical.name} Feedback
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review comments, ideas, missing source requests, and issue
              reports sent to this publication owner.
            </p>
          </header>

          <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Feedback count
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {feedbackItems.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                New
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {feedbackItems.filter((item) => item.status === "new").length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Reviewed
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {
                  feedbackItems.filter((item) => item.status === "reviewed")
                    .length
                }
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Actioned
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-950">
                {
                  feedbackItems.filter((item) => item.status === "actioned")
                    .length
                }
              </p>
            </div>
          </section>

          <section className="mt-8">
            <FeedbackTable
              feedbackItems={feedbackItems}
              verticalsById={verticalsById}
            />
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
