import Link from "next/link";
import { redirect } from "next/navigation";
import {
  adminPasswordMatches,
  clearAdminAccessSession,
  hasAdminAccess,
  isAdminAccessConfigured,
  setAdminAccessSession,
} from "@/lib/admin-auth";
import { products, productPlacements } from "@/config/products";
import { FooterLinks } from "../../footer-links";
import { GlobalNav } from "../../global-nav";
import { ProductCard } from "../../product-card";

async function enterAdminPanel(formData: FormData) {
  "use server";

  if (adminPasswordMatches(formData.get("password"))) {
    await setAdminAccessSession();
    redirect("/admin/products");
  }

  redirect("/admin/products?error=invalid");
}

async function logoutAdmin() {
  "use server";

  await clearAdminAccessSession();
  redirect("/admin/products");
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <GlobalNav />
        {children}
        <FooterLinks />
      </section>
    </main>
  );
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

function AdminLogin({ hasError }: { hasError: boolean }) {
  return (
    <AdminShell>
      <div className="flex flex-1 items-center py-12">
        <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white/88 p-6 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Secure area</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Product Admin Access
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter the admin password to view product promotion inventory.
          </p>
          <form action={enterAdminPanel} className="mt-5 space-y-4">
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
    </AdminShell>
  );
}

export default async function ProductAdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const reviewMode = !isAdminAccessConfigured();
  const canAccess = reviewMode ? true : await hasAdminAccess();

  if (!canAccess) {
    const params = await searchParams;

    return <AdminLogin hasError={params?.error === "invalid"} />;
  }

  return (
    <AdminShell>
      <div className="flex-1 py-10">
        {reviewMode ? <ReviewModeBanner /> : null}
        <header>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <Link className="text-blue-700 hover:text-blue-900" href="/admin">
              Admin
            </Link>
            <span>/</span>
            <span>Products</span>
          </div>
          <p className="mb-4 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
            Product promotion prototype
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
            Products
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
            Manage static demo product promotions for future white-label
            verticals. This is not an ecommerce or checkout system.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
              type="button"
            >
              Add Product (mock)
            </button>
            {!reviewMode ? (
            <form action={logoutAdmin}>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
                type="submit"
              >
                Logout
              </button>
            </form>
            ) : null}
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-sm font-bold text-blue-700 transition hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              href="/admin/advertising"
            >
              Advertising admin
            </Link>
            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100"
              href="/admin"
            >
              Back to Admin Hub
            </Link>
          </div>
        </header>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-2xl font-bold text-slate-950">
            Product inventory
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="py-3 pr-4">Product name</th>
                  <th className="py-3 pr-4">Brand</th>
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Price</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Featured</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    className="border-b border-slate-100 last:border-b-0"
                    key={product.id}
                  >
                    <td className="py-4 pr-4 font-bold text-slate-950">
                      {product.title}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-slate-600">
                      {product.brand}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-slate-600">
                      {product.category}
                    </td>
                    <td className="py-4 pr-4 font-semibold text-slate-600">
                      {product.currency} {product.price}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={[
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-bold",
                          product.active
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500",
                        ].join(" ")}
                      >
                        {product.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-slate-600">
                      {product.featured ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <h2 className="text-2xl font-bold text-slate-950">
            Product placements
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {productPlacements.map((placement) => (
              <article
                className="rounded-md border border-slate-200 bg-slate-50/70 p-4"
                key={placement.id}
              >
                <p className="text-sm font-bold text-blue-700">
                  {placement.id}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  {placement.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {placement.description}
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                  {placement.enabled ? "Enabled" : "Planned"}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-2xl font-bold text-slate-950">
            Product card preview
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  );
}
