export const STORAGE_KEY = "my3dprintnews-preferences";

export type Preferences = {
  printers: string[];
  sources: string[];
  topics: string[];
  technology: string[];
  frequency: string;
  storiesPerUpdate: string;
};

export const defaultPreferences: Preferences = {
  printers: ["Bambu X1 Carbon"],
  sources: ["Printables"],
  topics: ["New Printers", "Reviews"],
  technology: ["FDM / FFF"],
  frequency: "Daily",
  storiesPerUpdate: "10",
};

const legacyBrandPrinters: Record<string, string[]> = {
  "Bambu Lab": ["Bambu X1 Carbon", "Bambu P1S"],
  "Prusa Research": ["Prusa MK4S", "Prusa XL"],
  Creality: ["Creality K1", "Creality K2 Plus"],
};

type SavedPreferences = Partial<Preferences> & {
  brands?: string[];
};

export function normalisePreferences(saved: SavedPreferences): Preferences {
  const legacyPrinters =
    saved.brands?.flatMap((brand) => legacyBrandPrinters[brand] ?? []) ?? [];

  return {
    ...defaultPreferences,
    ...saved,
    printers: saved.printers?.length
      ? saved.printers
      : legacyPrinters.length
        ? legacyPrinters
        : defaultPreferences.printers,
    sources: saved.sources?.length ? saved.sources : defaultPreferences.sources,
  };
}

export const preferenceGroups = [
  {
    key: "printers",
    title: "Printers",
    options: [
      "Bambu X1 Carbon",
      "Bambu P1S",
      "Bambu A1",
      "Bambu A1 Mini",
      "Prusa MK4S",
      "Prusa XL",
      "Creality K1",
      "Creality K2 Plus",
    ],
  },
  {
    key: "sources",
    title: "Sources",
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
