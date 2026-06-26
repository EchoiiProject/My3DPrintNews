"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FooterLinks } from "../footer-links";

const reasons = [
  "General",
  "Publisher request",
  "Correction",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("General");

  useEffect(() => {
    const queryReason = new URLSearchParams(window.location.search).get(
      "reason",
    );

    if (queryReason === "publisher") {
      setReason("Publisher request");
    }
  }, []);

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          reason: formData.get("reason"),
          message: formData.get("message"),
        }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      setStatus({
        tone: response.ok && result.ok ? "success" : "error",
        message:
          response.ok && result.ok
            ? "Thank you for contacting MyNewsNetwork. Your message has been received."
            : result.message ??
              "Something went wrong while preparing your message.",
      });
    } catch {
      setStatus({
        tone: "error",
        message: "Something went wrong while preparing your message.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            MyNewsNetwork
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
            <Link className="hover:text-blue-700" href="/">
              Publications
            </Link>
            <Link className="hover:text-blue-700" href="/publishers">
              Publishers
            </Link>
          </div>
        </nav>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:py-16">
          <header>
            <p className="mb-5 inline-flex rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm shadow-blue-100/60">
              Contact
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-6xl">
              Contact MyNewsNetwork
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Users, publishers, and partners can get in touch about feedback,
              publisher requests, corrections, attribution, partnerships, or
              general questions.
            </p>
          </header>

          <section className="rounded-lg border border-slate-200 bg-white/88 p-5 shadow-2xl shadow-blue-950/10 backdrop-blur sm:p-6">
            <form className="space-y-4" onSubmit={submitContact}>
              <div>
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                  id="name"
                  name="name"
                  required
                  type="text"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  className="mt-2 min-h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                  id="email"
                  name="email"
                  required
                  type="email"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="reason"
                >
                  Reason
                </label>
                <select
                  className="mt-2 min-h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                  id="reason"
                  name="reason"
                  onChange={(event) => setReason(event.target.value)}
                  value={reason}
                >
                  {reasons.map((reason) => (
                    <option key={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-bold text-slate-700"
                  htmlFor="message"
                >
                  Message
                </label>
                <textarea
                  className="mt-2 min-h-36 w-full rounded-md border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus-visible:ring-4 focus-visible:ring-blue-100"
                  id="message"
                  name="message"
                  required
                />
              </div>

              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                disabled={submitting}
                type="submit"
              >
                {submitting ? "Preparing..." : "Submit"}
              </button>

              {status ? (
                <p
                  className={[
                    "rounded-md px-4 py-3 text-sm font-semibold leading-6",
                    status.tone === "success"
                      ? "bg-blue-50 text-blue-900"
                      : "bg-red-50 text-red-800",
                  ].join(" ")}
                >
                  {status.message}
                </p>
              ) : null}
            </form>
          </section>
        </div>

        <FooterLinks />
      </section>
    </main>
  );
}
