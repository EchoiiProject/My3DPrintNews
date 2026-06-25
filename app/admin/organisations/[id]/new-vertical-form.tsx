"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type FieldErrors = Partial<
  Record<
    | "organisation"
    | "name"
    | "slug"
    | "strategy"
    | "status"
    | "visibility"
    | "publicUrl",
    string
  >
>;

type ApiResponse = {
  ok: boolean;
  message: string;
  errors?: FieldErrors;
};

const strategyOptions = ["retail_growth", "publisher", "community"];
const statusOptions = ["prospect", "demo", "trial", "live", "archived"];
const visibilityOptions = ["private", "public"];

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function NewVerticalForm({ organisationId }: { organisationId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [strategy, setStrategy] = useState("retail_growth");
  const [status, setStatus] = useState("prospect");
  const [visibility, setVisibility] = useState("private");
  const [publicUrl, setPublicUrl] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateName(value: string) {
    setName(value);

    if (!slug) {
      setSlug(slugify(value));
    }
  }

  async function submitVertical(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setMessage("");

    try {
      const response = await fetch(
        `/api/admin/organisations/${organisationId}/verticals`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            slug,
            description,
            strategy,
            status,
            visibility,
            publicUrl,
          }),
        },
      );
      const result = (await response.json()) as ApiResponse;

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setMessage(result.message);
        return;
      }

      setName("");
      setSlug("");
      setDescription("");
      setStrategy("retail_growth");
      setStatus("prospect");
      setVisibility("private");
      setPublicUrl("");
      setMessage("Vertical created successfully.");
      router.refresh();
    } catch {
      setMessage("The vertical could not be saved. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-blue-100 bg-blue-50/80 p-5">
      <div>
        <h2 className="text-2xl font-bold text-blue-950">Create Vertical</h2>
        <p className="mt-2 text-sm leading-6 text-blue-900">
          Create a real vertical under this organisation in Supabase.
        </p>
      </div>
      <form className="mt-5 space-y-4" onSubmit={submitVertical}>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Vertical name
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => updateName(event.target.value)}
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
            <span className="text-sm font-bold text-blue-950">Slug</span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setSlug(slugify(event.target.value))}
              required
              value={slug}
            />
            {errors.slug ? (
              <span className="mt-1 block text-xs font-semibold text-red-700">
                {errors.slug}
              </span>
            ) : null}
          </label>

          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-blue-950">
              Description
            </span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-blue-100 bg-white/90 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">Strategy</span>
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setStrategy(event.target.value)}
              value={strategy}
            >
              {strategyOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Lifecycle/status
            </span>
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
            >
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Visibility
            </span>
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setVisibility(event.target.value)}
              value={visibility}
            >
              {visibilityOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-bold text-blue-950">
              Public URL
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-blue-100 bg-white/90 px-3 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
              onChange={(event) => setPublicUrl(event.target.value)}
              placeholder="https://example.com"
              type="url"
              value={publicUrl}
            />
            {errors.publicUrl ? (
              <span className="mt-1 block text-xs font-semibold text-red-700">
                {errors.publicUrl}
              </span>
            ) : null}
          </label>
        </div>

        {errors.organisation ? (
          <p className="text-sm font-semibold text-red-700">
            {errors.organisation}
          </p>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : "Create vertical"}
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
