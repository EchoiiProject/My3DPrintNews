import { NextResponse } from "next/server";
import { hideReaderItem, unhideReaderItem } from "@/lib/readers";

type HidePayload = {
  action?: unknown;
  articleId?: unknown;
  email?: unknown;
  reason?: unknown;
  verticalId?: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  let body: HidePayload;

  try {
    body = (await request.json()) as HidePayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid hide request." },
      { status: 400 },
    );
  }

  const articleId = text(body.articleId);
  const action = text(body.action) ?? "hide";

  if (!articleId) {
    return NextResponse.json(
      { ok: false, message: "Missing article to hide." },
      { status: 400 },
    );
  }

  const ok =
    action === "unhide"
      ? await unhideReaderItem({
          articleId,
          email: text(body.email),
        })
      : await hideReaderItem({
          articleId,
          email: text(body.email),
          reason: text(body.reason),
          verticalId: text(body.verticalId),
        });

  return NextResponse.json({
    ok,
    message:
      action === "unhide" ? "Restored to your feed." : "Hidden from your feed.",
  });
}
