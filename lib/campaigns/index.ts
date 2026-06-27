import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type CampaignPlacementKey =
  | "network_header"
  | "publication_header"
  | "after_favourites"
  | "mid_edition"
  | "footer"
  | "article_page";

export type Campaign = {
  id: string;
  verticalId: string | null;
  ownerScope: "platform" | "licence_holder";
  title: string;
  description: string | null;
  imageUrl: string | null;
  destinationUrl: string | null;
  discountCode: string | null;
  status: string;
  startAt: string | null;
  endAt: string | null;
  publicationName: string;
};

type CampaignRow = {
  id: string;
  vertical_id: string | null;
  owner_scope: string;
  title: string;
  description: string | null;
  image_url: string | null;
  destination_url: string | null;
  discount_code: string | null;
  status: string;
  start_at: string | null;
  end_at: string | null;
  verticals?: { name: string | null } | { name: string | null }[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function toCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    verticalId: row.vertical_id,
    ownerScope:
      row.owner_scope === "licence_holder" ? "licence_holder" : "platform",
    title: row.title,
    description: row.description,
    imageUrl: row.image_url,
    destinationUrl: row.destination_url,
    discountCode: row.discount_code,
    status: row.status,
    startAt: row.start_at,
    endAt: row.end_at,
    publicationName: firstRelation(row.verticals)?.name ?? "Network",
  };
}

export async function getCampaignsForPlacement({
  verticalId,
  placementKey,
  at = new Date(),
}: {
  verticalId?: string | null;
  placementKey: CampaignPlacementKey;
  at?: Date;
}): Promise<Campaign[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  const timestamp = at.toISOString();
  const result = await supabase
    .from("campaign_placements")
    .select(
      "campaigns(id,vertical_id,owner_scope,title,description,image_url,destination_url,discount_code,status,start_at,end_at,verticals(name))",
    )
    .eq("placement_key", placementKey)
    .order("priority", { ascending: true });

  if (result.error || !result.data) {
    console.warn("Campaign placement lookup failed", result.error);
    return [];
  }

  return result.data
    .map((row) => firstRelation(row.campaigns as CampaignRow | CampaignRow[] | null))
    .filter((campaign): campaign is CampaignRow => {
      if (!campaign) return false;
      if (campaign.status !== "live") return false;
      if (campaign.vertical_id && verticalId && campaign.vertical_id !== verticalId) {
        return false;
      }
      if (campaign.vertical_id && !verticalId) return false;
      if (campaign.start_at && campaign.start_at > timestamp) return false;
      if (campaign.end_at && campaign.end_at < timestamp) return false;
      return true;
    })
    .map(toCampaign);
}

export async function listCampaigns(): Promise<Campaign[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  const result = await supabase
    .from("campaigns")
    .select(
      "id,vertical_id,owner_scope,title,description,image_url,destination_url,discount_code,status,start_at,end_at,verticals(name)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (result.error || !result.data) {
    console.warn("Campaign list lookup failed", result.error);
    return [];
  }

  return (result.data as CampaignRow[]).map(toCampaign);
}
