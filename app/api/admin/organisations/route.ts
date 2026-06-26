import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type OrganisationPayload = {
  name?: unknown;
  websiteUrl?: unknown;
  logoUrl?: unknown;
  contactEmail?: unknown;
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

function optionalEmail(
  value: string,
  field: string,
  errors: Record<string, string>,
) {
  if (!value) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    errors[field] = "Please enter a valid email address.";
  }

  return value;
}

export async function POST(request: Request) {
  let body: OrganisationPayload;

  try {
    body = (await request.json()) as OrganisationPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Please send a valid licence holder request.",
      },
      { status: 400 },
    );
  }

  const errors: Record<string, string> = {};
  const name = stringValue(body.name);
  const websiteUrl = optionalUrl(stringValue(body.websiteUrl), "websiteUrl", errors);
  const logoUrl = optionalUrl(stringValue(body.logoUrl), "logoUrl", errors);
  const contactEmail = optionalEmail(
    stringValue(body.contactEmail),
    "contactEmail",
    errors,
  );

  if (!name) {
    errors.name = "Licence holder name is required.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please fix the licence holder form fields.",
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
        message:
          "Supabase is not configured, so the licence holder could not be saved.",
      },
      { status: 503 },
    );
  }

  const { data, error } = await supabase
    .from("organisations")
    .insert({
      name,
      website_url: websiteUrl,
      logo_url: logoUrl,
      contact_email: contactEmail,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase organisation insert error", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "The licence holder could not be saved right now. Please check the Supabase organisations table and try again.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: data.id,
    message: "Licence holder created successfully.",
  });
}
