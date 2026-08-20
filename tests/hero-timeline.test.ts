import { describe, expect, it } from "vitest";

import { resolveHeroTimeline } from "@/lib/hero-timeline";

describe("Air hero timeline", () => {
  it("holds the poster through cloud clearing before handing off to product UI", () => {
    expect(resolveHeroTimeline(0)).toMatchObject({
      revealProgress: 0,
      handoffProgress: 0,
      orbitProgress: 0,
      headerRevealed: false,
    });
    expect(resolveHeroTimeline(0.52)).toMatchObject({
      revealProgress: 1,
      handoffProgress: 0,
      orbitProgress: 0,
      headerRevealed: false,
    });
    expect(resolveHeroTimeline(0.64)).toMatchObject({
      revealProgress: 1,
      handoffProgress: 0,
    });
    expect(resolveHeroTimeline(0.94)).toMatchObject({
      revealProgress: 1,
      handoffProgress: 1,
      orbitProgress: 1,
      headerRevealed: true,
    });
  });

  it("keeps the named phase boundaries independent", () => {
    const denseClouds = resolveHeroTimeline(0.1);
    const clearingClouds = resolveHeroTimeline(0.3);
    const posterHold = resolveHeroTimeline(0.64);
    const handoff = resolveHeroTimeline(0.8);
    const settled = resolveHeroTimeline(1);

    expect(denseClouds.revealProgress).toBe(0);
    expect(clearingClouds.revealProgress).toBeGreaterThan(0);
    expect(clearingClouds.revealProgress).toBeLessThan(1);
    expect(posterHold).toMatchObject({ revealProgress: 1, handoffProgress: 0 });
    expect(handoff.handoffProgress).toBeGreaterThan(0);
    expect(handoff.orbitProgress).toBeGreaterThan(0);
    expect(handoff.headerRevealed).toBe(true);
    expect(settled).toMatchObject({
      revealProgress: 1,
      handoffProgress: 1,
      orbitProgress: 1,
      headerRevealed: true,
    });
  });

  it("clamps out-of-range scroll values", () => {
    expect(resolveHeroTimeline(-1).progress).toBe(0);
    expect(resolveHeroTimeline(2).progress).toBe(1);
  });
});
