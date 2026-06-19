export const STORAGE_KEY = "my3dprintnews-preferences";

export type Preferences = {
  brands: string[];
  models: string[];
  creators: string[];
  topics: string[];
  technology: string[];
  frequency: string;
  storiesPerUpdate: string;
};

export const defaultPreferences: Preferences = {
  brands: [],
  models: [],
  creators: [],
  topics: [],
  technology: [],
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

type ArrayPreferenceKey =
  | "brands"
  | "models"
  | "creators"
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

export function normalisePreferences(saved: SavedPreferences): Preferences {
  const legacyBrands =
    saved.printers?.map((printer) => printerBrands[printer] ?? printer) ?? [];
  const savedBrands = savedArray(saved, "brands");
  const savedModels = savedArray(saved, "models");
  const savedCreators = savedArray(saved, "creators");

  return {
    ...defaultPreferences,
    ...saved,
    brands: Array.isArray(savedBrands)
      ? savedBrands
      : legacyBrands.length
        ? Array.from(new Set(legacyBrands))
        : defaultPreferences.brands,
    models: Array.isArray(savedModels)
      ? savedModels
      : saved.sources
        ? saved.sources
        : defaultPreferences.models,
    creators: Array.isArray(savedCreators)
      ? savedCreators
      : defaultPreferences.creators,
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
    key: "creators",
    title: "Creators",
    options: [
      "Maker's Muse",
      "CNC Kitchen",
      "3D Printing Nerd",
      "Teaching Tech",
      "Thomas Sanladerer",
      "Aurora Tech",
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
