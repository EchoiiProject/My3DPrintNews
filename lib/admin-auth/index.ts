import "server-only";

import { createHash } from "node:crypto";
import { cookies } from "next/headers";

const adminCookieName = "platform_admin_session";
const cookieMaxAgeSeconds = 60 * 60 * 8;

// Future role model for white-label admin areas:
// platform_owner can manage platform-wide settings.
// vertical_owner can manage one vertical.
// advertiser can manage their own campaigns.
export type AdminRole = "platform_owner" | "vertical_owner" | "advertiser";

function configuredPassword(): string | null {
  return process.env.ADMIN_ACCESS_PASSWORD?.trim() || null;
}

function sessionValue(password: string): string {
  return createHash("sha256")
    .update(`platform-admin:${password}`)
    .digest("hex");
}

export function isAdminAccessConfigured(): boolean {
  return Boolean(configuredPassword());
}

export async function hasAdminAccess(): Promise<boolean> {
  const password = configuredPassword();

  if (!password) {
    return false;
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get(adminCookieName);

  return cookie?.value === sessionValue(password);
}

export async function setAdminAccessSession(): Promise<void> {
  const password = configuredPassword();

  if (!password) {
    return;
  }

  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, sessionValue(password), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: cookieMaxAgeSeconds,
  });
}

export async function clearAdminAccessSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(adminCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 0,
  });
}

export function adminPasswordMatches(value: FormDataEntryValue | null): boolean {
  const password = configuredPassword();

  return Boolean(
    password && typeof value === "string" && value === password,
  );
}
