"use client";

import { createElement } from "react";
import {
  LuChevronLeft,
  LuChevronRight,
  LuCircleEllipsis,
  LuSparkles,
} from "react-icons/lu";

import { useAirExperience } from "@/components/AirExperience";
import { FIRST_VISUAL_RESPONSE } from "@/content/directions";
import type {
  AirReaction,
  StoryboardFrameIndex,
} from "@/components/air-demo-state";

const TAPBACKS: readonly {
  reaction: AirReaction;
  label: string;
}[] = [
  { reaction: "❤️", label: "Heart — remember this feel" },
  { reaction: "👍", label: "Thumbs up — approve this direction" },
  { reaction: "👎", label: "Thumbs down — show another" },
  { reaction: "HA HA", label: "Laugh — react only" },
  { reaction: "‼️", label: "Emphasis — react only" },
  { reaction: "?", label: "Question — clarify" },
];

const touchTarget = { minWidth: 44, minHeight: 44 } as const;

export function IMessageDemo() {
  const { state, selectedDirection, dispatch } = useAirExperience();
  const frameIndex: StoryboardFrameIndex = state.reviewed
    ? state.activeFrame
    : 0;
  const frame = selectedDirection.frames[frameIndex];
  const tasteRemembered =
    state.tasteDirectionId !== null && state.reaction !== "❤️";

  const fallbackImage = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.hidden = true;
    const fallback = event.currentTarget.nextElementSibling;
    if (fallback instanceof HTMLElement) fallback.hidden = false;
  };

  return (
    <div className="iphone-shell">
      <div className="iphone-screen">
        <div className="dynamic-island" aria-hidden />
        <div className="ios-status">
          <span>9:41</span>
          <span aria-hidden>● ●● ᯤ ▰</span>
        </div>

        <div className="thread-head">
          <span className="thread-back" aria-hidden>‹</span>
          <span className="thread-avatar" aria-hidden>
            {createElement("dk-avatar", {
              className: "thread-avatar-dither",
              name: "air-wzrd",
              from: "cyan",
              cells: "5",
              bloom: "low",
            })}
            <span className="thread-avatar-letter">A</span>
          </span>
          <span>
            air by WZRD.tech <small aria-hidden>›</small>
          </span>
        </div>

        <div className="thread-body">
          <p className="thread-time">Today 9:41</p>

          <div className="phone-message-row you">
            <p className="phone-bubble">{selectedDirection.request}</p>
          </div>

          <div className="phone-message-row air tapback-open">
            <p className="phone-bubble">{FIRST_VISUAL_RESPONSE}</p>
            <div
              className="tapback-menu"
              role="toolbar"
              aria-label="Direct Air with a Tapback"
            >
              {TAPBACKS.map(({ reaction, label }) => (
                <button
                  key={reaction}
                  type="button"
                  title={label}
                  aria-label={label}
                  aria-pressed={state.reaction === reaction}
                  style={touchTarget}
                  onClick={() =>
                    dispatch({ type: "select-reaction", reaction })
                  }
                >
                  {reaction}
                </button>
              ))}
            </div>
            {state.reaction && (
              <span
                className="reaction-badge"
                aria-label={`Selected reaction: ${state.reaction}`}
              >
                {state.reaction}
              </span>
            )}
          </div>

          <p className="tapback-helper">
            {!state.hasReacted
              ? "Tapback to direct Air"
              : tasteRemembered
                ? "Taste remembered"
                : state.reviewEligible
                  ? "Ready for your review"
                  : "Tapback applied"}
          </p>

          {state.clarifierOpen && (
            <div
              className="air-clarifier"
              role="group"
              aria-labelledby="air-clarifier-question"
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.preventDefault();
                  dispatch({ type: "close-clarifier" });
                }
              }}
            >
              <p id="air-clarifier-question">
                {selectedDirection.clarifyingQuestion}
              </p>
              <div className="air-clarifier-answers">
                {selectedDirection.clarifyingAnswers.map((answer) => (
                  <button
                    key={answer}
                    type="button"
                    aria-pressed={state.clarifierAnswer === answer}
                    style={{ minHeight: 44 }}
                    onClick={() =>
                      dispatch({ type: "answer-clarifier", answer })
                    }
                  >
                    {answer}
                  </button>
                ))}
              </div>
            </div>
          )}

          <article
            className={`mini-app air-visual-card${state.reviewed ? " is-storyboard" : ""}`}
            aria-label={
              state.reviewed
                ? `${selectedDirection.cueLabel} storyboard`
                : `${selectedDirection.cueLabel} first visual`
            }
          >
            <div className="mini-app-head">
              <span className="air-orb"><LuSparkles aria-hidden /></span>
              <div>
                <strong>
                  {state.reviewed
                    ? "Storyboard · Private beta preview"
                    : "First visual · Ready"}
                </strong>
                <small>{selectedDirection.cueLabel}</small>
              </div>
              <LuCircleEllipsis aria-hidden />
            </div>

            <figure className="air-storyboard-frame" style={{ margin: "0.6rem 0" }}>
              <div
                className="air-storyboard-media"
                style={{ position: "relative", aspectRatio: "16 / 9" }}
              >
                <img
                  key={frame.src}
                  src={frame.src}
                  alt={frame.alt}
                  width={frame.width}
                  height={frame.height}
                  loading={
                    selectedDirection.id === "golden-gate" && frameIndex === 0
                      ? "eager"
                      : "lazy"
                  }
                  fetchPriority={
                    selectedDirection.id === "golden-gate" && frameIndex === 0
                      ? "high"
                      : "auto"
                  }
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: selectedDirection.objectPosition,
                    borderRadius: "0.7rem",
                  }}
                  onError={fallbackImage}
                />
                <span
                  className="air-visual-fallback"
                  hidden
                  style={{
                    display: "grid",
                    width: "100%",
                    height: "100%",
                    placeItems: "center",
                  }}
                >
                  First visual unavailable
                </span>
              </div>
              <figcaption>{frame.note}</figcaption>
            </figure>

            {state.clarifierAnswer && (
              <div className="direction-note" aria-label="Applied direction note">
                <strong>{state.clarifierAnswer}</strong>
                <span>Direction note applied to this preview</span>
              </div>
            )}

            {state.reviewed && (
              <div className="storyboard-controls">
                <ol className="storyboard-position" aria-label="Storyboard frames">
                  {selectedDirection.frames.map((storyboardFrame, index) => (
                    <li
                      key={storyboardFrame.shot}
                      aria-current={index === frameIndex ? "step" : undefined}
                    >
                      {storyboardFrame.shot}
                    </li>
                  ))}
                </ol>
                <p aria-current="step">Frame {frameIndex + 1} of 3</p>
                <div className="storyboard-navigation">
                  <button
                    type="button"
                    aria-label="Previous storyboard frame"
                    style={touchTarget}
                    disabled={frameIndex === 0}
                    onClick={() =>
                      dispatch({
                        type: "show-frame",
                        frame: (frameIndex - 1) as StoryboardFrameIndex,
                      })
                    }
                  >
                    <LuChevronLeft aria-hidden /> Prev
                  </button>
                  <button
                    type="button"
                    aria-label="Next storyboard frame"
                    style={touchTarget}
                    disabled={frameIndex === 2}
                    onClick={() =>
                      dispatch({
                        type: "show-frame",
                        frame: (frameIndex + 1) as StoryboardFrameIndex,
                      })
                    }
                  >
                    Next <LuChevronRight aria-hidden />
                  </button>
                </div>
              </div>
            )}

            {state.reviewEligible && (
              <button
                type="button"
                className={`mini-review${state.reviewed ? " is-reviewed" : ""}`}
                aria-pressed={state.reviewed}
                style={{ minHeight: 44 }}
                onClick={() => dispatch({ type: "toggle-review" })}
              >
                {state.reviewed
                  ? "First visual approved"
                  : "Review first visual"}
              </button>
            )}
          </article>
        </div>

        <div className="message-composer" aria-hidden>
          <span>＋</span><div>iMessage</div><span>◉</span>
        </div>
        <div className="home-indicator" aria-hidden />
      </div>
    </div>
  );
}
