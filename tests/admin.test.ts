import { afterEach, describe, expect, it, vi } from "vitest";

import {
  adminSessionCookie,
  clearAdminSessionCookie,
  hashAdminPassword,
  verifyAdminPassword,
} from "@/lib/admin";

afterEach(() => vi.unstubAllEnvs());

describe("admin authentication primitives", () => {
  it("verifies the configured scrypt hash and rejects another password", async () => {
    const encoded = await hashAdminPassword("5dee", "0123456789abcdef0123456789abcdef");
    vi.stubEnv("AIR_ADMIN_PASSWORD_HASH", encoded);

    await expect(verifyAdminPassword("5dee")).resolves.toBe(true);
    await expect(verifyAdminPassword("wrong-password")).resolves.toBe(false);
  });

  it("emits an HttpOnly, strict, secure session cookie and a clearing cookie", () => {
    const cookie = adminSessionCookie("token-value");
    expect(cookie).toContain("air_admin_session=token-value");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Strict");
    expect(cookie).toContain("Secure");
    expect(clearAdminSessionCookie()).toContain("Max-Age=0");
  });
});
