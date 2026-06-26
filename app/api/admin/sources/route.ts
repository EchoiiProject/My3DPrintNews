import { NextResponse } from "next/server";
import { createManagedSource, normaliseSourceType } from "@/lib/sources";

type SourcePayload = {
  name?: unknown;
  rssUrl?: unknown;
  rss_url?: unknown;
  vertical_id?: unknown;
  verticalSlug?: unknown;
  category?: unknown;
  source_type?: unknown;
  sourceType?: unknown;
  enabled?: unknown;
};

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let body: SourcePayload;

  try {
    body = (await request.json()) as SourcePayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid source request." },
      { status: 400 },
    );
  }

  const name = text(body.name);
  const rssUrl = text(body.rss_url) || text(body.rssUrl);
  const verticalId = text(body.vertical_id);
  const verticalSlug = text(body.verticalSlug);
  const category = text(body.category);
  const sourceType = normaliseSourceType(
    text(body.source_type) || text(body.sourceType),
  );
  const errors: Record<string, string> = {};

  if (!name) errors.name = "Source name is required.";
  if (!rssUrl || !validUrl(rssUrl)) errors.rssUrl = "A valid RSS URL is required.";
  if (!verticalId && !verticalSlug) errors.vertical = "Publication is required.";

  if (Object.keys(errors).length) {
    return NextResponse.json(
      { ok: false, message: "Please fix the source fields.", errors },
      { status: 400 },
    );
  }

  const result = await createManagedSource({
    name,
    rssUrl,
    verticalId,
    verticalSlug,
    category: category || null,
    sourceType,
    enabled: typeof body.enabled === "boolean" ? body.enabled : true,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
