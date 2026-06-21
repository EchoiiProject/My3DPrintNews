import type { MonthlyTiming, WeeklyDay } from "../lib/preferences";

// Reusable personalised feed engine with My3DPrintNews as the first vertical.

export const legacyPrinterBrands: Record<string, string> = {
  "Bambu X1 Carbon": "Bambu Lab",
  "Bambu P1S": "Bambu Lab",
  "Bambu A1": "Bambu Lab",
  "Bambu A1 Mini": "Bambu Lab",
  "Prusa MK4S": "Prusa Research",
  "Prusa XL": "Prusa Research",
  "Creality K1": "Creality",
  "Creality K2 Plus": "Creality",
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
    key: "models",
    title: "Model Platforms",
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

export const weeklyDayOptions: { value: WeeklyDay; label: string; long: string }[] = [
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
    Bambu: ["bambu", "x1 carbon", "p1s", "a1 mini", "bambu a1"],
    Prusa: ["prusa", "mk4s", "prusa xl"],
    Creality: ["creality", "k1", "k2 plus"],
    Elegoo: ["elegoo"],
    Anycubic: ["anycubic"],
    Flashforge: ["flashforge"],
    "Maker's Muse": ["maker's muse", "makers muse"],
    "CNC Kitchen": ["cnc kitchen"],
    "3D Printing Nerd": ["3d printing nerd"],
    "Teaching Tech": ["teaching tech"],
    "Thomas Sanladerer": ["thomas sanladerer", "toms3d"],
    "Aurora Tech": ["aurora tech"],
    "New Printers": ["new printer", "launch", "announces", "released", "debut"],
    Reviews: ["review", "reviews", "tested", "hands-on", "benchmark"],
    Firmware: ["firmware", "software update", "input shaping"],
    Models: ["model", "models", "design", "printables", "makerworld"],
    Printables: ["printables"],
    MakerWorld: ["makerworld", "maker world"],
    Thingiverse: ["thingiverse"],
    Thangs: ["thangs"],
    Cults3D: ["cults3d", "cults"],
    Materials: ["material", "materials", "filament", "pla", "petg", "nylon"],
    Accessories: ["accessory", "accessories", "upgrade", "hotend", "build plate"],
    Deals: ["deal", "deals", "discount", "sale", "bundle", "coupon"],
    Tutorials: ["tutorial", "tutorials", "guide", "how to", "calibration"],
    FDM: ["fdm", "fff", "filament"],
    Resin: ["resin", "sla", "msla", "dlp"],
    SLS: ["sls", "mjf", "powder bed"],
    Industrial: ["industrial", "professional", "production", "service bureau"],
  },
  brandTags: {
    "Bambu Lab": "Bambu",
    "Prusa Research": "Prusa",
    Creality: "Creality",
    Elegoo: "Elegoo",
    Anycubic: "Anycubic",
    Flashforge: "Flashforge",
  },
  modelTags: {
    Printables: "Printables",
    MakerWorld: "MakerWorld",
    Thingiverse: "Thingiverse",
    Thangs: "Thangs",
    Cults3D: "Cults3D",
  },
  creatorTags: {
    "Maker's Muse": "Maker's Muse",
    "CNC Kitchen": "CNC Kitchen",
    "3D Printing Nerd": "3D Printing Nerd",
    "Teaching Tech": "Teaching Tech",
    "Thomas Sanladerer": "Thomas Sanladerer",
    "Aurora Tech": "Aurora Tech",
  },
  topicTags: {
    "New Printers": "New Printers",
    Reviews: "Reviews",
    "Firmware Updates": "Firmware",
    "3D Models / Designs": "Models",
    "Filament & Materials": "Materials",
    Accessories: "Accessories",
    "Deals & Discounts": "Deals",
    "Tutorials & Guides": "Tutorials",
  },
  technologyTags: {
    "FDM / FFF": "FDM",
    Resin: "Resin",
    "SLS / MJF": "SLS",
    "Industrial / Professional": "Industrial",
  },
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
