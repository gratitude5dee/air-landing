"use client";

import {
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import styles from "./GradualBlur.module.css";

type BlurPosition = "top" | "bottom" | "left" | "right";
type BlurCurve = "linear" | "bezier" | "ease-in" | "ease-out";
type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

type GradualBlurProps = {
  position?: BlurPosition;
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  exponential?: boolean;
  curve?: BlurCurve;
  opacity?: number;
  animated?: boolean | "scroll";
  duration?: string;
  easing?: string;
  target?: "parent" | "page";
  zIndex?: number;
  className?: string;
};

const curves: Record<BlurCurve, (value: number) => number> = {
  linear: (value) => value,
  bezier: (value) => value * value * (3 - 2 * value),
  "ease-in": (value) => value * value,
  "ease-out": (value) => 1 - Math.pow(1 - value, 2),
};

const directionFor = (position: BlurPosition) =>
  ({ top: "to top", bottom: "to bottom", left: "to left", right: "to right" })[position];

/** A lightweight page-edge adaptation of the React Bits GradualBlur effect. */
export function GradualBlur({
  position = "bottom",
  strength = 1,
  height = "5rem",
  width,
  divCount = 5,
  exponential = true,
  curve = "bezier",
  opacity = 1,
  animated = "scroll",
  duration = "280ms",
  easing = "ease-out",
  target = "parent",
  zIndex = 60,
  className = "",
}: GradualBlurProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;
    let frame = 0;

    const update = () => {
      frame = 0;
      setEnabled(!reducedMotion.matches && !forcedColors.matches && !connection?.saveData);
      setScrolled(window.scrollY > 18);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    reducedMotion.addEventListener("change", schedule);
    forcedColors.addEventListener("change", schedule);
    connection?.addEventListener?.("change", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      reducedMotion.removeEventListener("change", schedule);
      forcedColors.removeEventListener("change", schedule);
      connection?.removeEventListener?.("change", schedule);
    };
  }, []);

  const layers = useMemo(() => {
    const count = Math.max(1, Math.min(10, divCount));
    const transform = curves[curve];
    const direction = directionFor(position);

    return Array.from({ length: count }, (_, index) => {
      const progress = transform((index + 1) / count);
      const blur = exponential
        ? Math.pow(2, progress * 3.1) * 0.045 * strength
        : 0.0625 * (progress * count + 1) * strength;
      const start = Math.round((index / count) * 1000) / 10;
      const middle = Math.round(((index + 0.72) / count) * 1000) / 10;
      const end = Math.min(100, Math.round(((index + 1.7) / count) * 1000) / 10);

      return (
        <span
          key={index}
          className={styles.layer}
          style={{
            maskImage: `linear-gradient(${direction}, transparent ${start}%, black ${middle}%, transparent ${end}%)`,
            WebkitMaskImage: `linear-gradient(${direction}, transparent ${start}%, black ${middle}%, transparent ${end}%)`,
            backdropFilter: `blur(${blur.toFixed(3)}rem) saturate(112%)`,
            WebkitBackdropFilter: `blur(${blur.toFixed(3)}rem) saturate(112%)`,
            opacity,
          }}
        />
      );
    });
  }, [curve, divCount, exponential, opacity, position, strength]);

  const isVertical = position === "top" || position === "bottom";
  const visible = enabled && (animated !== "scroll" || scrolled);
  const style = {
    height: isVertical ? height : "100%",
    width: isVertical ? width ?? "100%" : width ?? height,
    [position]: 0,
    zIndex,
    opacity: visible ? 1 : 0,
    transition: `opacity ${duration} ${easing}`,
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={[
        styles.root,
        target === "page" ? styles.page : styles.parent,
        className,
      ].filter(Boolean).join(" ")}
      style={style}
    >
      {layers}
    </div>
  );
}
