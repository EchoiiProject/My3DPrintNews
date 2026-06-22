export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl?: string;
  price: number;
  currency: "GBP" | "USD" | "EUR";
  shortDescription: string;
  destinationUrl: string;
  tags: string[];
  active: boolean;
  featured: boolean;
  featuredUntil: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductPlacementId =
  | "homepage-featured-product"
  | "feed-featured-product"
  | "newsletter-featured-product"
  | "brand-product-panel"
  | "category-product-panel";

export type ProductPlacement = {
  id: ProductPlacementId;
  name: string;
  description: string;
  location: string;
  enabled: boolean;
};

export type ProductAnalyticsEvent = {
  productId: string;
  placement: ProductPlacementId;
  page: string;
  timestamp: string;
};

export const productPlacements: ProductPlacement[] = [
  {
    id: "homepage-featured-product",
    name: "Homepage Featured Product",
    description: "A compact featured product section on the homepage.",
    location: "homepage",
    enabled: true,
  },
  {
    id: "feed-featured-product",
    name: "Feed Featured Product",
    description: "A product promotion slot prepared for feed pages.",
    location: "feed",
    enabled: false,
  },
  {
    id: "newsletter-featured-product",
    name: "Newsletter Featured Product",
    description: "A product slot prepared for future newsletter templates.",
    location: "newsletter",
    enabled: false,
  },
  {
    id: "brand-product-panel",
    name: "Brand Product Panel",
    description: "A brand-context product panel for future vertical pages.",
    location: "brand",
    enabled: false,
  },
  {
    id: "category-product-panel",
    name: "Category Product Panel",
    description: "A category-context product panel for future discovery pages.",
    location: "category",
    enabled: false,
  },
];

export const products: Product[] = [
  {
    id: "demo-prusa-core-one",
    title: "Prusa CORE One",
    brand: "Prusa Research",
    category: "3D Printer",
    price: 949,
    currency: "GBP",
    shortDescription:
      "Demo product record for a compact CoreXY printer promotion.",
    destinationUrl: "https://www.prusa3d.com/",
    tags: ["printer", "corexy", "fdm"],
    active: true,
    featured: true,
    featuredUntil: "2026-08-31",
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "demo-prusa-mk4s",
    title: "Prusa MK4S",
    brand: "Prusa Research",
    category: "3D Printer",
    price: 689,
    currency: "GBP",
    shortDescription:
      "Sample listing for a reliable desktop FDM printer promotion.",
    destinationUrl: "https://www.prusa3d.com/",
    tags: ["printer", "fdm", "desktop"],
    active: true,
    featured: true,
    featuredUntil: "2026-08-31",
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "demo-bambu-x1c",
    title: "Bambu X1C",
    brand: "Bambu Lab",
    category: "3D Printer",
    price: 1129,
    currency: "GBP",
    shortDescription:
      "Demo product record for a high-speed enclosed printer campaign.",
    destinationUrl: "https://bambulab.com/",
    tags: ["printer", "fdm", "enclosed"],
    active: true,
    featured: true,
    featuredUntil: "2026-08-31",
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "demo-creality-k2-plus",
    title: "Creality K2 Plus",
    brand: "Creality",
    category: "3D Printer",
    price: 1299,
    currency: "GBP",
    shortDescription:
      "Sample product entry for a large-format printer promotion.",
    destinationUrl: "https://www.creality.com/",
    tags: ["printer", "fdm", "large format"],
    active: true,
    featured: true,
    featuredUntil: "2026-08-31",
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "demo-formlabs-form-4",
    title: "Formlabs Form 4",
    brand: "Formlabs",
    category: "Resin Printer",
    price: 3999,
    currency: "GBP",
    shortDescription:
      "Demo record for a professional resin printer promotion.",
    destinationUrl: "https://formlabs.com/",
    tags: ["printer", "resin", "professional"],
    active: true,
    featured: false,
    featuredUntil: "2026-08-31",
    createdAt: "2026-06-22T00:00:00.000Z",
    updatedAt: "2026-06-22T00:00:00.000Z",
  },
];

export const featuredProducts = products.filter(
  (product) => product.active && product.featured,
);
