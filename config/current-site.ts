import { updatePosts } from "./my3dprintnews/updates";
import type { Sponsor } from "./sponsors";
import { appConfig } from "./site";

// Active vertical configuration. Future sites can swap this one file to point
// at config/ainews/*, config/roboticsnews/*, or config/evnews/* without
// changing page components.
export const currentSite = {
  metadata: appConfig,
  currentSponsor: null as Sponsor | null,
  updates: {
    posts: updatePosts,
  },
};
