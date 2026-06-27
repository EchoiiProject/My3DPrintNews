"use client";

import { useState } from "react";

type EditorialButton = {
  actionType: string;
  label: string;
};

export function EditorialActionButtons({
  actions,
  articleId,
  caseId,
  role = "platform",
  verticalId,
}: {
  actions: EditorialButton[];
  articleId?: string | null;
  caseId?: string | null;
  role?: "licence_holder" | "platform";
  verticalId?: string | null;
}) {
  const [status, setStatus] = useState("");

  async function runAction(actionType: string) {
    setStatus("");

    const response = await fetch("/api/admin/editorial/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionType,
        articleId,
        caseId,
        role,
        verticalId,
      }),
    });
    const result = (await response.json()) as { message?: string };

    const message =
      response.ok
        ? result.message ?? "Editorial action recorded."
        : result.message ?? "Editorial action failed.";

    setStatus(message);
    window.setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.set("message", message);
      window.location.href = url.toString();
    }, 600);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <button
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:border-blue-200 hover:text-blue-700"
          key={action.actionType}
          onClick={() => void runAction(action.actionType)}
          type="button"
        >
          {action.label}
        </button>
      ))}
      {status ? (
        <span className="text-xs font-semibold text-blue-700">{status}</span>
      ) : null}
    </div>
  );
}
