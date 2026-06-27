import type { ArticleArchiveItem } from "@/lib/articles";
import { createServiceSupabaseClient } from "@/lib/supabase/server";

export type NewsletterEdition = {
  id: string;
  verticalId: string | null;
  readerId: string | null;
  frequency: string | null;
  editionDate: string | null;
  title: string;
  status: string;
  magicToken: string | null;
  publicationName: string;
  items: NewsletterEditionItem[];
  createdAt: string | null;
};

export type NewsletterEditionItem = {
  id: string;
  section: string | null;
  position: number | null;
  article: ArticleArchiveItem | null;
};

export type NewsletterEditionSummary = {
  id: string;
  title: string;
  status: string;
  editionDate: string | null;
  frequency: string | null;
  publicationName: string;
  itemCount: number;
  createdAt: string | null;
};

type EditionArticleRelation = {
  id: string;
  vertical_id: string | null;
  source_id: string | null;
  title: string;
  url: string;
  summary: string | null;
  image_url: string | null;
  author: string | null;
  published_at: string | null;
  source_name: string | null;
  tags: unknown;
  created_at: string | null;
  verticals?:
    | { name: string | null; slug: string | null }
    | { name: string | null; slug: string | null }[]
    | null;
};

type EditionItemRow = {
  id: string;
  section: string | null;
  position: number | null;
  articles?: EditionArticleRelation | EditionArticleRelation[] | null;
};

type EditionRow = {
  id: string;
  vertical_id: string | null;
  reader_id: string | null;
  frequency: string | null;
  edition_date: string | null;
  title: string | null;
  status: string;
  magic_token: string | null;
  created_at: string | null;
  verticals?: { name: string | null } | { name: string | null }[] | null;
  newsletter_edition_items?: EditionItemRow[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  return Array.isArray(value) ? value[0] ?? null : value ?? null;
}

function tags(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function articleFromRelation(
  article: EditionArticleRelation | null,
): ArticleArchiveItem | null {
  if (!article) return null;

  const vertical = firstRelation(article.verticals);

  return {
    id: article.id,
    verticalId: article.vertical_id,
    sourceId: article.source_id,
    title: article.title,
    url: article.url,
    summary: article.summary,
    imageUrl: article.image_url,
    author: article.author,
    publishedAt: article.published_at,
    sourceName: article.source_name,
    tags: tags(article.tags),
    createdAt: article.created_at,
    verticalName: vertical?.name ?? "Publication",
    verticalSlug: vertical?.slug ?? "",
  };
}

function editionFromRow(row: EditionRow): NewsletterEdition {
  const vertical = firstRelation(row.verticals);
  const items = (row.newsletter_edition_items ?? [])
    .map((item) => ({
      id: item.id,
      section: item.section,
      position: item.position,
      article: articleFromRelation(firstRelation(item.articles)),
    }))
    .sort((itemA, itemB) => (itemA.position ?? 0) - (itemB.position ?? 0));

  return {
    id: row.id,
    verticalId: row.vertical_id,
    readerId: row.reader_id,
    frequency: row.frequency,
    editionDate: row.edition_date,
    title: row.title ?? "Newsletter edition",
    status: row.status,
    magicToken: row.magic_token,
    publicationName: vertical?.name ?? "MyNewsNetwork",
    items,
    createdAt: row.created_at,
  };
}

export async function getNewsletterEditionByToken(
  token: string,
): Promise<NewsletterEdition | null> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return null;

  const result = await supabase
    .from("newsletter_editions")
    .select(
      "id,vertical_id,reader_id,frequency,edition_date,title,status,magic_token,created_at,verticals(name),newsletter_edition_items(id,section,position,articles(id,vertical_id,source_id,title,url,summary,image_url,author,published_at,source_name,tags,created_at,verticals(name,slug)))",
    )
    .eq("magic_token", token)
    .maybeSingle<EditionRow>();

  if (result.error || !result.data) {
    if (result.error) console.warn("Newsletter edition lookup failed", result.error);
    return null;
  }

  return editionFromRow(result.data);
}

export async function listNewsletterEditions(): Promise<
  NewsletterEditionSummary[]
> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  const result = await supabase
    .from("newsletter_editions")
    .select(
      "id,frequency,edition_date,title,status,created_at,verticals(name),newsletter_edition_items(id)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (result.error || !result.data) {
    console.warn("Newsletter edition list lookup failed", result.error);
    return [];
  }

  return (result.data as EditionRow[]).map((row) => ({
    id: row.id,
    title: row.title ?? "Newsletter edition",
    status: row.status,
    editionDate: row.edition_date,
    frequency: row.frequency,
    publicationName: firstRelation(row.verticals)?.name ?? "MyNewsNetwork",
    itemCount: row.newsletter_edition_items?.length ?? 0,
    createdAt: row.created_at,
  }));
}

export async function createNewsletterEditionPlaceholder({
  verticalId,
  readerId,
  frequency = "daily",
  title,
}: {
  verticalId?: string | null;
  readerId?: string | null;
  frequency?: string;
  title?: string;
}): Promise<string | null> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return null;

  const result = await supabase
    .from("newsletter_editions")
    .insert({
      vertical_id: verticalId ?? null,
      reader_id: readerId ?? null,
      frequency,
      edition_date: new Date().toISOString().slice(0, 10),
      title: title ?? "Draft newsletter edition",
      status: "draft",
      magic_token: crypto.randomUUID(),
    })
    .select("id")
    .single<{ id: string }>();

  if (result.error || !result.data) {
    console.error("Newsletter edition placeholder insert failed", result.error);
    return null;
  }

  return result.data.id;
}
