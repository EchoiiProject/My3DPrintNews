import {
  feedback as mockFeedback,
  type Feedback,
  type FeedbackCategory,
  type FeedbackStatus,
} from "@/config/feedback";
import { verticalBySlug as configVerticalBySlug, verticals } from "@/config/verticals";
import type { Vertical } from "@/config/verticals";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type OrganisationRecord = {
  name: string | null;
  website_url: string | null;
  contact_email: string | null;
};

type VerticalRecord = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  visibility: string;
  strategy: string;
  sponsor_id: string | null;
  public_url: string | null;
  created_at: string | null;
  updated_at: string | null;
  organisations?: OrganisationRecord | OrganisationRecord[] | null;
};

type FeedbackRecord = {
  id: string;
  vertical_id: string;
  category: string;
  rating: number | null;
  message: string;
  email: string | null;
  status: string;
  created_at: string | null;
  verticals?: { slug: string | null } | { slug: string | null }[] | null;
};

export type FeedbackDraft = {
  verticalSlug: string;
  category: FeedbackCategory;
  rating?: number | null;
  message: string;
  email?: string;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function toAppVertical(record: VerticalRecord): Vertical {
  const configured = configVerticalBySlug(record.slug);
  const organisation = firstRelation(record.organisations);
  const isActive = record.status === "active";

  return {
    id: configured?.id ?? record.slug,
    name: record.name,
    slug: record.slug,
    domain: organisation?.website_url ?? configured?.domain ?? "",
    description: record.description ?? configured?.description ?? "",
    sector: configured?.sector ?? "Specialist news",
    status: isActive ? "active" : "coming-soon",
    relatedVerticalIds: configured?.relatedVerticalIds ?? [],
    publicUrl: record.public_url ?? configured?.publicUrl ?? "/discover-more",
    subscriberCount: configured?.subscriberCount ?? 0,
    comingSoon: !isActive,
    logo: configured?.logo ?? initials(record.name),
    ownerName: organisation?.name ?? configured?.ownerName ?? "Unassigned",
    ownerEmail: organisation?.contact_email ?? configured?.ownerEmail ?? "",
    sponsorId: record.sponsor_id ?? configured?.sponsorId ?? null,
    active: isActive,
    createdAt: record.created_at ?? configured?.createdAt ?? new Date().toISOString(),
    updatedAt: record.updated_at ?? configured?.updatedAt ?? new Date().toISOString(),
  };
}

function normaliseFeedbackCategory(value: string): FeedbackCategory {
  const allowed: FeedbackCategory[] = [
    "general",
    "source_request",
    "feature_request",
    "bug_report",
    "praise",
    "commercial_suggestion",
  ];

  return allowed.includes(value as FeedbackCategory)
    ? (value as FeedbackCategory)
    : "general";
}

function normaliseFeedbackStatus(value: string): FeedbackStatus {
  const allowed: FeedbackStatus[] = ["new", "reviewed", "actioned", "archived"];

  return allowed.includes(value as FeedbackStatus)
    ? (value as FeedbackStatus)
    : "new";
}

function toFeedback(record: FeedbackRecord): Feedback {
  const verticalRelation = firstRelation(record.verticals);

  return {
    id: record.id,
    verticalId: verticalRelation?.slug ?? record.vertical_id,
    category: normaliseFeedbackCategory(record.category),
    rating: record.rating,
    message: record.message,
    email: record.email ?? undefined,
    status: normaliseFeedbackStatus(record.status),
    createdAt: record.created_at ?? new Date().toISOString(),
  };
}

function fallbackVerticals(): Vertical[] {
  return verticals.filter((vertical) => vertical.status === "active");
}

function logFallback(context: string, error: unknown) {
  console.warn(`[verticals] ${context}; using config fallback.`, error);
}

export async function getVerticals(): Promise<Vertical[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return fallbackVerticals();
  }

  const { data, error } = await supabase
    .from("verticals")
    .select(
      "id,name,slug,description,status,visibility,strategy,sponsor_id,public_url,created_at,updated_at,organisations(name,website_url,contact_email)",
    )
    .order("created_at", { ascending: true });

  if (error || !data) {
    logFallback("Supabase vertical lookup failed", error);
    return fallbackVerticals();
  }

  return (data as VerticalRecord[]).map(toAppVertical);
}

export async function getVerticalBySlug(slug: string): Promise<Vertical | null> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return configVerticalBySlug(slug) ?? null;
  }

  const { data, error } = await supabase
    .from("verticals")
    .select(
      "id,name,slug,description,status,visibility,strategy,sponsor_id,public_url,created_at,updated_at,organisations(name,website_url,contact_email)",
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    logFallback(`Supabase vertical lookup failed for ${slug}`, error);
    return configVerticalBySlug(slug) ?? null;
  }

  return data ? toAppVertical(data as VerticalRecord) : configVerticalBySlug(slug) ?? null;
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return mockFeedback;
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("id,vertical_id,category,rating,message,email,status,created_at,verticals(slug)")
    .order("created_at", { ascending: false });

  if (error || !data) {
    logFallback("Supabase feedback lookup failed", error);
    return mockFeedback;
  }

  return (data as FeedbackRecord[]).map(toFeedback);
}

export async function getFeedbackByVertical(slug: string): Promise<Feedback[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) {
    return mockFeedback.filter((item) => item.verticalId === slug);
  }

  const vertical = await getVerticalBySlug(slug);

  if (!vertical) {
    return [];
  }

  const { data, error } = await supabase
    .from("feedback")
    .select("id,vertical_id,category,rating,message,email,status,created_at,verticals!inner(slug)")
    .eq("verticals.slug", slug)
    .order("created_at", { ascending: false });

  if (error || !data) {
    logFallback(`Supabase feedback lookup failed for ${slug}`, error);
    return mockFeedback.filter((item) => item.verticalId === slug);
  }

  return (data as FeedbackRecord[]).map(toFeedback);
}

export async function prepareFeedbackSubmission(
  draft: FeedbackDraft,
): Promise<{ ready: boolean; message: string }> {
  // TODO: Persist this draft into the feedback table once public submission
  // moderation, spam protection, and vertical-owner notification rules are set.
  const hasVertical = Boolean(await getVerticalBySlug(draft.verticalSlug));

  return {
    ready: hasVertical && draft.message.trim().length > 0,
    message:
      "Feedback persistence is prepared but not enabled for public submissions yet.",
  };
}
