"use client";

import { ReactNode, useEffect, useState } from "react";

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

function hiddenItems(): string[] {
  try {
    const value = localStorage.getItem("mynewsnetwork-hidden-items");

    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

export function ReaderHiddenItem({
  articleId,
  children,
  url,
}: {
  articleId?: string | null;
  children: ReactNode;
  url: string;
}) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const currentHiddenItems = hiddenItems();

    setHidden(
      currentHiddenItems.includes(articleId ?? "") ||
        currentHiddenItems.includes(url),
    );
  }, [articleId, url]);

  if (hidden) return null;

  return children;
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
  articleId,
  title,
  url,
  verticalId,
}: {
  articleId?: string | null;
  title: string;
  url: string;
  verticalId?: string | null;
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

  async function hideItem() {
    const key = articleId ?? url;
    const existing = hiddenItems();
    const next = Array.from(new Set([...existing, key]));
    const email = localStorage.getItem("mynewsnetwork-reader-email");

    localStorage.setItem("mynewsnetwork-hidden-items", JSON.stringify(next));

    if (email && articleId) {
      try {
        await fetch("/api/reader-actions/hide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articleId,
            email,
            verticalId,
          }),
        });
      } catch {
        // Local hide still applies to this browser.
      }
    }

    showStatus("Hidden from your feed.");
    window.setTimeout(() => window.location.reload(), 400);
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
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
        onClick={hideItem}
        type="button"
      >
        Hide from my feed
      </button>
      {status ? (
        <span className="text-sm font-semibold text-blue-700">{status}</span>
      ) : null}
    </div>
  );
}
