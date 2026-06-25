"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = Partial<
  Record<"name" | "websiteUrl" | "logoUrl" | "contactEmail", string>
>;

type ApiResponse = {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
};

export function NewOrganisationForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitOrganisation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch("/api/admin/organisations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          websiteUrl,
          logoUrl,
          contactEmail,
        }),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message);
        return;
      }

      setName("");
      setWebsiteUrl("");
      setLogoUrl("");
      setContactEmail("");
      setMessage("Organisation created successfully.");
      router.refresh();
    } catch {
      setMessage("The organisation could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
      <div>
        <h2 className="text-2xl font-bold text-blue-950">
          New Organisation
        </h2>
        <p className="mt-2 text-sm leading-6 text-blue-900">
          Create an organisation record in Supabase for a future vertical owner.
        </p>
      </div>
      <form className="mt-5 space-y-4" onSubmit={submitOrganisation}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Organisation name
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
            {errors.name ? (
              <span className="mt-1 block text-xs font-semibold text-red-700">
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Website URL
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setWebsiteUrl(event.target.value)}
              placeholder="https://example.com"
              type="url"
              value={websiteUrl}
            />
            {errors.websiteUrl ? (
              <span className="mt-1 block text-xs font-semibold text-red-700">
                {errors.websiteUrl}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">Logo URL</span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setLogoUrl(event.target.value)}
              placeholder="https://example.com/logo.png"
              type="url"
              value={logoUrl}
            />
            {errors.logoUrl ? (
              <span className="mt-1 block text-xs font-semibold text-red-700">
                {errors.logoUrl}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Contact email
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setContactEmail(event.target.value)}
              placeholder="owner@example.com"
              type="email"
              value={contactEmail}
            />
            {errors.contactEmail ? (
              <span className="mt-1 block text-xs font-semibold text-red-700">
                {errors.contactEmail}
              </span>
            ) : null}
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Create organisation"}
          </button>
          {message ? (
            <p
              className={[
                "text-sm font-semibold",
                message.includes("success")
                  ? "text-emerald-700"
                  : "text-red-700",
              ].join(" ")}
            >
              {message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
