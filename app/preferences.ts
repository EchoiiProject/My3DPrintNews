export const STORAGE_KEY = "my3dprintnews-preferences";
export const FAVOURITES_KEY = "my3dprintnews-favourites";

export type Preferences = {
  brands: string[];
  models: string[];
  creators: string[];
  topics: string[];
  technology: string[];
  frequency: string;
  storiesPerUpdate: string;
};

export type Favourites = {
  brands: string[];
  models: string[];
  creators: string[];
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

export const defaultFavourites: Favourites = {
  brands: [],
  models: [],
  creators: [],
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

type FavouriteKey = keyof Favourites;

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

export function normaliseFavourites(saved: Partial<Favourites>): Favourites {
  return {
    brands: Array.isArray(saved.brands) ? saved.brands : defaultFavourites.brands,
    models: Array.isArray(saved.models) ? saved.models : defaultFavourites.models,
    creators: Array.isArray(saved.creators)
      ? saved.creators
      : defaultFavourites.creators,
  };
}

export function isFavouriteKey(value: string): value is FavouriteKey {
  return value === "brands" || value === "models" || value === "creators";
}

export function toggleFavourite(
  favourites: Favourites,
  key: FavouriteKey,
  value: string,
): Favourites {
  const current = favourites[key];

  return {
    ...favourites,
    [key]: current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  };
}

// Future ranking can translate these favourites into feed boosts without
// changing the stored shape or the user's selected feed preferences.
export function favouriteBoostValues(favourites: Favourites): string[] {
  return [...favourites.brands, ...favourites.models, ...favourites.creators];
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
