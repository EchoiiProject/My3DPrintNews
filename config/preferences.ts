import type { MonthlyTiming, WeeklyDay } from "../lib/preferences";
import { registry, type RegistryItem } from "./registry";

// Reusable personalised feed engine with My3DPrintNews as the first vertical.

function labels(items: readonly { label: string }[]): string[] {
  return items.map((item) => item.label);
}

function tagMap(items: readonly { label: string; tag?: string }[]) {
  return Object.fromEntries(
    items.map((item) => [item.label, item.tag ?? item.label]),
  );
}

function keywordMap(items: readonly { label: string; tag?: string; keywords?: readonly string[] }[]) {
  return Object.fromEntries(
    items
      .filter((item) => item.keywords?.length)
      .map((item) => [item.tag ?? item.label, [...(item.keywords ?? [])]]),
  );
}

export const legacyPrinterBrands: Record<string, string> = Object.fromEntries(
  (registry.brands as readonly RegistryItem[]).flatMap((brand) =>
    (brand.aliases ?? []).map((alias) => [alias, brand.label]),
  ),
);

export const preferenceGroups = [
  {
    key: "brands",
    title: "Brands",
    options: labels(registry.brands),
  },
  {
    key: "models",
    title: "Model Platforms",
    options: labels(registry.modelPlatforms),
  },
  {
    key: "creators",
    title: "Creators",
    options: labels(registry.creators),
  },
  {
    key: "topics",
    title: "Topics",
    options: labels(registry.topics),
  },
  {
    key: "technology",
    title: "Technology",
    options: labels(registry.technologies),
  },
] as const;

export const frequencyOptions = ["Daily", "Weekly", "Monthly"];

export const weeklyDayOptions: {
  value: WeeklyDay;
  label: string;
  long: string;
}[] = [
  { value: "mon", label: "Mon", long: "Monday" },
  { value: "tue", label: "Tue", long: "Tuesday" },
  { value: "wed", label: "Wed", long: "Wednesday" },
  { value: "thu", label: "Thu", long: "Thursday" },
  { value: "fri", label: "Fri", long: "Friday" },
  { value: "sat", label: "Sat", long: "Saturday" },
  { value: "sun", label: "Sun", long: "Sunday" },
];

export const monthlyTimingOptions: {
  value: MonthlyTiming;
  label: string;
  summary: string;
}[] = [
  { value: "first", label: "1st", summary: "Monthly on the 1st" },
  {
    value: "middle",
    label: "Middle",
    summary: "Monthly in the middle of the month",
  },
  { value: "last", label: "Last day", summary: "Monthly on the last day" },
];

export const storyCountOptions = ["5", "10", "20"];

export const matchingConfig = {
  scoringKeywords: {
    ...keywordMap(registry.brands),
    ...keywordMap(registry.creators),
    ...keywordMap(registry.topics),
    ...keywordMap(registry.modelPlatforms),
    ...keywordMap(registry.technologies),
  },
  brandTags: tagMap(registry.brands),
  modelTags: tagMap(registry.modelPlatforms),
  creatorTags: tagMap(registry.creators),
  topicTags: tagMap(registry.topics),
  technologyTags: tagMap(registry.technologies),
  focusTagAliases: {
    "3d models designs": "models",
    "3d models": "models",
    designs: "models",
    design: "models",
    model: "models",
    firmwareupdates: "firmware",
    "firmware updates": "firmware",
    "filament materials": "materials",
    filament: "materials",
    material: "materials",
    "deals discounts": "deals",
    discounts: "deals",
    "tutorials guides": "tutorials",
    guides: "tutorials",
    "fdm fff": "fdm",
    fff: "fdm",
    "sls mjf": "sls",
    mjf: "sls",
    "industrial professional": "industrial",
    professional: "industrial",
    "bambu lab": "bambu",
    "prusa research": "prusa",
    "maker world": "makerworld",
    cults: "cults3d",
    "makers muse": "maker's muse",
  },
};
