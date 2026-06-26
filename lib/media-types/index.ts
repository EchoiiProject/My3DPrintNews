export type DisplayMediaType = "news" | "video" | "podcast" | "review";

export type MediaTypeInput = {
  sourceType?: string | null;
  tags?: string[] | null;
  source?: string | null;
  category?: string | null;
};

export const mediaFilterOptions: Array<{
  label: string;
  pluralLabel: string;
  value: DisplayMediaType;
}> = [
  { label: "News", pluralLabel: "News", value: "news" },
  { label: "Video", pluralLabel: "Videos", value: "video" },
  { label: "Podcast", pluralLabel: "Podcasts", value: "podcast" },
  { label: "Review", pluralLabel: "Reviews", value: "review" },
];

function hasToken(values: Array<string | null | undefined>, token: string) {
  return values.some((value) => value?.toLowerCase().includes(token));
}

export function displayMediaType(input: MediaTypeInput): DisplayMediaType {
  const tags = input.tags ?? [];
  const values = [input.sourceType, input.source, input.category, ...tags];

  if (hasToken(tags, "review")) return "review";
  if (
    input.sourceType === "youtube" ||
    hasToken(values, "youtube") ||
    hasToken(tags, "video")
  ) {
    return "video";
  }
  if (input.sourceType === "podcast" || hasToken(values, "podcast")) {
    return "podcast";
  }

  return "news";
}

export function displayMediaLabel(input: MediaTypeInput): string {
  const type = displayMediaType(input);

  return mediaFilterOptions.find((option) => option.value === type)?.label ?? "News";
}
