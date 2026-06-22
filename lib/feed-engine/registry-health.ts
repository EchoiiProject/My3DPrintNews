import { registry, RegistryItem } from "@/config/registry";

type SourceStatus = NonNullable<RegistryItem["status"]>;

export type RegistryHealthSummary = {
  totalBrands: number;
  totalCreators: number;
  totalSources: number;
  totalPlatforms: number;
  activeSources: number;
  partialSources: number;
  placeholderSources: number;
};

function countByStatus(items: readonly RegistryItem[], status: SourceStatus) {
  return items.filter((item) => item.status === status).length;
}

export function getRegistryHealthSummary(): RegistryHealthSummary {
  // Source-like entries include RSS/blog sources and creator video sources.
  // This keeps the white-label engine ready for future vertical registry audits.
  const sourceLikeItems: readonly RegistryItem[] = [
    ...registry.sources,
    ...registry.creators,
  ];

  return {
    totalBrands: registry.brands.length,
    totalCreators: registry.creators.length,
    totalSources: registry.sources.length,
    totalPlatforms: registry.modelPlatforms.length,
    activeSources: countByStatus(sourceLikeItems, "active"),
    partialSources: countByStatus(sourceLikeItems, "partial"),
    placeholderSources: countByStatus(sourceLikeItems, "placeholder"),
  };
}
