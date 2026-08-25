"use client";

import Image from "next/image";
import { useDrag } from "@use-gesture/react";
import { type CSSProperties, type KeyboardEvent, useEffect, useMemo, useRef } from "react";
import { LuBot, LuChevronLeft, LuChevronRight, LuMaximize2, LuRefreshCcw, LuSparkles } from "react-icons/lu";
import { SiHermes, SiOpencode } from "react-icons/si";

import { MiniAppArtIcon } from "@/components/MiniAppArtIcon";
import type { MiniAppDomeItem } from "@/lib/mini-apps";

import styles from "./MiniAppGallery.module.css";

type MiniAppDomeProps = {
  activeIndex: number;
  items: readonly MiniAppDomeItem[];
  onOpen: (index: number, trigger: HTMLElement) => void;
  onSelect: (index: number) => void;
};

const DOME_SLOTS = 48;
const INERTIA_DURATION = 700;
const PITCH_MIN = -30;
const PITCH_MAX = 24;

type DomeRotation = { pitch: number; yaw: number };

// These local marks match the agent names used in Air's iMessage control
// plane. They are visual routing concepts rather than connection status.
const AGENT_FIELD = [
  { id: "openclaw", name: "OpenClaw", mark: "OC", Icon: LuBot },
  { id: "hermes", name: "Hermes", mark: "H", Icon: SiHermes },
  { id: "pi", name: "Pi", mark: "π", Icon: LuSparkles },
  { id: "opencode", name: "OpenCode", mark: "</>", Icon: SiOpencode },
] as const;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function AgentDomeMark({ agent }: { agent: (typeof AGENT_FIELD)[number] }) {
  const Icon = agent.Icon;
  return (
    <span className={styles.domeAgentMark} data-agent={agent.id}>
      {agent.id === "openclaw" ? (
        <Image
          src="/images/agents/v2026-08-25-a/openclaw-pixel-lobster.svg"
          alt=""
          width={40}
          height={40}
          aria-hidden="true"
        />
      ) : <Icon aria-hidden="true" />}
      <b>{agent.mark}</b>
    </span>
  );
}

