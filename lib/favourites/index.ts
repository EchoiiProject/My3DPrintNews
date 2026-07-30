export const FAVOURITES_KEY = "my3dprintnews-favourites";

export type Favourites = {
  brands: string[];
  modelPlatforms: string[];
  creators: string[];
  sources: string[];
  topics: string[];
  technology: string[];
};

type FavouriteKey = keyof Favourites;
type LegacyFavourites = Partial<Favourites> & {
  models?: string[];
};

export const defaultFavourites: Favourites = {
  brands: [],
  modelPlatforms: [],
  creators: [],
  sources: [],
  topics: [],
  technology: [],
};

export function normaliseFavourites(saved: LegacyFavourites): Favourites {
  return {
    brands: Array.isArray(saved.brands) ? saved.brands : defaultFavourites.brands,
    modelPlatforms: Array.isArray(saved.modelPlatforms)
      ? saved.modelPlatforms
      : Array.isArray(saved.models)
        ? saved.models
        : defaultFavourites.modelPlatforms,
    creators: Array.isArray(saved.creators)
      ? saved.creators
      : defaultFavourites.creators,
    sources: Array.isArray(saved.sources) ? saved.sources : defaultFavourites.sources,
    topics: Array.isArray(saved.topics) ? saved.topics : defaultFavourites.topics,
    technology: Array.isArray(saved.technology)
      ? saved.technology
      : defaultFavourites.technology,
  };
}

export function isFavouriteKey(value: string): value is FavouriteKey {
  return (
    value === "brands" ||
    value === "modelPlatforms" ||
    value === "creators" ||
    value === "sources" ||
    value === "topics" ||
    value === "technology"
  );
}

export function favouriteKeyForPreferenceGroup(
  value: string,
): FavouriteKey | null {
  if (value === "brands" || value === "creators" || value === "sources") {
    return value;
  }

  if (value === "models") {
    return "modelPlatforms";
  }

  if (value === "topics" || value === "technology") {
    return value;
  }

  return null;
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

// Future ranking can translate favourite brands, creators, and sources into
// feed boosts without changing the user's selected feed preferences.
export function favouriteBoostValues(favourites: Favourites): string[] {
  return [
    ...favourites.brands,
    ...favourites.modelPlatforms,
    ...favourites.creators,
    ...favourites.sources,
    ...favourites.topics,
    ...favourites.technology,
  ];
}
