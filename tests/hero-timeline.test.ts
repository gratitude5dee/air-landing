import { describe, expect, it } from "vitest";

import { resolveHeroTimeline } from "@/lib/hero-timeline";

describe("Air hero timeline", () => {
  it("dissolves the logo before the cloud title can appear", () => {
    expect(resolveHeroTimeline(0)).toMatchObject({
      posterExitProgress: 0,
      revealProgress: 0,
      titleProgress: 0,
      handoffProgress: 0,
      orbitProgress: 0,
      headerRevealed: false,
    });
    expect(resolveHeroTimeline(0.3)).toMatchObject({
      posterExitProgress: 1,
      titleProgress: 0,
    });
    expect(resolveHeroTimeline(0.34)).toMatchObject({
      posterExitProgress: 1,
      titleProgress: 0,
      revealProgress: expect.any(Number),
    });
    expect(resolveHeroTimeline(0.56)).toMatchObject({
      posterExitProgress: 1,
      titleProgress: 1,
      handoffProgress: 0,
      orbitProgress: 0,
      headerRevealed: false,
    });
    expect(resolveHeroTimeline(0.78)).toMatchObject({
      revealProgress: 1,
      titleProgress: 0,
      handoffProgress: 0,
    });
    expect(resolveHeroTimeline(0.98)).toMatchObject({
      revealProgress: 1,
      handoffProgress: 1,
      orbitProgress: 1,
      headerRevealed: true,
    });
  });

  it("keeps the named phase boundaries independent", () => {
    const denseClouds = resolveHeroTimeline(0.1);
    const clearingClouds = resolveHeroTimeline(0.5);
    const titleHold = resolveHeroTimeline(0.62);
    const handoff = resolveHeroTimeline(0.9);
    const settled = resolveHeroTimeline(1);

    expect(denseClouds.revealProgress).toBe(0);
    expect(clearingClouds.revealProgress).toBeGreaterThan(0);
    expect(clearingClouds.revealProgress).toBeLessThan(1);
    expect(titleHold).toMatchObject({ titleProgress: 1, handoffProgress: 0 });
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

  it("never reveals the cloud title while the baked poster remains", () => {
    for (let step = 0; step <= 1000; step += 1) {
      const timeline = resolveHeroTimeline(step / 1000);
      if (timeline.titleProgress > 0.01) {
        expect(timeline.posterExitProgress).toBe(1);
      }
    }
  });

  it("clamps out-of-range scroll values", () => {
    expect(resolveHeroTimeline(-1).progress).toBe(0);
    expect(resolveHeroTimeline(2).progress).toBe(1);
  });
});