export default function MiniAppDome({ activeIndex, items, onOpen, onSelect }: MiniAppDomeProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inertiaFrameRef = useRef(0);
  const rotationRef = useRef<DomeRotation>({ pitch: -8, yaw: activeIndex * -30 });

  const slots = useMemo(
    () => Array.from({ length: DOME_SLOTS }, (_, index) => ({
      appIndex: index % items.length,
      latitude: Math.floor(index / 12),
      longitude: index % 12,
    })),
    [items.length],
  );

  const applyRotation = ({ pitch, yaw }: DomeRotation) => {
    const next = { pitch: clamp(pitch, PITCH_MIN, PITCH_MAX), yaw };
    rotationRef.current = next;
    stageRef.current?.style.setProperty("--dome-pitch", `${next.pitch}deg`);
    stageRef.current?.style.setProperty("--dome-yaw", `${next.yaw}deg`);
  };

  const stopInertia = () => {
    if (inertiaFrameRef.current) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = 0;
    }
    stageRef.current?.classList.remove(styles.isMoving);
  };

  const beginInertia = (velocityX: number, velocityY: number) => {
    stopInertia();
    if (Math.max(Math.abs(velocityX), Math.abs(velocityY)) < 0.05) return;

    const startedAt = window.performance.now();
    const yawVelocity = clamp(velocityX, -1.3, 1.3) * 15;
    const pitchVelocity = clamp(velocityY, -1.15, 1.15) * -11;
    stageRef.current?.classList.add(styles.isMoving);

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const remaining = Math.max(0, 1 - elapsed / INERTIA_DURATION);
      applyRotation({
        yaw: rotationRef.current.yaw + yawVelocity * remaining,
        pitch: rotationRef.current.pitch + pitchVelocity * remaining,
      });
      if (remaining > 0 && !document.hidden) {
        inertiaFrameRef.current = window.requestAnimationFrame(step);
        return;
      }
      stopInertia();
    };

    inertiaFrameRef.current = window.requestAnimationFrame(step);
  };

  const bindDrag = useDrag(
    ({ active, first, memo, movement: [movementX, movementY], velocity: [velocityX, velocityY], last, tap }) => {
      const start = first || !memo ? { ...rotationRef.current } : memo as DomeRotation;
      if (active) {
        stopInertia();
        applyRotation({
          yaw: start.yaw + movementX * 0.34,
          pitch: start.pitch - movementY * 0.22,
        });
      }
      if (last) {
        if (!tap) beginInertia(velocityX, velocityY);
        applyRotation(rotationRef.current);
      }
      return start;
    },
    {
      filterTaps: true,
      threshold: 6,
      tapsThreshold: 5,
      pointer: { keys: false },
    },
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) stopInertia();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopInertia();
    };
  }, []);

  useEffect(() => {
    stopInertia();
    applyRotation({ ...rotationRef.current, yaw: activeIndex * -30 });
  }, [activeIndex]);

  const select = (index: number) => {
    stopInertia();
    onSelect(wrapIndex(index, items.length));
  };

  const onActiveKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      select(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      select(activeIndex + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      stopInertia();
      applyRotation({ ...rotationRef.current, pitch: rotationRef.current.pitch + 8 });
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      stopInertia();
      applyRotation({ ...rotationRef.current, pitch: rotationRef.current.pitch - 8 });
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(items.length - 1);
    }
  };

  const activeApp = items[activeIndex];
  const activeAgent = AGENT_FIELD[activeIndex % AGENT_FIELD.length];
  const resetField = () => {
    stopInertia();
    applyRotation({ pitch: -8, yaw: activeIndex * -30 });
  };

  return (
    <div className={styles.domeShell} role="group" aria-roledescription="carousel" aria-label="Air Mini App gallery with agent field">
      <div
        ref={stageRef}
        className={styles.domeStage}
        aria-hidden="true"
        {...bindDrag()}
      >
        <div className={styles.domeTelemetry} aria-hidden="true">
          <span><i /> Air agent field</span>
          <span>{AGENT_FIELD.length} routed agents</span>
        </div>
        <div className={styles.domeLatitude} aria-hidden="true" />
        <div className={styles.domeLongitude} aria-hidden="true" />
        <div className={styles.domeGlow} />
        <div className={styles.domeReadout} aria-hidden="true">
          <span className={styles.domeReadoutIcon}><AgentDomeMark agent={activeAgent} /></span>
          <span><small>Agent orbit</small>{activeAgent.name}</span>
        </div>
        <div className={styles.domeSphere}>
          {slots.map(({ appIndex, latitude, longitude }, index) => {
            const app = items[appIndex];
            const agent = AGENT_FIELD[appIndex % AGENT_FIELD.length];
            const style = {
              "--dome-latitude": `${latitude * 33 - 49.5}deg`,
              "--dome-longitude": `${longitude * 30}deg`,
              "--dome-depth": `calc(var(--dome-radius) - ${Math.abs(latitude - 1.5) * 2.15}rem)`,
            } as CSSProperties;
            return (
              <span
                className={`${styles.domeTile} ${appIndex % AGENT_FIELD.length === activeIndex % AGENT_FIELD.length ? styles.domeTileActive : ""}`}
                key={`${app.id}-${index}`}
                style={style}
                onClick={() => select(appIndex)}
              >
                <AgentDomeMark agent={agent} />
              </span>
            );
          })}
        </div>
      </div>

      <div className={styles.domeControls}>
        <button type="button" className={styles.domeArrow} onClick={() => select(activeIndex - 1)} aria-label="Previous Mini App">
          <LuChevronLeft aria-hidden />
        </button>
        <button
          type="button"
          className={styles.domeActiveButton}
          onKeyDown={onActiveKeyDown}
          onClick={(event) => {
            onOpen(activeIndex, event.currentTarget);
          }}
          aria-label={`Open ${activeApp.name}, ${activeIndex + 1} of ${items.length}`}
        >
          <span className={styles.domeActiveIcon}><MiniAppArtIcon iconKey={activeApp.iconKey} /></span>
          <span><small>Open Mini App</small>{activeApp.name}</span>
          <LuMaximize2 aria-hidden />
        </button>
        <button type="button" className={styles.domeArrow} onClick={() => select(activeIndex + 1)} aria-label="Next Mini App">
          <LuChevronRight aria-hidden />
        </button>
      </div>
      <div className={styles.domeFieldFooter}>
        <p>Drag in any direction to rotate the agent field. Use Up/Down on the active Mini App to tilt the view.</p>
        <button type="button" onClick={resetField}><LuRefreshCcw aria-hidden /> Reset field</button>
      </div>
    </div>
  );
}
