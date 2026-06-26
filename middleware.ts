import { NextRequest, NextResponse } from "next/server";
import { resolvePublicationHostname } from "@/lib/publications/hostname";

const passthroughPrefixes = [
  "/admin",
  "/api",
  "/publications",
  "/_next",
];

function shouldPassThrough(pathname: string): boolean {
  return (
    passthroughPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes(".")
  );
}

export function middleware(request: NextRequest) {
  const resolution = resolvePublicationHostname(request.headers.get("host"));

  if (resolution.kind !== "publication") {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  if (shouldPassThrough(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();

  if (pathname === "/") {
    url.pathname = `/publications/${resolution.slug}`;
    return NextResponse.rewrite(url);
  }

  if (pathname === "/feed") {
    url.pathname = `/publications/${resolution.slug}/feed`;
    return NextResponse.rewrite(url);
  }

  if (pathname === "/catch-up") {
    url.pathname = `/publications/${resolution.slug}/catch-up`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
