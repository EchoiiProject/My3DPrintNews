export const STORAGE_KEY = "my3dprintnews-preferences";

export type Preferences = {
  brands: string[];
  topics: string[];
  technology: string[];
  frequency: string;
  storiesPerUpdate: string;
};

export const defaultPreferences: Preferences = {
  brands: ["Bambu Lab"],
  topics: ["New Printers", "Reviews"],
  technology: ["FDM / FFF"],
  frequency: "Daily",
  storiesPerUpdate: "10",
};

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
