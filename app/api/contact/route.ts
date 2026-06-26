import { NextResponse } from "next/server";
import { Resend } from "resend";

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

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function formatEmailBody({
  name,
  email,
  reason,
  message,
  submittedAt,
}: {
  name: string;
  email: string;
  reason: string;
  message: string;
  submittedAt: string;
}) {
  return [
    "New MyNewsNetwork contact submission",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Reason: ${reason}`,
    `Submitted: ${submittedAt}`,
    "",
    "Message:",
    message,
  ].join("\n");
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

  const name = textValue(body.name);
  const email = textValue(body.email);
  const reason = textValue(body.reason);
  const message = textValue(body.message);
  const submittedAt = new Date().toISOString();
  const toEmail = process.env.CONTACT_TO_EMAIL;
  const fromEmail = process.env.CONTACT_FROM_EMAIL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!toEmail || !fromEmail || !resendApiKey) {
    console.info("Contact form running in development mode", {
      hasResendApiKey: Boolean(resendApiKey),
      hasContactToEmail: Boolean(toEmail),
      hasContactFromEmail: Boolean(fromEmail),
    });

    return NextResponse.json({
      ok: true,
      mode: "development",
      message:
        "Thanks - your message has been received in development mode. Email sending will be connected in a later sprint.",
    });
  }

  try {
    const resend = new Resend(resendApiKey);
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: email,
      subject: `MyNewsNetwork contact: ${reason}`,
      text: formatEmailBody({
        name,
        email,
        reason,
        message,
        submittedAt,
      }),
    });

    if (error) {
      console.error("Resend contact email failed", {
        error,
        hasContactToEmail: Boolean(toEmail),
        hasContactFromEmail: Boolean(fromEmail),
      });

      return NextResponse.json(
        {
          ok: false,
          message:
            "Your message could not be sent because the email service rejected the request. Please check the contact email configuration.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("Resend contact email threw an error", {
      error,
      hasContactToEmail: Boolean(toEmail),
      hasContactFromEmail: Boolean(fromEmail),
    });

    return NextResponse.json(
      {
        ok: false,
        message:
          "Your message could not be sent right now because the email service is not available. Please try again later.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    mode: "sent",
    message: "Thank you for contacting MyNewsNetwork. Your message has been received.",
  });
}
