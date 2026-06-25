import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

const strategies = new Set(["retail_growth", "publisher", "community"]);
const statuses = new Set(["prospect", "demo", "trial", "live", "archived"]);
const visibilities = new Set(["private", "public"]);

type VerticalPayload = {
  name?: unknown;
  slug?: unknown;
  description?: unknown;
  strategy?: unknown;
  status?: unknown;
  visibility?: unknown;
  publicUrl?: unknown;
};

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function optionalUrl(value: string, field: string, errors: Record<string, string>) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    if (!["http:", "https:"].includes(url.protocol)) {
      errors[field] = "Please enter a valid http or https URL.";
    }
  } catch {
    errors[field] = "Please enter a valid URL.";
  }

  return value;
}

function isSafeSlug(value: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: organisationId } = await params;
  let body: VerticalPayload;

  try {
    body = (await request.json()) as VerticalPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Please send a valid vertical request.",
      },
      { status: 400 },
    );
  }

  const errors: Record<string, string> = {};
  const name = stringValue(body.name);
  const slug = stringValue(body.slug).toLowerCase();
  const description = stringValue(body.description);
  const strategy = stringValue(body.strategy) || "retail_growth";
  const status = stringValue(body.status) || "prospect";
  const visibility = stringValue(body.visibility) || "private";
  const publicUrl = optionalUrl(stringValue(body.publicUrl), "publicUrl", errors);

  if (!organisationId) {
    errors.organisation = "Organisation is required.";
  }

  if (!name) {
    errors.name = "Vertical name is required.";
  }

  if (!slug) {
    errors.slug = "Slug is required.";
  } else if (!isSafeSlug(slug)) {
    errors.slug =
      "Slug must use lowercase letters, numbers, and hyphens only.";
  }

  if (!strategies.has(strategy)) {
    errors.strategy = "Please choose a valid strategy.";
  }

  if (!statuses.has(status)) {
    errors.status = "Please choose a valid lifecycle status.";
  }

  if (!visibilities.has(visibility)) {
    errors.visibility = "Please choose a valid visibility.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please fix the vertical form fields.",
        errors,
      },
      { status: 400 },
    );
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase is not configured, so the vertical could not be saved.",
      },
      { status: 503 },
    );
  }

  const organisation = await supabase
    .from("organisations")
    .select("id")
    .eq("id", organisationId)
    .maybeSingle();

  if (organisation.error) {
    console.error("Supabase organisation lookup error", organisation.error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "The organisation could not be checked right now. Please try again.",
      },
      { status: 502 },
    );
  }

  if (!organisation.data) {
    return NextResponse.json(
      {
        ok: false,
        message: "Organisation not found.",
        errors: { organisation: "Organisation not found." },
      },
      { status: 404 },
    );
  }

  const { data, error } = await supabase
    .from("verticals")
    .insert({
      organisation_id: organisationId,
      name,
      slug,
      description: description || null,
      status,
      visibility,
      strategy,
      sponsor_id: null,
      public_url: publicUrl,
    })
    .select("id,slug")
    .single();

  if (error) {
    console.error("Supabase vertical insert error", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "The vertical could not be saved. Please check the slug is unique and the verticals table exists.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    slug: data.slug,
    message: "Vertical created successfully.",
  });
}
