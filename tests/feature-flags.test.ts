import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveAirFeatureFlags } from "@/lib/feature-flags";

afterEach(() => vi.unstubAllEnvs());

describe("Air feature flags", () => {
  it("defaults the cinematic handoff on and memory echo off", () => {
    vi.stubEnv("AIR_CINEMATIC", "");
    vi.stubEnv("AIR_MEMORY_ECHO", "");
    expect(resolveAirFeatureFlags()).toEqual({
      cinematicEnabled: true,
      memoryEchoEnabled: false,
    });
  });

  it("accepts explicit true and false values", () => {
    vi.stubEnv("AIR_CINEMATIC", "true");
    vi.stubEnv("AIR_MEMORY_ECHO", "false");
    expect(resolveAirFeatureFlags()).toEqual({
      cinematicEnabled: true,
      memoryEchoEnabled: false,
    });
  });

  it("fails closed on invalid values", () => {
    vi.stubEnv("AIR_CINEMATIC", "yes");
    expect(() => resolveAirFeatureFlags()).toThrow(/AIR_CINEMATIC/);
  });
});
