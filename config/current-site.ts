import { updatePosts } from "./my3dprintnews/updates";
import { appConfig } from "./site";

// Active vertical configuration. Future sites can swap this one file to point
// at config/ainews/*, config/roboticsnews/*, or config/evnews/* without
// changing page components.
export const currentSite = {
  metadata: appConfig,
  updates: {
    posts: updatePosts,
  },
};
