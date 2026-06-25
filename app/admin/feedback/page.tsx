import Link from "next/link";
import {
  feedbackCountByCategory,
} from "@/config/feedback";
import {
  demoUserById,
} from "@/config/verticals";
import { getAllFeedback, getFeedbackByVertical, getVerticals } from "@/lib/verticals";
import { AdminAccessGate } from "../admin-access";
import { FeedbackTable } from "../feedback-table";
import { AdminShell } from "../admin-shell";

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; view?: string }>;
}) {
  const params = await searchParams;
  const currentUser = demoUserById(params?.view);
  const allVerticals = await getVerticals();
  const visibleVerticals =
    currentUser.role === "platform_owner"
      ? allVerticals.filter((vertical) => vertical.status === "active")
      : allVerticals.filter((vertical) =>
          currentUser.assignedVerticalIds.includes(vertical.id),
        );
  const visibleVerticalIds = new Set(
    visibleVerticals.map((vertical) => vertical.id),
  );
  const allFeedback = await getAllFeedback();
  const visibleFeedback =
    currentUser.role === "platform_owner"
      ? allFeedback
      : allFeedback.filter((item) => visibleVerticalIds.has(item.verticalId));
  const verticalsById = Object.fromEntries(
    allVerticals.map((vertical) => [vertical.id, vertical]),
  );
  const feedbackCounts = await Promise.all(
    visibleVerticals.map(async (vertical) => ({
      vertical,
      items: await getFeedbackByVertical(vertical.slug),
    })),
  );

  return (
    <AdminShell title="Feedback Management">
      <AdminAccessGate
        error={params?.error}
        loginTitle="Feedback Admin Access"
        redirectTo="/admin/feedback"
      >
        <div className="flex-1 py-10">
          <header>
            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
              <Link className="text-blue-700 hover:text-blue-900" href="/admin">
                Admin
              </Link>
              <span>/</span>
              <span>Feedback</span>
            </div>
            <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Reader feedback
            </p>
            <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Feedback
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              Review private reader comments, source suggestions, ideas, issue
              reports, and commercial suggestions by vertical.
            </p>
          </header>

          <section className="mt-8 grid gap-4 lg:grid-cols-3">
            {feedbackCounts.map(({ vertical, items }) => (
                <Link
                  className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur transition hover:border-blue-200 hover:bg-blue-50/50"
                  href={`/admin/${vertical.slug}/feedback`}
                  key={vertical.id}
                >
                  <p className="text-sm font-bold text-blue-700">
                    {vertical.name}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {items.length}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {feedbackCountByCategory(items, "source_request")} source
                    requests
                  </p>
                </Link>
              ))}
          </section>

          <section className="mt-8">
            <FeedbackTable
              feedbackItems={visibleFeedback}
              showVertical
              verticalsById={verticalsById}
            />
          </section>
        </div>
      </AdminAccessGate>
    </AdminShell>
  );
}
