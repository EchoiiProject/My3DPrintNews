import {
  adminSlugForPublicationSlug,
  publicationSlugForVertical,
  verticals,
} from "@/config/verticals";

export type HostnameResolution =
  | {
      kind: "network";
      hostname: string;
    }
  | {
      kind: "publication";
      adminSlug: string;
      hostname: string;
      slug: string;
    }
  | {
      kind: "unknown";
      hostname: string;
    };

const networkHostnames = new Set(["mynewsnetwork.uk", "www.mynewsnetwork.uk"]);

function normaliseHostname(hostname: string): string {
  const value = hostname.toLowerCase();
  if (value === "::1" || value.startsWith("[::1]")) {
    return "::1";
  }

  return value.split(":")[0]?.replace(/^www\./, "") ?? "";
}

function isLocalOrPreviewHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".vercel.app")
  );
}

export function resolvePublicationHostname(
  rawHostname: string | null | undefined,
): HostnameResolution {
  const hostname = normaliseHostname(rawHostname ?? "");

  if (!hostname || isLocalOrPreviewHostname(hostname)) {
    return { kind: "unknown", hostname };
  }

  if (networkHostnames.has(hostname)) {
    return { kind: "network", hostname };
  }

  const configured = verticals.find((vertical) => {
    const configuredHostname = vertical.hostname
      ? normaliseHostname(vertical.hostname)
      : "";

    return configuredHostname === hostname;
  });

  if (configured) {
    return {
      kind: "publication",
      adminSlug: configured.slug,
      hostname,
      slug: publicationSlugForVertical(configured),
    };
  }

  const subdomain = hostname.endsWith(".mynewsnetwork.uk")
    ? hostname.replace(".mynewsnetwork.uk", "")
    : "";
  const adminSlug = subdomain ? adminSlugForPublicationSlug(subdomain) : undefined;

  if (adminSlug) {
    return {
      kind: "publication",
      adminSlug,
      hostname,
      slug: subdomain,
    };
  }

  return { kind: "unknown", hostname };
}
