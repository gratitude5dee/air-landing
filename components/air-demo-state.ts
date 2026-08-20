import {
  DIRECTION_IDS,
  getDirection,
  type DirectionId,
} from "@/content/directions";

export type AirReaction = "❤️" | "👍" | "👎" | "HA HA" | "‼️" | "?";
export type StoryboardFrameIndex = 0 | 1 | 2;

export type AirDemoState = {
  directionId: DirectionId;
  reaction: AirReaction | null;
  reviewEligible: boolean;
  reviewed: boolean;
  clarifierOpen: boolean;
  clarifierAnswer: string | null;
  tasteDirectionId: DirectionId | null;
  activeFrame: StoryboardFrameIndex;
  hasReacted: boolean;
  announcement: string;
};

export type AirDemoAction =
  | { type: "select-direction"; directionId: DirectionId }
  | { type: "select-reaction"; reaction: AirReaction }
  | { type: "answer-clarifier"; answer: string }
  | { type: "close-clarifier" }
  | { type: "toggle-review" }
  | { type: "show-frame"; frame: StoryboardFrameIndex }
  | { type: "announce"; message: string };

export const INITIAL_AIR_DEMO_STATE: Readonly<AirDemoState> = Object.freeze({
  directionId: "golden-gate",
  reaction: null,
  reviewEligible: false,
  reviewed: false,
  clarifierOpen: false,
  clarifierAnswer: null,
  tasteDirectionId: null,
  activeFrame: 0,
  hasReacted: false,
  announcement: "",
});

function resetForDirection(
  state: AirDemoState,
  directionId: DirectionId,
): AirDemoState {
  const direction = getDirection(directionId);

  return {
    ...state,
    directionId,
    reaction: null,
    reviewEligible: false,
    reviewed: false,
    clarifierOpen: false,
    clarifierAnswer: null,
    tasteDirectionId: null,
    activeFrame: 0,
    announcement: `${direction.cueLabel} preview selected`,
  };
}

function nextDirection(directionId: DirectionId): DirectionId {
  const index = DIRECTION_IDS.indexOf(directionId);
  return DIRECTION_IDS[(index + 1) % DIRECTION_IDS.length] ?? "golden-gate";
}

export function airDemoReducer(
  state: AirDemoState,
  action: AirDemoAction,
): AirDemoState {
  switch (action.type) {
    case "select-direction":
      return resetForDirection(state, action.directionId);

    case "select-reaction": {
      switch (action.reaction) {
        case "👍":
          return {
            ...state,
            reaction: "👍",
            reviewEligible: true,
            clarifierOpen: false,
            hasReacted: true,
            announcement: "This direction is ready to review",
          };

        case "👎": {
          // The thumbs-down belongs to the outgoing visual. The replacement has
          // no selected reaction and none of the outgoing direction's derived state.
          const replacement = resetForDirection(
            { ...state, hasReacted: true, reaction: "👎" },
            nextDirection(state.directionId),
          );
          return { ...replacement, hasReacted: true };
        }

        case "❤️":
          return {
            ...state,
            reaction: "❤️",
            tasteDirectionId: state.directionId,
            reviewEligible: true,
            clarifierOpen: false,
            hasReacted: true,
            announcement: `${getDirection(state.directionId).cueLabel} taste remembered`,
          };

        case "?":
          return {
            ...state,
            reaction: "?",
            clarifierOpen: true,
            hasReacted: true,
            announcement: "Clarifying question opened",
          };

        case "HA HA":
        case "‼️":
          return {
            ...state,
            reaction: action.reaction,
            hasReacted: true,
            announcement: `${action.reaction} reaction added`,
          };
      }
    }

    case "answer-clarifier": {
      const answers = getDirection(state.directionId).clarifyingAnswers;
      if (!answers.includes(action.answer)) return state;
      return {
        ...state,
        clarifierAnswer: action.answer,
        clarifierOpen: false,
        announcement: "Direction note applied to this preview",
      };
    }

    case "close-clarifier":
      if (!state.clarifierOpen) return state;
      return {
        ...state,
        clarifierOpen: false,
        announcement: "Clarifying question closed",
      };

    case "toggle-review":
      if (!state.reviewEligible) return state;
      return {
        ...state,
        reviewed: !state.reviewed,
        announcement: state.reviewed
          ? "Storyboard collapsed"
          : `Storyboard opened. Frame ${state.activeFrame + 1} of 3`,
      };

    case "show-frame":
      if (!state.reviewed || action.frame === state.activeFrame) return state;
      return {
        ...state,
        activeFrame: action.frame,
        announcement: `Frame ${action.frame + 1} of 3`,
      };

    case "announce":
      return { ...state, announcement: action.message };
  }
}
