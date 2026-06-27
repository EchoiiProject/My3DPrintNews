import { NextResponse } from "next/server";
import { isValidEmail } from "@/lib/newsletter";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type EmailQueuePayload = {
  email?: unknown;
  requestType?: unknown;
  verticalId?: unknown;
  articleId?: unknown;
  publicationName?: unknown;
  publicationUrl?: unknown;
  filterContext?: unknown;
  articleTitle?: unknown;
  articleSource?: unknown;
  articleSummary?: unknown;
  articleUrl?: unknown;
  feedItems?: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function feedItems(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;

      return {
        id: text(record.id),
        title: text(record.title) ?? "Untitled article",
        source: text(record.source) ?? "Unknown source",
        summary: text(record.summary) ?? "",
        url: text(record.url) ?? "",
      };
    })
    .filter(Boolean)
    .slice(0, 12);
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function POST(request: Request) {
  let body: EmailQueuePayload;

  try {
    body = (await request.json()) as EmailQueuePayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid email request." },
      { status: 400 },
    );
  }

  const email = text(body.email) ?? "";
  const requestType = text(body.requestType);

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  if (requestType !== "article" && requestType !== "feed") {
    return NextResponse.json(
      { ok: false, message: "Please choose article or feed email." },
      { status: 400 },
    );
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message: "Email request queued for later sending.",
    });
  }

  const insert = await supabase.from("reader_email_queue").insert({
    vertical_id: text(body.verticalId),
    article_id: requestType === "article" ? text(body.articleId) : null,
    email,
    request_type: requestType,
    publication_name: text(body.publicationName),
    publication_url: text(body.publicationUrl),
    filter_context: objectValue(body.filterContext),
    article_title: text(body.articleTitle),
    article_source: text(body.articleSource),
    article_summary: text(body.articleSummary),
    article_url: text(body.articleUrl),
    feed_items: feedItems(body.feedItems),
    status: "pending",
  });

  if (insert.error) {
    console.error("Reader email queue insert error", insert.error);

    return NextResponse.json(
      { ok: false, message: "Email request could not be queued right now." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Email request queued for later sending.",
  });
}
