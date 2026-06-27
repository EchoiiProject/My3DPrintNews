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
