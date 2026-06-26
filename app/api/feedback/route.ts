import { NextResponse } from "next/server";
import type { FeedbackCategory } from "@/config/feedback";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getVerticalBySlug } from "@/lib/verticals";

const allowedCategories: FeedbackCategory[] = [
  "general",
  "source_request",
  "feature_request",
  "bug_report",
  "praise",
  "commercial_suggestion",
];

type FeedbackPayload = {
  verticalSlug?: unknown;
  category?: unknown;
  rating?: unknown;
  message?: unknown;
  email?: unknown;
};

function textValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(value: string): boolean {
  return value.length === 0 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normaliseRating(value: unknown): number | null {
  const rating = typeof value === "number" ? value : Number(value);

  return Number.isFinite(rating) && rating >= 1 && rating <= 5 ? rating : null;
}

export async function POST(request: Request) {
  let body: FeedbackPayload;

  try {
    body = (await request.json()) as FeedbackPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send valid feedback." },
      { status: 400 },
    );
  }

  const verticalSlug = textValue(body.verticalSlug);
  const category = textValue(body.category) as FeedbackCategory;
  const message = textValue(body.message);
  const email = textValue(body.email);
  const errors: Record<string, string> = {};

  if (!verticalSlug) {
    errors.verticalSlug = "Publication is required.";
  }

  if (!allowedCategories.includes(category)) {
    errors.category = "Please choose a valid feedback category.";
  }

  if (!message) {
    errors.message = "Message is required.";
  }

  if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { ok: false, message: "Please complete the required feedback fields.", errors },
      { status: 400 },
    );
  }

  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        message: "Feedback storage is not configured for this deployment.",
      },
      { status: 503 },
    );
  }

  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical?.databaseId) {
    return NextResponse.json(
      { ok: false, message: "Publication could not be found." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("feedback").insert({
    vertical_id: vertical.databaseId,
    category,
    rating: normaliseRating(body.rating),
    message,
    email: email || null,
    status: "new",
  });

  if (error) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks - your feedback has been sent to the publication team.",
  });
}
