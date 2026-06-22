import { currentSite } from "../../config/current-site";
import { UpdatesPageTemplate } from "./updates-page-template";

export default function UpdatesPage() {
  const { metadata, updates } = currentSite;

  return (
    <UpdatesPageTemplate
      badge={metadata.updates.badge}
      feedbackCta={metadata.updates.feedbackCta}
      intro={metadata.updates.intro}
      posts={updates.posts}
      title={metadata.updates.title}
    />
  );
}
