"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";

type DialogBaseProps = {
  body?: string;
  children?: ReactNode;
  confirmLabel?: string;
  onCancel: () => void;
  open: boolean;
  title?: string;
};

export function MyNewsNetworkConfirmDialog({
  body,
  children,
  confirmLabel = "Confirm",
  heading,
  onCancel,
  onConfirm,
  open,
  title = "MyNewsNetwork",
}: DialogBaseProps & {
  heading: string;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          {title}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{heading}</h2>
        {body ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
        ) : null}
        {children}
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export function MyNewsNetworkEmailDialog({
  body,
  confirmLabel = "Continue",
  defaultEmail = "",
  heading,
  onCancel,
  onSubmit,
  open,
  title = "MyNewsNetwork",
}: DialogBaseProps & {
  defaultEmail?: string;
  heading: string;
  onSubmit: (email: string) => void;
}) {
  const [email, setEmail] = useState(defaultEmail);

  useEffect(() => {
    if (open) setEmail(defaultEmail);
  }, [defaultEmail, open]);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!value) return;

    onSubmit(value);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <form
        className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20"
        onSubmit={submit}
      >
        <p className="text-xs font-bold uppercase tracking-wide text-blue-700">
          {title}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-950">{heading}</h2>
        {body ? (
          <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
        ) : null}
        <label className="mt-4 grid gap-1 text-xs font-bold uppercase tracking-wide text-slate-500">
          Email
          <input
            className="min-h-11 rounded-md border border-slate-200 px-3 text-sm font-semibold normal-case tracking-normal text-slate-900"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <button
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-bold text-white hover:bg-blue-700"
            type="submit"
          >
            {confirmLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
