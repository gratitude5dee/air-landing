import { describe, expect, it } from "vitest";

import {
  DIRECTION_IDS,
  DIRECTIONS,
  FEATURED_FILM,
  FIRST_VISUAL_RESPONSE,
} from "@/content/directions";

describe("Air direction manifest", () => {
  it("keeps the approved deterministic direction order", () => {
    expect(DIRECTION_IDS).toEqual([
      "golden-gate",
      "chrome-launch",
      "blue-hour",
    ]);
    expect(DIRECTIONS.map((direction) => direction.cueLabel)).toEqual([
      "Quiet morning",
      "Chrome launch",
      "Blue-hour portrait",
    ]);
  });

  it("uses three versioned frames per direction and one truthful matched film", () => {
    for (const direction of DIRECTIONS) {
      expect(direction.frames).toHaveLength(3);
      expect(direction.frames.map((frame) => frame.shot)).toEqual(["01", "02", "03"]);
      for (const frame of direction.frames) {
        expect(frame.src).toMatch(/^\/media\/air\/v2026-08-19-a\//);
      }
    }

    expect(DIRECTIONS[0]?.firstCutMode).toBe("matched");
    expect(DIRECTIONS.slice(1).every((direction) => direction.firstCutMode === "storyboard-only")).toBe(true);
    expect(FEATURED_FILM.duration).toBe(8);
    expect(FIRST_VISUAL_RESPONSE).toBe(
      "First visual ready. Want me to build the storyboard?",
    );
  });
});
