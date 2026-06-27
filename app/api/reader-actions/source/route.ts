import { NextResponse } from "next/server";
import { hideReaderSource, unhideReaderSource } from "@/lib/readers";

type SourceControlPayload = {
  action?: unknown;
  email?: unknown;
  mutedUntil?: unknown;
  reason?: unknown;
  sourceId?: unknown;
  verticalId?: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  let body: SourceControlPayload;

  try {
    body = (await request.json()) as SourceControlPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid source control request." },
      { status: 400 },
    );
  }

  const action = text(body.action) ?? "hide";
  const sourceId = text(body.sourceId);

  if (!sourceId) {
    return NextResponse.json(
      { ok: false, message: "Missing source to update." },
      { status: 400 },
    );
  }

  const ok =
    action === "unhide"
      ? await unhideReaderSource({
          email: text(body.email),
          sourceId,
        })
      : await hideReaderSource({
          email: text(body.email),
          mutedUntil: text(body.mutedUntil),
          reason: text(body.reason),
          sourceId,
          verticalId: text(body.verticalId),
        });

  return NextResponse.json({
    ok,
    message:
      action === "unhide"
        ? "Source restored."
        : "Source preference saved.",
  });
}
