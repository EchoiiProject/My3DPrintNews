"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

const reasons = [
  "General",
  "Publisher request",
  "Correction",
  "Partnership",
  "Other",
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [reason, setReason] = useState("General");

  useEffect(() => {
    const queryReason = new URLSearchParams(window.location.search).get(
      "reason",
    );

    if (queryReason === "publisher") {
      setReason("Publisher request");
    }
  }, []);

  function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9edff,transparent_32%),linear-gradient(135deg,#f8fbff_0%,#eef7ff_44%,#ffffff_100%)] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-12">
        <nav className="flex items-center justify-between border-b border-slate-200/80 pb-5">
          <Link
            className="text-lg font-bold tracking-tight text-slate-950"
            href="/"
          >
            My3DPrintNews
          </Link>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-600 sm:gap-6">
            <Link className="hover:text-blue-700" href="/">
              Feed Builder
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
              Contact My3DPrintNews
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
                />
              </div>

              <button
                className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                type="submit"
              >
                Submit
              </button>

              {submitted ? (
                <p className="rounded-md bg-blue-50 px-4 py-3 text-sm font-semibold leading-6 text-blue-900">
                  Thanks — your message has been prepared. Email sending will be
                  connected in a later sprint.
                </p>
              ) : null}
            </form>
          </section>
        </div>
      </section>
    </main>
  );
}
