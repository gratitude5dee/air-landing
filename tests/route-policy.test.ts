import { afterEach, describe, expect, it, vi } from "vitest";

import {
  bearerSecretMatches,
  getParityBackendOrigin,
  getParityRoutePolicy,
} from "@/lib/route-policy";

afterEach(() => vi.unstubAllEnvs());

function enablePreview(origin: string) {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("AIR_PARITY_PROXY_ENABLED", "true");
  vi.stubEnv("VERCEL_AUTOMATION_BYPASS_SECRET", "preview-secret-long-enough");
  vi.stubEnv("AIR_PARITY_BACKEND_ORIGIN", origin);
}

describe("parity proxy policy", () => {
  it("is disabled by default and rejects production/private origins", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("AIR_PARITY_PROXY_ENABLED", "false");
    expect(getParityBackendOrigin()).toBeNull();

    enablePreview("https://air-eight-delta.vercel.app");
    expect(getParityBackendOrigin()).toBeNull();

    enablePreview("https://127.0.0.1");
    expect(getParityBackendOrigin()).toBeNull();
  });

  it("accepts only an explicit protected preview staging origin", () => {
    enablePreview("https://air-staging.example.net");
    expect(getParityBackendOrigin()).toBe("https://air-staging.example.net");
  });

  it("exposes only the three exact route contracts", () => {
    expect(getParityRoutePolicy("/healthz")).toMatchObject({ method: "GET" });
    expect(getParityRoutePolicy("/webhooks/imessage")).toMatchObject({
      method: "POST",
      maxRequestBytes: 65_536,
    });
    expect(getParityRoutePolicy("/internal/drain-inbox")).toMatchObject({
      method: "POST",
    });
    expect(getParityRoutePolicy("/internal/provider-audit")).toBeNull();
  });

  it("compares bearer secrets exactly and fails weak values closed", () => {
    const secret = "0123456789abcdef0123456789abcdef";
    expect(bearerSecretMatches(`Bearer ${secret}`, secret)).toBe(true);
    expect(bearerSecretMatches(`Bearer ${secret}x`, secret)).toBe(false);
    expect(bearerSecretMatches("Bearer short", "short")).toBe(false);
  });
});
