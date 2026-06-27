import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/newsletter";
import { saveReadingListItem, unsaveReadingListItem } from "@/lib/readers";

type SavePayload = {
  email?: unknown;
  articleId?: unknown;
  verticalId?: unknown;
  action?: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(request: Request) {
  let body: SavePayload;

  try {
    body = (await request.json()) as SavePayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid save request." },
      { status: 400 },
    );
  }

  const email = text(body.email) ?? "";
  const articleId = text(body.articleId);
  const verticalId = text(body.verticalId);
  const action = text(body.action) ?? "save";

  if (!isValidEmail(email) || !articleId) {
    return NextResponse.json(
      { ok: false, message: "Save request is missing reader or article data." },
      { status: 400 },
    );
  }

  const ok =
    action === "unsave"
      ? await unsaveReadingListItem({ email, articleId })
      : await saveReadingListItem({ email, articleId, verticalId });

  return NextResponse.json({
    ok,
    message: ok
      ? action === "unsave"
        ? "Removed from reading list."
        : "Saved to reading list."
      : "Reading list sync is unavailable.",
  });
}
