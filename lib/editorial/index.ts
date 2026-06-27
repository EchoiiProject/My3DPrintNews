import type { ArticleEditorialStatus } from "@/lib/articles";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type EditorialRole = "reader" | "licence_holder" | "platform";
export type EditorialReason =
  | "inappropriate"
  | "adult"
  | "violence"
  | "drugs"
  | "competitor_conflict"
  | "copyright"
  | "misinformation"
  | "irrelevant"
  | "sponsor_concern"
  | "other";
export type EditorialSeverity = "low" | "normal" | "high" | "urgent";
export type EditorialCaseStatus =
  | "open"
  | "under_review"
  | "resolved"
  | "dismissed";
export type EditorialActionType =
  | "report"
  | "pause_article"
  | "resume_article"
  | "exclude_from_editions"
  | "hide_from_publication"
  | "block_platform_wide"
  | "pause_campaign"
  | "resume_campaign"
  | "withdraw_campaign"
  | "dismiss_case"
  | "resolve_case";

export type EditorialCase = {
  id: string;
  verticalId: string | null;
  articleId: string | null;
  campaignId: string | null;
  raisedByRole: EditorialRole;
  raisedByEmail: string | null;
  reason: EditorialReason;
  notes: string | null;
  severity: EditorialSeverity;
  status: EditorialCaseStatus;
  actionTaken: string | null;
  createdAt: string | null;
  resolvedAt: string | null;
  publicationName: string;
  articleTitle: string | null;
  campaignTitle: string | null;
};

type EditorialCaseRow = {
  id: string;
  vertical_id: string | null;
  article_id: string | null;
  campaign_id: string | null;
  raised_by_role: EditorialRole;
  raised_by_email: string | null;
  reason: EditorialReason;
  notes: string | null;
  severity: EditorialSeverity;
  status: EditorialCaseStatus;
  action_taken: string | null;
  created_at: string | null;
  resolved_at: string | null;
  verticals?: { name: string | null } | { name: string | null }[] | null;
  articles?: { title: string | null } | { title: string | null }[] | null;
  campaigns?: { title: string | null } | { title: string | null }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function toCase(row: EditorialCaseRow): EditorialCase {
  return {
    id: row.id,
    verticalId: row.vertical_id,
    articleId: row.article_id,
    campaignId: row.campaign_id,
    raisedByRole: row.raised_by_role,
    raisedByEmail: row.raised_by_email,
    reason: row.reason,
    notes: row.notes,
    severity: row.severity,
    status: row.status,
    actionTaken: row.action_taken,
    createdAt: row.created_at,
    resolvedAt: row.resolved_at,
    publicationName: firstRelation(row.verticals)?.name ?? "Network",
    articleTitle: firstRelation(row.articles)?.title ?? null,
    campaignTitle: firstRelation(row.campaigns)?.title ?? null,
  };
}

export async function createEditorialCase({
  actorRole,
  articleId,
  campaignId,
  email,
  notes,
  reason,
  severity = "normal",
  verticalId,
}: {
  actorRole: EditorialRole;
  articleId?: string | null;
  campaignId?: string | null;
  email?: string | null;
  notes?: string | null;
  reason: EditorialReason;
  severity?: EditorialSeverity;
  verticalId?: string | null;
}): Promise<string | null> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return null;

  const inserted = await supabase
    .from("editorial_cases")
    .insert({
      vertical_id: verticalId ?? null,
      article_id: articleId ?? null,
      campaign_id: campaignId ?? null,
      raised_by_role: actorRole,
      raised_by_email: email || null,
      reason,
      notes: notes || null,
      severity,
      status: "open",
    })
    .select("id")
    .single<{ id: string }>();

  if (inserted.error || !inserted.data) {
    console.error("Editorial case insert failed", inserted.error);
    return null;
  }

  await recordEditorialAction({
    actionType: "report",
    actorRole,
    articleId,
    campaignId,
    editorialCaseId: inserted.data.id,
    notes,
    verticalId,
  });

  return inserted.data.id;
}

export async function recordEditorialAction({
  actionType,
  actorRole,
  articleId,
  campaignId,
  editorialCaseId,
  notes,
  verticalId,
}: {
  actionType: EditorialActionType;
  actorRole: EditorialRole;
  articleId?: string | null;
  campaignId?: string | null;
  editorialCaseId?: string | null;
  notes?: string | null;
  verticalId?: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return false;

  const result = await supabase.from("editorial_actions").insert({
    editorial_case_id: editorialCaseId ?? null,
    vertical_id: verticalId ?? null,
    article_id: articleId ?? null,
    campaign_id: campaignId ?? null,
    actor_role: actorRole,
    action_type: actionType,
    notes: notes || null,
  });

  if (result.error) {
    console.error("Editorial action insert failed", result.error);
    return false;
  }

  return true;
}

export async function updateArticleEditorialStatus({
  actionType,
  actorRole,
  articleId,
  editorialCaseId,
  notes,
  status,
  verticalId,
}: {
  actionType: EditorialActionType;
  actorRole: EditorialRole;
  articleId: string;
  editorialCaseId?: string | null;
  notes?: string | null;
  status: ArticleEditorialStatus;
  verticalId?: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return false;

  const result = await supabase
    .from("articles")
    .update({
      editorial_status: status,
      editorial_status_reason: notes || null,
      editorial_status_updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  if (result.error) {
    console.error("Article editorial status update failed", result.error);
    return false;
  }

  await recordEditorialAction({
    actionType,
    actorRole,
    articleId,
    editorialCaseId,
    notes,
    verticalId,
  });

  return true;
}

export async function updateEditorialCaseStatus({
  actionTaken,
  caseId,
  status,
}: {
  actionTaken?: string | null;
  caseId: string;
  status: EditorialCaseStatus;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return false;

  const result = await supabase
    .from("editorial_cases")
    .update({
      action_taken: actionTaken ?? null,
      resolved_at:
        status === "resolved" || status === "dismissed"
          ? new Date().toISOString()
          : null,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseId);

  if (result.error) {
    console.error("Editorial case status update failed", result.error);
    return false;
  }

  return true;
}

export async function listEditorialCases(): Promise<EditorialCase[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  const result = await supabase
    .from("editorial_cases")
    .select(
      "id,vertical_id,article_id,campaign_id,raised_by_role,raised_by_email,reason,notes,severity,status,action_taken,created_at,resolved_at,verticals(name),articles(title),campaigns(title)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (result.error || !result.data) {
    console.warn("Editorial case list failed", result.error);
    return [];
  }

  return (result.data as EditorialCaseRow[]).map(toCase);
}

export function notifyEditorialPlaceholder(event: string) {
  console.info(`[editorial] Notification placeholder: ${event}`);
}
