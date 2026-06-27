"use client";

import { useState } from "react";

async function copyText(value: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard unavailable");
  }

  await navigator.clipboard.writeText(value);
}

function useShareStatus() {
  const [status, setStatus] = useState("");

  function showStatus(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2500);
  }

  return { showStatus, status };
}

export function EditionShareActions({
  title,
}: {
  title: string;
}) {
  const { showStatus, status } = useShareStatus();

  async function shareEdition() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url,
        });
        showStatus("Share opened.");
        return;
      }

      await copyText(url);
      showStatus("Edition link copied.");
    } catch {
      try {
        await copyText(url);
        showStatus("Edition link copied.");
      } catch {
        showStatus("Share unavailable.");
      }
    }
  }

  async function copyEditionLink() {
    try {
      await copyText(window.location.href);
      showStatus("Edition link copied.");
    } catch {
      showStatus("Copy unavailable.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
        onClick={shareEdition}
        type="button"
      >
        Share Edition
      </button>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
        onClick={copyEditionLink}
        type="button"
      >
        Copy Edition Link
      </button>
      {status ? (
        <span className="text-sm font-semibold text-blue-700">{status}</span>
      ) : null}
    </div>
  );
}

export function EditionItemShareActions({
  title,
  url,
}: {
  title: string;
  url: string;
}) {
  const { showStatus, status } = useShareStatus();

  async function shareItem() {
    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: title,
          url,
        });
        showStatus("Share opened.");
        return;
      }

      await copyText(url);
      showStatus("Article link copied.");
    } catch {
      try {
        await copyText(url);
        showStatus("Article link copied.");
      } catch {
        showStatus("Share unavailable.");
      }
    }
  }

  async function copyItemLink() {
    try {
      await copyText(url);
      showStatus("Article link copied.");
    } catch {
      showStatus("Copy unavailable.");
    }
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
        onClick={shareItem}
        type="button"
      >
        Share Item
      </button>
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
        onClick={copyItemLink}
        type="button"
      >
        Copy Item Link
      </button>
      {status ? (
        <span className="text-sm font-semibold text-blue-700">{status}</span>
      ) : null}
    </div>
  );
}
