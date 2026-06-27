import { NextResponse } from "next/server";
import {
  createEditorialCase,
  notifyEditorialPlaceholder,
  type EditorialReason,
  type EditorialSeverity,
} from "@/lib/editorial";

type ReportPayload = {
  articleId?: unknown;
  campaignId?: unknown;
  email?: unknown;
  notes?: unknown;
  reason?: unknown;
  severity?: unknown;
  verticalId?: unknown;
};

const reasons: EditorialReason[] = [
  "inappropriate",
  "adult",
  "violence",
  "drugs",
  "competitor_conflict",
  "copyright",
  "misinformation",
  "irrelevant",
  "sponsor_concern",
  "other",
];

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function reason(value: unknown): EditorialReason {
  return reasons.includes(value as EditorialReason)
    ? (value as EditorialReason)
    : "other";
}

function severity(value: unknown): EditorialSeverity {
  return value === "urgent" || value === "high" || value === "low"
    ? value
    : "normal";
}

export async function POST(request: Request) {
  let body: ReportPayload;

  try {
    body = (await request.json()) as ReportPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid report." },
      { status: 400 },
    );
  }

  const caseId = await createEditorialCase({
    actorRole: "reader",
    articleId: text(body.articleId),
    campaignId: text(body.campaignId),
    email: text(body.email),
    notes: text(body.notes),
    reason: reason(body.reason),
    severity: severity(body.severity),
    verticalId: text(body.verticalId),
  });

  if (!caseId) {
    return NextResponse.json(
      { ok: false, message: "Report could not be recorded right now." },
      { status: 502 },
    );
  }

  notifyEditorialPlaceholder("reader report recorded");

  return NextResponse.json({
    ok: true,
    message: "Thanks. This item has been sent for review.",
  });
}
