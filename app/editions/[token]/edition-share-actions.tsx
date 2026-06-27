"use client";

import { EditorialReportButton } from "@/app/editorial-report-button";
import { ReactNode, useEffect, useState } from "react";

const HIDDEN_SOURCES_KEY = "mynewsnetwork-hidden-sources";
const READER_EMAIL_KEY = "mynewsnetwork-reader-email";

type HiddenSourcePreference = {
  mutedUntil?: string | null;
  sourceId: string;
  sourceName: string;
  verticalId?: string | null;
};

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

function hiddenSources(): HiddenSourcePreference[] {
  try {
    const value = localStorage.getItem(HIDDEN_SOURCES_KEY);

    return value ? (JSON.parse(value) as HiddenSourcePreference[]) : [];
  } catch {
    return [];
  }
}

function activeHiddenSources(): HiddenSourcePreference[] {
  const now = Date.now();

  return hiddenSources().filter((source) => {
    if (!source.mutedUntil) return true;

    const mutedUntil = new Date(source.mutedUntil).getTime();

    return Number.isFinite(mutedUntil) && mutedUntil > now;
  });
}

function sourceIsHidden(sourceId?: string | null) {
  return Boolean(
    sourceId &&
      activeHiddenSources().some((source) => source.sourceId === sourceId),
  );
}

function setHiddenItems(items: string[]) {
  localStorage.setItem("mynewsnetwork-hidden-items", JSON.stringify(items));
}

function hiddenItemKey(articleId: string | null | undefined, url: string) {
  return articleId ?? url;
}

async function syncUnhiddenArticle(articleId?: string | null) {
  const email = localStorage.getItem(READER_EMAIL_KEY);

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

async function syncUnhiddenSource(sourceId?: string | null) {
  const email = localStorage.getItem(READER_EMAIL_KEY);

  if (!email || !sourceId) return true;

  try {
    const response = await fetch("/api/reader-actions/source", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "unhide",
        email,
        sourceId,
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
  sourceId,
  sourceName,
  url,
  verticalId,
}: {
  articleId?: string | null;
  children: ReactNode;
  sourceId?: string | null;
  sourceName?: string | null;
  url: string;
  verticalId?: string | null;
}) {
  const [hidden, setHidden] = useState(false);
  const [sourceHidden, setSourceHidden] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const currentHiddenItems = hiddenItems();
    const key = hiddenItemKey(articleId, url);

    setHidden(
      currentHiddenItems.includes(key) ||
        Boolean(articleId && currentHiddenItems.includes(articleId)),
    );
    setSourceHidden(sourceIsHidden(sourceId));

    function handleHidden(event: Event) {
      const detail = (event as CustomEvent<{ key?: string }>).detail;

      if (detail?.key === key || (articleId && detail?.key === articleId)) {
        setStatus("");
        setHidden(true);
      }
    }

    window.addEventListener("mynewsnetwork:item-hidden", handleHidden);

    function handleSourcePreferencesChanged() {
      setSourceHidden(sourceIsHidden(sourceId));
    }

    window.addEventListener(
      "mynewsnetwork:source-preferences-changed",
      handleSourcePreferencesChanged,
    );

    return () => {
      window.removeEventListener("mynewsnetwork:item-hidden", handleHidden);
      window.removeEventListener(
        "mynewsnetwork:source-preferences-changed",
        handleSourcePreferencesChanged,
      );
    };
  }, [articleId, sourceId, url]);

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

  function undoSourceHide() {
    if (!sourceId) return;

    const next = hiddenSources().filter((source) => source.sourceId !== sourceId);

    localStorage.setItem(HIDDEN_SOURCES_KEY, JSON.stringify(next));
    setSourceHidden(false);
    setStatus("Source restored.");
    window.dispatchEvent(
      new CustomEvent("mynewsnetwork:source-preferences-changed"),
    );
    void syncUnhiddenSource(sourceId).then((ok) => {
      if (!ok) {
        setStatus("Restored here. We could not update your saved preference yet.");
      }
    });
  }

  if (hidden || sourceHidden) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white/88 p-4 shadow-xl shadow-blue-950/8">
        <p className="text-sm font-bold text-slate-950">
          {sourceHidden
            ? `${sourceName ?? "Source"} hidden from your feed.`
            : "Article hidden from your feed."}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
            onClick={sourceHidden ? undoSourceHide : undoHide}
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
  sourceId,
  sourceName,
  title,
  url,
  verticalId,
}: {
  articleId?: string | null;
  sourceId?: string | null;
  sourceName?: string | null;
  title: string;
  url: string;
  verticalId?: string | null;
}) {
  const { showStatus, status } = useShareStatus();
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);

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
    const email = localStorage.getItem(READER_EMAIL_KEY);

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

  async function hideSource(days?: number) {
    if (!sourceId) {
      showStatus("Source controls need an archived source record.");
      return;
    }

    const mutedUntil = days
      ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const next = [
      ...hiddenSources().filter((source) => source.sourceId !== sourceId),
      {
        mutedUntil,
        sourceId,
        sourceName: sourceName ?? "Source",
        verticalId,
      },
    ];

    localStorage.setItem(HIDDEN_SOURCES_KEY, JSON.stringify(next));
    setSourceMenuOpen(false);
    showStatus(
      days
        ? `Muted ${sourceName ?? "source"} for ${days} days.`
        : `Hidden ${sourceName ?? "source"}.`,
    );
    window.dispatchEvent(
      new CustomEvent("mynewsnetwork:source-preferences-changed"),
    );

    const email = localStorage.getItem(READER_EMAIL_KEY);

    if (!email) return;

    try {
      await fetch("/api/reader-actions/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          mutedUntil,
          reason: mutedUntil ? "reader_mute" : "reader_hide",
          sourceId,
          verticalId,
        }),
      });
    } catch {
      showStatus("Preference saved here. We could not sync it yet.");
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
      <button
        className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
        onClick={hideItem}
        type="button"
      >
        Hide from my feed
      </button>
      <div className="relative">
        <button
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-3 text-sm font-bold text-blue-700 hover:bg-blue-50"
          onClick={() => setSourceMenuOpen((value) => !value)}
          type="button"
        >
          Less from this source
        </button>
        {sourceMenuOpen ? (
          <div className="absolute z-10 mt-2 w-56 rounded-md border border-slate-200 bg-white p-2 shadow-xl shadow-blue-950/10">
            <button
              className="block w-full rounded px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => hideSource(7)}
              type="button"
            >
              Mute source for 7 days
            </button>
            <button
              className="block w-full rounded px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => hideSource(30)}
              type="button"
            >
              Mute source for 30 days
            </button>
            <button
              className="block w-full rounded px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={() => hideSource()}
              type="button"
            >
              Hide this source
            </button>
          </div>
        ) : null}
      </div>
      {status ? (
        <span className="text-sm font-semibold text-blue-700">{status}</span>
      ) : null}
    </div>
  );
}
