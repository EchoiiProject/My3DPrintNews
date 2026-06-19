export const FAVOURITES_KEY = "my3dprintnews-favourites";

export type Favourites = {
  brands: string[];
  models: string[];
  creators: string[];
};

type FavouriteKey = keyof Favourites;

export const defaultFavourites: Favourites = {
  brands: [],
  models: [],
  creators: [],
};

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
