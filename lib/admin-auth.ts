import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const AIR_ADMIN_COOKIE = "air_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12;

function adminPassword() {
  // AIR_ADMIN_PASSWORD can replace the bootstrap password without a code change.
  return process.env.AIR_ADMIN_PASSWORD?.trim() || "5dee";
}

function signature(payload: string) {
  return createHmac("sha256", adminPassword()).update(payload).digest("hex");
}

export function verifyAdminPassword(value: unknown) {
  return typeof value === "string" && value.length > 0 && value === adminPassword();
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = String(expiresAt);
  return `${payload}.${signature(payload)}`;
}

export function verifyAdminSession(value?: string) {
  if (!value) return false;
  const [expiresAt, providedSignature] = value.split(".");
  if (!expiresAt || !providedSignature || Number(expiresAt) < Math.floor(Date.now() / 1000)) {
    return false;
  }
  const expected = signature(expiresAt);
  const provided = Buffer.from(providedSignature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");
  return provided.length === expectedBuffer.length && timingSafeEqual(provided, expectedBuffer);
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
