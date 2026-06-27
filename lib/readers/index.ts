import { createServiceSupabaseClient } from "@/lib/supabase/server";

type SupabaseClient = NonNullable<ReturnType<typeof createServiceSupabaseClient>>;

export type ReaderProfile = {
  id: string;
  email: string;
  displayName: string | null;
};

type ReaderProfileRow = {
  id: string;
  email: string;
  display_name: string | null;
};

export async function getOrCreateReaderProfile(
  email: string,
  supabase?: SupabaseClient,
): Promise<ReaderProfile | null> {
  const client = supabase ?? createServiceSupabaseClient();

  if (!client) return null;

  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) return null;

  const result = await client
    .from("reader_profiles")
    .upsert(
      { email: normalizedEmail, updated_at: new Date().toISOString() },
      { onConflict: "email" },
    )
    .select("id,email,display_name")
    .single<ReaderProfileRow>();

  if (result.error || !result.data) {
    console.error("Reader profile upsert error", result.error);
    return null;
  }

  return {
    id: result.data.id,
    email: result.data.email,
    displayName: result.data.display_name,
  };
}

export async function saveReaderPublicationPreference({
  email,
  verticalId,
  frequency = "daily",
  maxItems = 10,
}: {
  email: string;
  verticalId: string | null;
  frequency?: string;
  maxItems?: number;
}): Promise<ReaderProfile | null> {
  const supabase = createServiceSupabaseClient();

  if (!supabase || !verticalId) return null;

  const reader = await getOrCreateReaderProfile(email, supabase);

  if (!reader) return null;

  const result = await supabase.from("reader_publication_preferences").upsert(
    {
      reader_id: reader.id,
      vertical_id: verticalId,
      frequency,
      include_favourites: true,
      include_videos: true,
      include_reviews: true,
      max_items: maxItems,
      is_subscribed: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "reader_id,vertical_id" },
  );

  if (result.error) {
    console.error("Reader publication preference upsert error", result.error);
  }

  return reader;
}

export async function saveReadingListItem({
  email,
  articleId,
  verticalId,
}: {
  email: string;
  articleId: string | null;
  verticalId: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  if (!supabase || !articleId) return false;

  const reader = await getOrCreateReaderProfile(email, supabase);

  if (!reader) return false;

  const result = await supabase.from("reader_reading_list").upsert(
    {
      reader_id: reader.id,
      article_id: articleId,
      vertical_id: verticalId,
      status: "saved",
      saved_at: new Date().toISOString(),
    },
    { onConflict: "reader_id,article_id" },
  );

  if (result.error) {
    console.error("Reader reading list save error", result.error);
    return false;
  }

  return true;
}

export async function unsaveReadingListItem({
  email,
  articleId,
}: {
  email: string;
  articleId: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  if (!supabase || !articleId) return false;

  const reader = await getOrCreateReaderProfile(email, supabase);

  if (!reader) return false;

  const result = await supabase
    .from("reader_reading_list")
    .delete()
    .eq("reader_id", reader.id)
    .eq("article_id", articleId);

  if (result.error) {
    console.error("Reader reading list unsave error", result.error);
    return false;
  }

  return true;
}

export async function hideReaderItem({
  articleId,
  email,
  reason,
  verticalId,
}: {
  articleId: string | null;
  email?: string | null;
  reason?: string | null;
  verticalId?: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();

  if (!supabase || !articleId) return false;

  const reader = email ? await getOrCreateReaderProfile(email, supabase) : null;
  const normalisedEmail = email?.trim().toLowerCase() || null;
  const payload = {
    reader_id: reader?.id ?? null,
    email: normalisedEmail,
    article_id: articleId,
    vertical_id: verticalId ?? null,
    reason: reason || null,
  };
  const result = reader?.id
    ? await supabase
        .from("reader_hidden_items")
        .upsert(payload, { onConflict: "reader_id,article_id" })
    : await supabase.from("reader_hidden_items").insert(payload);

  if (result.error) {
    if (result.error.code === "23505") return true;
    console.error("Reader hidden item upsert error", result.error);
    return false;
  }

  return true;
}

export async function getHiddenArticleIdsForEmail(
  email: string | null | undefined,
): Promise<string[]> {
  const supabase = createServiceSupabaseClient();
  const normalisedEmail = email?.trim().toLowerCase();

  if (!supabase || !normalisedEmail) return [];

  const reader = await getOrCreateReaderProfile(normalisedEmail, supabase);
  let query = supabase
    .from("reader_hidden_items")
    .select("article_id")
    .eq("email", normalisedEmail);

  if (reader) {
    query = query.or(`reader_id.eq.${reader.id},email.eq.${normalisedEmail}`);
  }

  const result = await query;

  if (result.error || !result.data) {
    console.warn("Reader hidden item lookup failed", result.error);
    return [];
  }

  return result.data
    .map((row) => row.article_id)
    .filter((value): value is string => typeof value === "string");
}

export async function unhideReaderItem({
  articleId,
  email,
}: {
  articleId: string | null;
  email?: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const normalisedEmail = email?.trim().toLowerCase();

  if (!supabase || !articleId || !normalisedEmail) return false;

  const reader = await getOrCreateReaderProfile(normalisedEmail, supabase);
  let query = supabase
    .from("reader_hidden_items")
    .delete()
    .eq("article_id", articleId);

  if (reader) {
    query = query.or(`reader_id.eq.${reader.id},email.eq.${normalisedEmail}`);
  } else {
    query = query.eq("email", normalisedEmail);
  }

  const result = await query;

  if (result.error) {
    console.error("Reader hidden item delete error", result.error);
    return false;
  }

  return true;
}

export async function hideReaderSource({
  email,
  mutedUntil,
  reason,
  sourceId,
  verticalId,
}: {
  email?: string | null;
  mutedUntil?: string | null;
  reason?: string | null;
  sourceId: string | null;
  verticalId?: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const normalisedEmail = email?.trim().toLowerCase() || null;

  if (!supabase || !sourceId) return false;

  const reader = normalisedEmail
    ? await getOrCreateReaderProfile(normalisedEmail, supabase)
    : null;
  const payload = {
    reader_id: reader?.id ?? null,
    email: normalisedEmail,
    vertical_id: verticalId ?? null,
    source_id: sourceId,
    muted_until: mutedUntil ?? null,
    reason: reason ?? null,
    updated_at: new Date().toISOString(),
  };
  const result = reader?.id
    ? await supabase
        .from("reader_hidden_sources")
        .upsert(payload, { onConflict: "reader_id,source_id" })
    : await supabase
        .from("reader_hidden_sources")
        .upsert(payload, { onConflict: "email,source_id" });

  if (result.error) {
    console.error("Reader hidden source upsert error", result.error);
    return false;
  }

  return true;
}

export async function unhideReaderSource({
  email,
  sourceId,
}: {
  email?: string | null;
  sourceId: string | null;
}): Promise<boolean> {
  const supabase = createServiceSupabaseClient();
  const normalisedEmail = email?.trim().toLowerCase();

  if (!supabase || !sourceId || !normalisedEmail) return false;

  const reader = await getOrCreateReaderProfile(normalisedEmail, supabase);
  let query = supabase
    .from("reader_hidden_sources")
    .delete()
    .eq("source_id", sourceId);

  if (reader) {
    query = query.or(`reader_id.eq.${reader.id},email.eq.${normalisedEmail}`);
  } else {
    query = query.eq("email", normalisedEmail);
  }

  const result = await query;

  if (result.error) {
    console.error("Reader hidden source delete error", result.error);
    return false;
  }

  return true;
}
