import {
  frequencyOptions,
  legacyPrinterBrands,
  monthlyTimingOptions,
  preferenceGroups,
  storyCountOptions,
  weeklyDayOptions,
} from "../../config/preferences";

export const STORAGE_KEY = "my3dprintnews-preferences";

export type DeliveryFrequency = "daily" | "weekly" | "monthly";
export type WeeklyDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export type MonthlyTiming = "first" | "middle" | "last";

export type DeliveryPreferences = {
  frequency: DeliveryFrequency;
  weeklyDay?: WeeklyDay;
  monthlyTiming?: MonthlyTiming;
};

export type Preferences = {
  brands: string[];
  models: string[];
  creators: string[];
  sources: string[];
  topics: string[];
  technology: string[];
  frequency: string;
  storiesPerUpdate: string;
  delivery: DeliveryPreferences;
};

export const defaultPreferences: Preferences = {
  brands: [],
  models: [],
  creators: [],
  sources: [],
  topics: [],
  technology: [],
  frequency: "Daily",
  storiesPerUpdate: "10",
  delivery: {
    frequency: "daily",
    weeklyDay: "mon",
    monthlyTiming: "first",
  },
};

type SavedPreferences = Partial<Preferences> & {
  printers?: string[];
};

type ArrayPreferenceKey =
  | "brands"
  | "models"
  | "creators"
  | "sources"
  | "topics"
  | "technology";

function savedArray(
  saved: SavedPreferences,
  key: ArrayPreferenceKey,
): string[] | undefined {
  const value = saved[key];

  return Object.prototype.hasOwnProperty.call(saved, key) &&
    Array.isArray(value)
    ? value
    : undefined;
}

function normaliseDelivery(saved: SavedPreferences): DeliveryPreferences {
  const savedDelivery = saved.delivery;
  const frequencyFromLegacy = saved.frequency?.toLowerCase();
  const frequency =
    savedDelivery?.frequency === "weekly" ||
    savedDelivery?.frequency === "monthly" ||
    savedDelivery?.frequency === "daily"
      ? savedDelivery.frequency
      : frequencyFromLegacy === "weekly" ||
          frequencyFromLegacy === "monthly" ||
          frequencyFromLegacy === "daily"
        ? frequencyFromLegacy
        : defaultPreferences.delivery.frequency;

  const weeklyDay =
    savedDelivery?.weeklyDay === "tue" ||
    savedDelivery?.weeklyDay === "wed" ||
    savedDelivery?.weeklyDay === "thu" ||
    savedDelivery?.weeklyDay === "fri" ||
    savedDelivery?.weeklyDay === "sat" ||
    savedDelivery?.weeklyDay === "sun" ||
    savedDelivery?.weeklyDay === "mon"
      ? savedDelivery.weeklyDay
      : defaultPreferences.delivery.weeklyDay;
  const monthlyTiming =
    savedDelivery?.monthlyTiming === "middle" ||
    savedDelivery?.monthlyTiming === "last" ||
    savedDelivery?.monthlyTiming === "first"
      ? savedDelivery.monthlyTiming
      : defaultPreferences.delivery.monthlyTiming;

  return {
    frequency,
    weeklyDay,
    monthlyTiming,
  };
}

export function normalisePreferences(saved: SavedPreferences): Preferences {
  const modelPlatformOptions = new Set(
    preferenceGroups
      .find((group) => group.key === "models")
      ?.options.map((option) => String(option)) ?? [],
  );
  const legacyBrands =
    saved.printers?.map((printer) => legacyPrinterBrands[printer] ?? printer) ??
    [];
  const savedBrands = savedArray(saved, "brands");
  const savedModels = savedArray(saved, "models");
  const savedCreators = savedArray(saved, "creators");
  const savedSources = savedArray(saved, "sources");
  const legacyModelSources =
    savedSources?.filter((source) => modelPlatformOptions.has(source)) ?? [];
  const delivery = normaliseDelivery(saved);

  return {
    ...defaultPreferences,
    ...saved,
    frequency:
      delivery.frequency === "weekly"
        ? "Weekly"
        : delivery.frequency === "monthly"
          ? "Monthly"
          : "Daily",
    delivery,
    brands: Array.isArray(savedBrands)
      ? savedBrands
      : legacyBrands.length
        ? Array.from(new Set(legacyBrands))
        : defaultPreferences.brands,
    models: Array.isArray(savedModels)
      ? savedModels
      : legacyModelSources.length
        ? legacyModelSources
        : defaultPreferences.models,
    creators: Array.isArray(savedCreators)
      ? savedCreators
      : defaultPreferences.creators,
    sources: Array.isArray(savedSources)
      ? savedSources
      : defaultPreferences.sources,
  };
}

export {
  frequencyOptions,
  monthlyTimingOptions,
  preferenceGroups,
  storyCountOptions,
  weeklyDayOptions,
};
