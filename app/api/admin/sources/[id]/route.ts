import { NextResponse } from "next/server";
import { deleteManagedSource, updateManagedSource } from "@/lib/sources";

type SourcePatch = {
  name?: unknown;
  rssUrl?: unknown;
  category?: unknown;
  enabled?: unknown;
  verticalSlug?: unknown;
};

function text(value: unknown): string | undefined {
  return typeof value === "string" ? value.trim() : undefined;
}

function validUrl(value: string): boolean {
  try {
    const url = new URL(value);

    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  let body: SourcePatch;

  try {
    body = (await request.json()) as SourcePatch;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid source update." },
      { status: 400 },
    );
  }

  const rssUrl = text(body.rssUrl);
  const errors: Record<string, string> = {};

  if (rssUrl !== undefined && !validUrl(rssUrl)) {
    errors.rssUrl = "A valid RSS URL is required.";
  }

  if (Object.keys(errors).length) {
    return NextResponse.json(
      { ok: false, message: "Please fix the source fields.", errors },
      { status: 400 },
    );
  }

  const result = await updateManagedSource(id, {
    name: text(body.name),
    rssUrl,
    category: text(body.category) ?? null,
    enabled:
      typeof body.enabled === "boolean" ? body.enabled : undefined,
    verticalSlug: text(body.verticalSlug),
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const result = await deleteManagedSource(id);

  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
