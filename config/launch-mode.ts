export const publicNetworkEnabled =
  process.env.NEXT_PUBLIC_PUBLIC_NETWORK_ENABLED === "true" ||
  process.env.PUBLIC_NETWORK_ENABLED === "true";

export const launchMode = !publicNetworkEnabled;

export const productionBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://my3dprintnews.co.uk";
