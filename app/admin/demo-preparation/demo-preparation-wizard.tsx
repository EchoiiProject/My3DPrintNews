"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Vertical } from "@/config/verticals";
import type { Organisation } from "@/lib/verticals";
import { selectableSources } from "@/config/registry";

type DemoSource = {
  id: string;
  label: string;
  enabled: boolean;
};

const strategies = [
  { label: "Retail Growth", value: "retail_growth" },
  { label: "Publisher", value: "publisher" },
  { label: "Community", value: "community" },
];

const previewLinks = [
  { label: "Homepage", href: "/" },
  { label: "Feed", href: "/feed" },
  { label: "Catch Up", href: "/catch-up" },
  { label: "Newsletter Preview", href: "/newsletter-preview/demo" },
  { label: "Discover More", href: "/discover-more" },
  { label: "Feedback", href: "/admin/feedback" },
];

export function DemoPreparationWizard({
  organisations,
  verticals,
}: {
  organisations: Organisation[];
  verticals: Vertical[];
}) {
  const [organisationMode, setOrganisationMode] = useState<"existing" | "new">(
    "existing",
  );
  const [verticalMode, setVerticalMode] = useState<"existing" | "new">(
    "existing",
  );
  const [selectedOrganisation, setSelectedOrganisation] = useState(
    organisations[0]?.id ?? "",
  );
  const [selectedVertical, setSelectedVertical] = useState(
    verticals[0]?.id ?? "",
  );
  const [publicationName, setPublicationName] = useState("Demo Publication");
  const [description, setDescription] = useState(
    "Private demonstration vertical prepared for a sales meeting.",
  );
  const [website, setWebsite] = useState("");
  const [logo, setLogo] = useState("");
  const [strategy, setStrategy] = useState("retail_growth");
  const [sources, setSources] = useState<DemoSource[]>(
    selectableSources.slice(0, 8).map((source) => ({
      id: source.id,
      label: source.label,
      enabled: source.status === "active",
    })),
  );
  const [newSourceName, setNewSourceName] = useState("");
  const [notes, setNotes] = useState(
    [
      "Customer: SSS Racing",
      "Meeting: Tuesday",
      "Interested in: Traffic generation",
      "Potential concerns: Already has Shopify",
    ].join("\n"),
  );

  const enabledSources = sources.filter((source) => source.enabled);
  const readinessItems = useMemo(
    () => [
      {
        label: "Organisation created",
        ready: organisationMode === "existing" ? Boolean(selectedOrganisation) : true,
      },
      {
        label: "Vertical created",
        ready: verticalMode === "existing" ? Boolean(selectedVertical) : true,
      },
      { label: "Sources configured", ready: enabledSources.length > 0 },
      { label: "Newsletter enabled", ready: true },
      { label: "Feedback enabled", ready: true },
      { label: "Discover More configured", ready: true },
    ],
    [
      enabledSources.length,
      organisationMode,
      selectedOrganisation,
      selectedVertical,
      verticalMode,
    ],
  );
  const demoReady = readinessItems.every((item) => item.ready);

  function addSource() {
    const label = newSourceName.trim();

    if (!label) {
      return;
    }

    setSources((current) => [
      ...current,
      {
        id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label,
        enabled: true,
      },
    ]);
    setNewSourceName("");
  }

  function toggleSource(id: string) {
    setSources((current) =>
      current.map((source) =>
        source.id === id ? { ...source, enabled: !source.enabled } : source,
      ),
    );
  }

  function removeSource(id: string) {
    setSources((current) => current.filter((source) => source.id !== id));
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {[
            "Organisation",
            "Vertical",
            "Publication",
            "Sources",
            "Preview",
            "Readiness",
          ].map((step, index) => (
            <span
              className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700"
              key={step}
            >
              Step {index + 1}: {step}
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Step 1</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Organisation
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["existing", "new"] as const).map((mode) => (
              <button
                className={[
                  "inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-bold",
                  organisationMode === mode
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
                key={mode}
                onClick={() => setOrganisationMode(mode)}
                type="button"
              >
                {mode === "existing"
                  ? "Select existing organisation"
                  : "Create new organisation"}
              </button>
            ))}
          </div>
          {organisationMode === "existing" ? (
            <select
              className="mt-4 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
              onChange={(event) => setSelectedOrganisation(event.target.value)}
              value={selectedOrganisation}
            >
              {organisations.map((organisation) => (
                <option key={organisation.id} value={organisation.id}>
                  {organisation.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
              New organisation will be created through Organisation Management
              before publishing.
            </p>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Step 2</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Vertical</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["existing", "new"] as const).map((mode) => (
              <button
                className={[
                  "inline-flex min-h-10 items-center rounded-md border px-3 text-sm font-bold",
                  verticalMode === mode
                    ? "border-blue-500 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
                key={mode}
                onClick={() => setVerticalMode(mode)}
                type="button"
              >
                {mode === "existing"
                  ? "Select existing vertical"
                  : "Create new vertical"}
              </button>
            ))}
          </div>
          {verticalMode === "existing" ? (
            <select
              className="mt-4 min-h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
              onChange={(event) => setSelectedVertical(event.target.value)}
              value={selectedVertical}
            >
              {verticals.map((vertical) => (
                <option key={vertical.id} value={vertical.id}>
                  {vertical.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="mt-4 rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-900">
              New demo vertical defaults to Demo lifecycle and Private
              visibility.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <p className="text-sm font-semibold text-blue-700">Step 3</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Publication
        </h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-bold text-slate-700">
              Publication name
            </span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              onChange={(event) => setPublicationName(event.target.value)}
              value={publicationName}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Website</span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              onChange={(event) => setWebsite(event.target.value)}
              value={website}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Logo</span>
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm"
              onChange={(event) => setLogo(event.target.value)}
              value={logo}
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-slate-700">Strategy</span>
            <select
              className="mt-1 min-h-11 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold"
              onChange={(event) => setStrategy(event.target.value)}
              value={strategy}
            >
              {strategies.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="text-sm font-bold text-slate-700">
              Description
            </span>
            <textarea
              className="mt-1 min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
            Lifecycle: Demo
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
            Visibility: Private
          </span>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <p className="text-sm font-semibold text-blue-700">Step 4</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">
          Prepare Initial News Sources
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="min-h-11 flex-1 rounded-md border border-slate-200 px-3 text-sm"
            onChange={(event) => setNewSourceName(event.target.value)}
            placeholder="Add source name"
            value={newSourceName}
          />
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white"
            onClick={addSource}
            type="button"
          >
            Add source
          </button>
        </div>
        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {sources.map((source) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2"
              key={source.id}
            >
              <div>
                <p className="text-sm font-bold text-slate-800">
                  {source.label}
                </p>
                <p className="text-xs font-semibold text-slate-500">
                  {source.enabled ? "Enabled" : "Disabled"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-700"
                  onClick={() => toggleSource(source.id)}
                  type="button"
                >
                  {source.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  className="rounded-md border border-red-100 bg-white px-2 py-1 text-xs font-bold text-red-700"
                  onClick={() => removeSource(source.id)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Step 5</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">Preview</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {previewLinks.map((link) => (
              <Link
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
          <p className="text-sm font-semibold text-blue-700">Step 6</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-950">
            Demo Readiness
          </h2>
          <div className="mt-4 space-y-2">
            {readinessItems.map((item) => (
              <p
                className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-semibold"
                key={item.label}
              >
                <span>{item.label}</span>
                <span className={item.ready ? "text-emerald-700" : "text-slate-500"}>
                  {item.ready ? "Ready" : "Pending"}
                </span>
              </p>
            ))}
          </div>
          <p className="mt-4 rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
            Status: {demoReady ? "Demo Ready" : "Needs Review"}
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-xl shadow-blue-950/8 backdrop-blur">
        <h2 className="text-2xl font-bold text-slate-950">Sales Notes</h2>
        <textarea
          className="mt-4 min-h-40 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          onChange={(event) => setNotes(event.target.value)}
          value={notes}
        />
        <p className="mt-4 rounded-md border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
          This demonstration remains private until a Vertical Admin is assigned.
        </p>
      </section>
    </div>
  );
}
