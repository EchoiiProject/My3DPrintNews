import { BuildVersionBadge } from "./build-version-badge";
import { HomePageClient } from "./home-page-client";

export default function Home() {
  return <HomePageClient buildBadge={<BuildVersionBadge />} />;
}
