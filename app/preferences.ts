export const STORAGE_KEY = "my3dprintnews-preferences";

export type Preferences = {
  brands: string[];
  models: string[];
  topics: string[];
  technology: string[];
  frequency: string;
  storiesPerUpdate: string;
};

export const defaultPreferences: Preferences = {
  brands: ["Bambu Lab"],
  models: ["Printables"],
  topics: ["New Printers", "Reviews"],
  technology: ["FDM / FFF"],
  frequency: "Daily",
  storiesPerUpdate: "10",
};

const printerBrands: Record<string, string> = {
  "Bambu X1 Carbon": "Bambu Lab",
  "Bambu P1S": "Bambu Lab",
  "Bambu A1": "Bambu Lab",
  "Bambu A1 Mini": "Bambu Lab",
  "Prusa MK4S": "Prusa Research",
  "Prusa XL": "Prusa Research",
  "Creality K1": "Creality",
  "Creality K2 Plus": "Creality",
};

type SavedPreferences = Partial<Preferences> & {
  printers?: string[];
  sources?: string[];
};

export function normalisePreferences(saved: SavedPreferences): Preferences {
  const legacyBrands =
    saved.printers?.map((printer) => printerBrands[printer] ?? printer) ?? [];

  return {
    ...defaultPreferences,
    ...saved,
    brands: saved.brands?.length
      ? saved.brands
      : legacyBrands.length
        ? Array.from(new Set(legacyBrands))
        : defaultPreferences.brands,
    models: saved.models?.length
      ? saved.models
      : saved.sources?.length
        ? saved.sources
        : defaultPreferences.models,
  };
}

export const preferenceGroups = [
  {
    key: "brands",
    title: "Brands",
    options: [
      "Bambu Lab",
      "Prusa Research",
      "Creality",
      "Elegoo",
      "Anycubic",
      "Flashforge",
    ],
  },
  {
    key: "models",
    title: "Models",
    options: [
      "Printables",
      "MakerWorld",
      "Thingiverse",
      "Thangs",
      "Cults3D",
    ],
  },
  {
    key: "topics",
    title: "Topics",
    options: [
      "New Printers",
      "Reviews",
      "Firmware Updates",
      "3D Models / Designs",
      "Filament & Materials",
      "Accessories",
      "Deals & Discounts",
      "Tutorials & Guides",
    ],
  },
  {
    key: "technology",
    title: "Technology",
    options: ["FDM / FFF", "Resin", "SLS / MJF", "Industrial / Professional"],
  },
] as const;

export const frequencyOptions = ["Daily", "Weekly", "Monthly"];

export const storyCountOptions = ["5", "10", "20"];
