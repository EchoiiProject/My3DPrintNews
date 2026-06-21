import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { isValidEmail, subscriberToken } from "@/lib/newsletter";
import {
  defaultFavourites,
  defaultPreferences,
  Favourites,
  normaliseFavourites,
  normalisePreferences,
  Preferences,
} from "@/app/preferences";

type NewsletterPayload = {
  email?: unknown;
  preferences?: Partial<Preferences>;
  favourites?: Partial<Favourites>;
};

type SupabaseLookupError = {
  code?: string;
  details?: string;
  message?: string;
};

function isNoExistingSubscriberError(error: SupabaseLookupError): boolean {
  return error.code === "PGRST116" || error.code === "PGRST125";
}

export async function POST(request: Request) {
  let body: NewsletterPayload;

  try {
    body = (await request.json()) as NewsletterPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Please send a valid newsletter signup request.",
      },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";

  if (!isValidEmail(email)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please enter a valid email address.",
      },
      { status: 400 },
    );
  }

  const preferences = normalisePreferences(body.preferences ?? defaultPreferences);
  const favourites = normaliseFavourites(body.favourites ?? defaultFavourites);
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return NextResponse.json({
      ok: true,
      mode: "development",
      message:
        "Newsletter signup is ready. Supabase configuration will be connected before production sending.",
    });
  }

  const existing = await supabase
    .from("subscribers")
    .select("token")
    .eq("email", email)
    .maybeSingle();

  if (existing.error && !isNoExistingSubscriberError(existing.error)) {
    console.error("Supabase subscriber lookup error", existing.error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Newsletter signup could not be checked right now. Please try again later.",
      },
      { status: 502 },
    );
  }

  if (existing.error) {
    console.info("No existing subscriber found; creating subscriber.");
  } else if (!existing.data) {
    console.info("No existing subscriber returned; creating subscriber.");
  }

  const token = existing.data?.token ?? subscriberToken();
  const upsert = await supabase.from("subscribers").upsert(
    {
      email,
      token,
      frequency: preferences.delivery.frequency,
      weekly_day: preferences.delivery.weeklyDay ?? null,
      monthly_timing: preferences.delivery.monthlyTiming ?? null,
      story_count: Number(preferences.storiesPerUpdate),
      preferences,
      favourites,
    },
    { onConflict: "email" },
  );

  if (upsert.error) {
    console.error("Supabase subscriber upsert error", upsert.error);

    return NextResponse.json(
      {
        ok: false,
        message:
          "Newsletter signup could not be saved right now. Please try again later.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Your newsletter preferences have been saved.",
    savedFeedPath: `/saved-feed/${token}`,
  });
}
