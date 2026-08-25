"use client";

import { useDrag } from "@use-gesture/react";
import { type CSSProperties, type KeyboardEvent, useEffect, useMemo, useRef } from "react";
import { LuChevronLeft, LuChevronRight, LuMaximize2 } from "react-icons/lu";

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
const INERTIA_DURATION = 600;

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export default function MiniAppDome({ activeIndex, items, onOpen, onSelect }: MiniAppDomeProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inertiaFrameRef = useRef(0);
  const angleRef = useRef(activeIndex * -30);

  const slots = useMemo(
    () => Array.from({ length: DOME_SLOTS }, (_, index) => ({
      appIndex: index % items.length,
      latitude: Math.floor(index / 12),
      longitude: index % 12,
    })),
    [items.length],
  );

  const applyAngle = (angle: number) => {
    angleRef.current = angle;
    stageRef.current?.style.setProperty("--dome-rotation", `${angle}deg`);
  };

  const stopInertia = () => {
    if (inertiaFrameRef.current) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = 0;
    }
    stageRef.current?.classList.remove(styles.isMoving);
  };

  const beginInertia = (velocity: number) => {
    stopInertia();
    if (Math.abs(velocity) < 0.05) return;

    const startedAt = window.performance.now();
    const initialVelocity = Math.max(-1.3, Math.min(1.3, velocity)) * 15;
    stageRef.current?.classList.add(styles.isMoving);

    const step = (now: number) => {
      const elapsed = now - startedAt;
      const remaining = Math.max(0, 1 - elapsed / INERTIA_DURATION);
      applyAngle(angleRef.current + initialVelocity * remaining);
      if (remaining > 0 && !document.hidden) {
        inertiaFrameRef.current = window.requestAnimationFrame(step);
        return;
      }
      stopInertia();
    };

    inertiaFrameRef.current = window.requestAnimationFrame(step);
  };

  const bindDrag = useDrag(
    ({ active, movement: [movementX], velocity: [velocityX], last, tap }) => {
      if (active) {
        stopInertia();
        applyAngle(activeIndex * -30 + movementX * 0.34);
      }
      if (last) {
        if (!tap) beginInertia(velocityX);
        applyAngle(angleRef.current);
      }
    },
    {
      axis: "x",
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
    applyAngle(activeIndex * -30);
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
    } else if (event.key === "Home") {
      event.preventDefault();
      select(0);
    } else if (event.key === "End") {
      event.preventDefault();
      select(items.length - 1);
    }
  };

  const activeApp = items[activeIndex];

  return (
    <div className={styles.domeShell} role="group" aria-roledescription="carousel" aria-label="Air Mini App gallery">
      <div
        ref={stageRef}
        className={styles.domeStage}
        aria-hidden="true"
        {...bindDrag()}
      >
        <div className={styles.domeTelemetry} aria-hidden="true">
          <span><i /> Air app field</span>
          <span>{items.length} first-party apps</span>
        </div>
        <div className={styles.domeLatitude} aria-hidden="true" />
        <div className={styles.domeLongitude} aria-hidden="true" />
        <div className={styles.domeGlow} />
        <div className={styles.domeReadout} aria-hidden="true">
          <span className={styles.domeReadoutIcon}><MiniAppArtIcon iconKey={activeApp.iconKey} /></span>
          <span><small>Now orbiting</small>{activeApp.name}</span>
        </div>
        <div className={styles.domeSphere}>
          {slots.map(({ appIndex, latitude, longitude }, index) => {
            const app = items[appIndex];
            const style = {
              "--dome-latitude": `${latitude * 33 - 49.5}deg`,
              "--dome-longitude": `${longitude * 30}deg`,
              "--dome-depth": `${14.2 - Math.abs(latitude - 1.5) * 1.15}rem`,
            } as CSSProperties;
            return (
              <span
                className={`${styles.domeTile} ${appIndex === activeIndex ? styles.domeTileActive : ""}`}
                key={`${app.id}-${index}`}
                style={style}
                onClick={() => select(appIndex)}
              >
                <MiniAppArtIcon iconKey={app.iconKey} />
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
    </div>
  );
}
