import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit, savePreorder } from "@/lib/preorders";

const preorder = {
  name: "Air Tester",
  email: "air@example.com",
  imessage: "+1 415 555 0123",
  consent: true,
  createdAt: "2026-08-20T00:00:00.000Z",
  source: "air-landing" as const,
};

beforeEach(() => {
  vi.stubEnv("NODE_ENV", "test");
  vi.stubEnv("VERCEL_ENV", "");
  vi.stubEnv("DATABASE_URL", "");
  vi.stubEnv("AIR_DATABASE_ENV", "");
  vi.stubEnv("AIR_ID_HASH_SECRET", "test-secret-0123456789abcdef01234567");
  globalThis.airLocalPreorders = new Map();
  globalThis.airLocalRateLimits = new Map();
});

afterEach(() => vi.unstubAllEnvs());

describe("preorder storage contract", () => {
  it("returns a stable receipt for a deduplicated local identity", async () => {
    const first = await savePreorder(preorder);
    const second = await savePreorder({
      ...preorder,
      email: "AIR@example.com",
      imessage: "+1 (415) 555-0123",
    });
    expect(first.stored).toBe("memory");
    expect(first.receipt).toMatch(/^local_/);
    expect(second.receipt).toBe(first.receipt);
  });

  it("atomically limits the local ten-minute bucket to five attempts", async () => {
    const decisions = [];
    for (let attempt = 0; attempt < 6; attempt += 1) {
      decisions.push(await rateLimit("203.0.113.9"));
    }
    expect(decisions).toEqual([true, true, true, true, true, false]);
  });

  it("requires a dedicated durable database in Vercel", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("AIR_DATABASE_ENV", "preview");
    await expect(savePreorder(preorder)).rejects.toThrow("database_unavailable");
  });
});
