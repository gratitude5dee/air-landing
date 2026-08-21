import { describe, expect, it } from "vitest";

import {
  airDemoReducer,
  INITIAL_AIR_DEMO_STATE,
  type AirDemoState,
} from "@/components/air-demo-state";

function reduce(
  state: AirDemoState,
  ...actions: Parameters<typeof airDemoReducer>[1][]
) {
  return actions.reduce(airDemoReducer, state);
}

describe("Air demo reducer", () => {
  it("makes thumbs-up and heart review eligible while heart remembers taste", () => {
    const approved = airDemoReducer(
      INITIAL_AIR_DEMO_STATE as AirDemoState,
      { type: "select-reaction", reaction: "👍" },
    );
    expect(approved).toMatchObject({ reaction: "👍", reviewEligible: true });

    const loved = airDemoReducer(
      INITIAL_AIR_DEMO_STATE as AirDemoState,
      { type: "select-reaction", reaction: "❤️" },
    );
    expect(loved).toMatchObject({
      reaction: "❤️",
      reviewEligible: true,
      tasteDirectionId: "chrome-launch",
    });
  });

  it("cycles direction and clears derived state on thumbs-down", () => {
    const reviewed = reduce(
      INITIAL_AIR_DEMO_STATE as AirDemoState,
      { type: "select-reaction", reaction: "👍" },
      { type: "toggle-review" },
      { type: "show-frame", frame: 2 },
      { type: "select-reaction", reaction: "👎" },
    );
    expect(reviewed).toMatchObject({
      directionId: "blue-hour",
      reaction: null,
      reviewEligible: false,
      reviewed: false,
      clarifierAnswer: null,
      activeFrame: 0,
      hasReacted: true,
    });
  });

  it("applies only an approved clarifier answer and then opens storyboard", () => {
    const state = reduce(
      INITIAL_AIR_DEMO_STATE as AirDemoState,
      { type: "select-direction", directionId: "chrome-launch" },
      { type: "select-reaction", reaction: "?" },
      { type: "answer-clarifier", answer: "Pristine" },
      { type: "select-reaction", reaction: "👍" },
      { type: "toggle-review" },
      { type: "show-frame", frame: 1 },
    );
    expect(state).toMatchObject({
      directionId: "chrome-launch",
      clarifierAnswer: "Pristine",
      reviewed: true,
      activeFrame: 1,
    });
  });
});
