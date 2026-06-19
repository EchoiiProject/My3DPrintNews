import { NextResponse } from "next/server";

const allowedReasons = new Set([
  "General",
  "Publisher request",
  "Correction",
  "Partnership",
  "Other",
]);

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  reason?: unknown;
  message?: unknown;
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: ContactPayload;

  try {
    body = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Please send a valid contact form submission.",
      },
      { status: 400 },
    );
  }

  const errors: Record<string, string> = {};

  if (!isNonEmptyString(body.name)) {
    errors.name = "Name is required.";
  }

  if (!isNonEmptyString(body.email) || !isValidEmail(body.email.trim())) {
    errors.email = "A valid email address is required.";
  }

  if (!isNonEmptyString(body.reason) || !allowedReasons.has(body.reason)) {
    errors.reason = "Please choose a valid reason.";
  }

  if (!isNonEmptyString(body.message)) {
    errors.message = "Message is required.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please complete the required contact fields.",
        errors,
      },
      { status: 400 },
    );
  }

  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const providerKey = process.env.RESEND_API_KEY ?? process.env.BREVO_API_KEY;

  if (!toEmail || !fromEmail || !providerKey) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message:
        "Thanks - your message has been received in development mode. Email sending will be connected in a later sprint.",
    });
  }

  // TODO: Connect Resend here using CONTACT_TO_EMAIL and CONTACT_FROM_EMAIL.
  // TODO: Add a Brevo implementation as an alternative provider if preferred.
  return NextResponse.json({
    ok: true,
    mode: "queued",
    message:
      "Thanks - your message has been validated. Email delivery will be enabled when the provider integration is connected.",
  });
}
