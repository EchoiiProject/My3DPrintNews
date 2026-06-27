import { NextResponse } from "next/server";
import type { ArticleEditorialStatus } from "@/lib/articles";
import {
  createEditorialCase,
  recordEditorialAction,
  updateArticleEditorialStatus,
  updateEditorialCaseStatus,
  type EditorialActionType,
  type EditorialRole,
} from "@/lib/editorial";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

type ActionPayload = {
  actionType?: unknown;
  articleId?: unknown;
  caseId?: unknown;
  campaignId?: unknown;
  notes?: unknown;
  role?: unknown;
  verticalId?: unknown;
};

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function role(value: unknown): EditorialRole {
  return value === "licence_holder" || value === "reader" ? value : "platform";
}

function statusForAction(actionType: string): ArticleEditorialStatus | null {
  if (actionType === "pause_article") return "paused";
  if (actionType === "resume_article") return "published";
  if (actionType === "exclude_from_editions") return "excluded";
  if (actionType === "hide_from_publication") return "hidden";
  if (actionType === "block_platform_wide") return "blocked";
  return null;
}

function campaignStatusForAction(actionType: string): string | null {
  if (actionType === "pause_campaign") return "paused";
  if (actionType === "resume_campaign") return "live";
  if (actionType === "withdraw_campaign") return "withdrawn";
  return null;
}

export async function POST(request: Request) {
  let body: ActionPayload;

  try {
    body = (await request.json()) as ActionPayload;
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please send a valid editorial action." },
      { status: 400 },
    );
  }

  const actionType = text(body.actionType) as EditorialActionType | null;
  const articleId = text(body.articleId);
  const caseId = text(body.caseId);
  const actorRole = role(body.role);
  const notes = text(body.notes);
  const verticalId = text(body.verticalId);

  if (!actionType) {
    return NextResponse.json(
      { ok: false, message: "Missing editorial action." },
      { status: 400 },
    );
  }

  if (actionType === "report") {
    const caseId = await createEditorialCase({
      actorRole,
      articleId,
      notes,
      reason: "other",
      verticalId,
    });

    return NextResponse.json({
      ok: Boolean(caseId),
      message: caseId
        ? "Platform review requested."
        : "Platform review request failed.",
    });
  }

  const articleStatus = statusForAction(actionType);
  const campaignStatus = campaignStatusForAction(actionType);

  if (articleStatus && articleId) {
    const ok = await updateArticleEditorialStatus({
      actionType,
      actorRole,
      articleId,
      editorialCaseId: caseId,
      notes,
      status: articleStatus,
      verticalId,
    });

    return NextResponse.json({
      ok,
      message: ok ? "Editorial status updated." : "Editorial update failed.",
    });
  }

  if (campaignStatus) {
    const campaignId = text(body.campaignId);
    const supabase = createServiceSupabaseClient();

    if (!campaignId || !supabase) {
      return NextResponse.json(
        { ok: false, message: "Missing campaign for editorial action." },
        { status: 400 },
      );
    }

    const result = await supabase
      .from("campaigns")
      .update({ status: campaignStatus, updated_at: new Date().toISOString() })
      .eq("id", campaignId);

    if (result.error) {
      return NextResponse.json(
        { ok: false, message: "Campaign editorial action failed." },
        { status: 502 },
      );
    }

    await recordEditorialAction({
      actionType,
      actorRole,
      campaignId,
      editorialCaseId: caseId,
      notes,
      verticalId,
    });

    return NextResponse.json({
      ok: true,
      message: "Campaign status updated.",
    });
  }

  if (actionType === "resolve_case" && caseId) {
    const ok = await updateEditorialCaseStatus({
      actionTaken: notes,
      caseId,
      status: "resolved",
    });
    await recordEditorialAction({
      actionType,
      actorRole,
      editorialCaseId: caseId,
      notes,
      verticalId,
    });

    return NextResponse.json({ ok, message: "Case resolved." });
  }

  if (actionType === "dismiss_case" && caseId) {
    const ok = await updateEditorialCaseStatus({
      actionTaken: notes,
      caseId,
      status: "dismissed",
    });
    await recordEditorialAction({
      actionType,
      actorRole,
      editorialCaseId: caseId,
      notes,
      verticalId,
    });

    return NextResponse.json({ ok, message: "Case dismissed." });
  }

  const ok = await recordEditorialAction({
    actionType,
    actorRole,
    campaignId: text(body.campaignId),
    editorialCaseId: caseId,
    notes,
    verticalId,
  });

  return NextResponse.json({
    ok,
    message: ok ? "Editorial action recorded." : "Editorial action failed.",
  });
}
