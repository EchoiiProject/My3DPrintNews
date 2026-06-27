import type { ArticleArchiveItem } from "@/lib/articles";
import { adminSlugForPublicationSlug, publicSlugForAdminSlug } from "@/config/verticals";
import { getArticleArchive } from "@/lib/articles";
import { displayMediaType } from "@/lib/media-types";
import { getOrCreateReaderProfile } from "@/lib/readers";
import { createServiceSupabaseClient } from "@/lib/supabase/server";
import { getVerticalBySlug } from "@/lib/verticals";

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
  publicationSlug: string | null;
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

export type EditionFrequency = "daily" | "weekly" | "monthly";

export type GeneratedEdition = {
  id: string;
  title: string;
  magicToken: string;
  itemCount: number;
  publicationName: string;
  frequency: EditionFrequency;
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
  verticals?:
    | { name: string | null; slug?: string | null }
    | { name: string | null; slug?: string | null }[]
    | null;
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

function frequencyWindowDays(frequency: EditionFrequency): number {
  if (frequency === "weekly") return 7;
  if (frequency === "monthly") return 30;
  return 2;
}

function frequencyItemLimit(frequency: EditionFrequency): number {
  if (frequency === "weekly") return 20;
  if (frequency === "monthly") return 30;
  return 10;
}

function effectiveArticleTime(article: ArticleArchiveItem): number {
  const timestamp = new Date(article.publishedAt ?? article.createdAt ?? "").getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
}

function articleSection(article: ArticleArchiveItem): string {
  const mediaType = displayMediaType({
    tags: article.tags,
    source: article.sourceName,
  });

  if (mediaType === "video") return "Videos";
  if (mediaType === "review") return "Reviews";
  if (mediaType === "podcast") return "Podcasts";
  return "News";
}

function editionTitle(
  publicationName: string,
  frequency: EditionFrequency,
  editionDate: string,
): string {
  const label = frequency[0].toUpperCase() + frequency.slice(1);

  return `${publicationName} ${label} Edition - ${editionDate}`;
}

function selectEditionArticles(
  recentArticles: ArticleArchiveItem[],
  fallbackArticles: ArticleArchiveItem[],
  frequency: EditionFrequency,
): ArticleArchiveItem[] {
  const limit = frequencyItemLimit(frequency);
  const seen = new Set<string>();
  const selected: ArticleArchiveItem[] = [];

  for (const article of [...recentArticles, ...fallbackArticles].sort(
    (articleA, articleB) =>
      effectiveArticleTime(articleB) - effectiveArticleTime(articleA),
  )) {
    if (seen.has(article.id)) continue;

    selected.push(article);
    seen.add(article.id);

    if (selected.length >= limit) break;
  }

  return selected;
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
  const rawSlug = vertical?.slug ?? null;
  const publicSlug = rawSlug
    ? adminSlugForPublicationSlug(rawSlug)
      ? rawSlug
      : publicSlugForAdminSlug(rawSlug) ?? rawSlug
    : null;
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
    publicationSlug: publicSlug,
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
      "id,vertical_id,reader_id,frequency,edition_date,title,status,magic_token,created_at,verticals(name,slug),newsletter_edition_items(id,section,position,articles(id,vertical_id,source_id,title,url,summary,image_url,author,published_at,source_name,tags,created_at,verticals(name,slug)))",
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
>;
export async function listNewsletterEditions(options: {
  verticalSlug?: string;
}): Promise<NewsletterEditionSummary[]>;
export async function listNewsletterEditions({
  verticalSlug,
}: {
  verticalSlug?: string;
} = {}): Promise<NewsletterEditionSummary[]> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return [];

  const vertical = verticalSlug ? await getVerticalBySlug(verticalSlug) : null;

  if (verticalSlug && !vertical?.databaseId) return [];

  let query = supabase
    .from("newsletter_editions")
    .select(
      "id,frequency,edition_date,title,status,created_at,verticals(name),newsletter_edition_items(id)",
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (vertical?.databaseId) {
    query = query.eq("vertical_id", vertical.databaseId);
  }

  const result = await query;

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

export async function generateNewsletterEdition({
  verticalSlug,
  frequency = "daily",
  readerEmail,
}: {
  verticalSlug: string;
  frequency?: EditionFrequency;
  readerEmail?: string | null;
  readerPreferences?: Record<string, unknown> | null;
}): Promise<GeneratedEdition | null> {
  const supabase = createServiceSupabaseClient();

  if (!supabase) return null;

  const vertical = await getVerticalBySlug(verticalSlug);

  if (!vertical?.databaseId) return null;

  const reader = readerEmail
    ? await getOrCreateReaderProfile(readerEmail, supabase)
    : null;
  const windowDays = frequencyWindowDays(frequency);
  const editionDate = new Date().toISOString().slice(0, 10);
  const recentArticles = await getArticleArchive({
    verticalSlug: vertical.slug,
    recentDays: windowDays,
  });
  const fallbackArticles = await getArticleArchive({ verticalSlug: vertical.slug });
  const selectedArticles = selectEditionArticles(
    recentArticles,
    fallbackArticles,
    frequency,
  );
  const magicToken = crypto.randomUUID();
  const title = editionTitle(
    vertical.publicationName ?? vertical.name,
    frequency,
    editionDate,
  );

  const editionResult = await supabase
    .from("newsletter_editions")
    .insert({
      vertical_id: vertical.databaseId,
      reader_id: reader?.id ?? null,
      frequency,
      edition_date: editionDate,
      title,
      status: selectedArticles.length ? "ready" : "draft",
      magic_token: magicToken,
    })
    .select("id,magic_token")
    .single<{ id: string; magic_token: string }>();

  if (editionResult.error || !editionResult.data) {
    console.error("Newsletter edition generation failed", editionResult.error);
    return null;
  }

  if (selectedArticles.length) {
    const itemResult = await supabase.from("newsletter_edition_items").insert(
      selectedArticles.map((article, index) => ({
        edition_id: editionResult.data.id,
        article_id: article.id,
        section: articleSection(article),
        position: index + 1,
      })),
    );

    if (itemResult.error) {
      console.error("Newsletter edition item insert failed", itemResult.error);
      return null;
    }
  }

  return {
    id: editionResult.data.id,
    title,
    magicToken: editionResult.data.magic_token,
    itemCount: selectedArticles.length,
    publicationName: vertical.publicationName ?? vertical.name,
    frequency,
  };
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
