import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  adminPasswordMatches,
  hasAdminAccess,
  isAdminAccessConfigured,
  setAdminAccessSession,
} from "@/lib/admin-auth";

async function enterAdminPanel(formData: FormData) {
  "use server";

  const redirectTo = formData.get("redirectTo");
  const safeRedirect =
    typeof redirectTo === "string" && redirectTo.startsWith("/admin")
      ? redirectTo
      : "/admin";

  if (adminPasswordMatches(formData.get("password"))) {
    await setAdminAccessSession();
    redirect(safeRedirect);
  }

  redirect(`${safeRedirect}?error=invalid`);
}

function ReviewModeBanner() {
  return (
    <section className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
      <p className="text-sm font-bold text-amber-900">
        Review Mode - Admin security not configured
      </p>
      <p className="mt-1 text-sm leading-6 text-amber-800">
        Set ADMIN_ACCESS_PASSWORD to require password access for this admin
        area.
      </p>
    </section>
  );
}

function AdminLogin({
  hasError,
  redirectTo,
  title,
}: {
  hasError: boolean;
  redirectTo: string;
  title: string;
}) {
  return (
    <div className="flex flex-1 items-center py-12">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white/88 p-6 shadow-xl shadow-blue-950/8 backdrop-blur">
        <p className="text-sm font-semibold text-blue-700">Secure area</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Enter the admin password to continue.
        </p>
        <form action={enterAdminPanel} className="mt-5 space-y-4">
          <input name="redirectTo" type="hidden" value={redirectTo} />
          <div>
            <label
              className="text-sm font-bold text-slate-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              autoComplete="current-password"
              className="mt-2 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>
          {hasError ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              That password was not accepted.
            </p>
          ) : null}
          <button
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            type="submit"
          >
            Enter admin panel
          </button>
        </form>
      </section>
    </div>
  );
}

export async function AdminAccessGate({
  children,
  error,
  loginTitle,
  redirectTo,
}: {
  children: ReactNode;
  error?: string;
  loginTitle: string;
  redirectTo: string;
}) {
  const reviewMode = !isAdminAccessConfigured();
  const canAccess = reviewMode ? true : await hasAdminAccess();

  if (!canAccess) {
    return (
      <AdminLogin
        hasError={error === "invalid"}
        redirectTo={redirectTo}
        title={loginTitle}
      />
    );
  }

  return (
    <>
      {reviewMode ? <ReviewModeBanner /> : null}
      {children}
    </>
  );
}
