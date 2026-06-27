"use client";

import { EditorialReportButton } from "@/app/editorial-report-button";
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

function setHiddenItems(items: string[]) {
  localStorage.setItem("mynewsnetwork-hidden-items", JSON.stringify(items));
}

function hiddenItemKey(articleId: string | null | undefined, url: string) {
  return articleId ?? url;
}

async function syncUnhiddenArticle(articleId?: string | null) {
  const email = localStorage.getItem("mynewsnetwork-reader-email");

  if (!email || !articleId) return true;

  try {
    const response = await fetch("/api/reader-actions/hide", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "unhide",
        articleId,
        email,
      }),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function ReaderHiddenItem({
  articleId,
  children,
  url,
  verticalId,
}: {
  articleId?: string | null;
  children: ReactNode;
  url: string;
  verticalId?: string | null;
}) {
  const [hidden, setHidden] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const currentHiddenItems = hiddenItems();
    const key = hiddenItemKey(articleId, url);

    setHidden(
      currentHiddenItems.includes(key) ||
        Boolean(articleId && currentHiddenItems.includes(articleId)),
    );

    function handleHidden(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;

      if (detail?.key === key || (articleId && detail?.key === articleId)) {
        setStatus("");
        setHidden(true);
      }
    }

    window.addEventListener("mynewsnetwork:item-hidden", handleHidden);

    return () => {
      window.removeEventListener("mynewsnetwork:item-hidden", handleHidden);
    };
  }, [articleId, url]);

  function undoHide() {
    const key = hiddenItemKey(articleId, url);
    const next = hiddenItems().filter(
      (item) => item !== key && (!articleId || item !== articleId),
    );

    setHiddenItems(next);
    setHidden(false);
    setStatus("Restored to your feed.");
    void syncUnhiddenArticle(articleId).then((ok) => {
      if (!ok) {
        setStatus(
          "Restored here. We could not update your saved preference yet.",
        );
      }
    });
  }

  if (hidden) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8">
        <p className="text-sm font-bold text-slate-950">
          Article hidden from your feed.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            onClick={undoHide}
            type="button"
          >
            Undo
          </button>
          <EditorialReportButton articleId={articleId} verticalId={verticalId} />
          {status ? (
            <span className="text-sm font-semibold text-blue-700">
              {status}
            </span>
          ) : null}
        </div>
      </section>
    );
  }

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
    window.dispatchEvent(
      new CustomEvent("mynewsnetwork:item-hidden", { detail: { key } }),
    );
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
