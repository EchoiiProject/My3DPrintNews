import { randomBytes } from "node:crypto";

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function subscriberToken(): string {
  return randomBytes(32).toString("hex");
}
