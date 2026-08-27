"use client";

import {
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./PixelCard.module.css";

type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

type PixelCardProps = {
  children: ReactNode;
  className?: string;
  colors?: string[];
  gap?: number;
  noFocus?: boolean;
  style?: CSSProperties;
};

/**
 * An Air-tuned implementation of the React Bits PixelCard idea. It paints a
 * short, pointer-triggered pixel bloom instead of keeping a permanent render
 * loop alive, so the visual stays lively without taxing the landing page.
 */
export function PixelCard({
  children,
  className = "",
  colors = ["#dff8ff", "#77d6f6", "#2fa7cb", "#9ef3df"],
  gap = 7,
  noFocus = false,
  style,
}: PixelCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (context && canvas) context.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const cancel = useCallback(() => {
    if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const resize = useCallback(() => {
    const card = cardRef.current;
    const canvas = canvasRef.current;
    if (!card || !canvas) return;
    const bounds = card.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(bounds.width * scale));
    canvas.height = Math.max(1, Math.round(bounds.height * scale));
    canvas.style.width = `${bounds.width}px`;
    canvas.style.height = `${bounds.height}px`;
    const context = canvas.getContext("2d");
    context?.setTransform(scale, 0, 0, scale, 0, 0);
    clear();
  }, [clear]);

  const bloom = useCallback(() => {
    if (!enabled) return;
    cancel();
    setActive(true);
    const startedAt = performance.now();
    const duration = 820;

    const paint = (now: number) => {
      const canvas = canvasRef.current;
      const card = cardRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !card || !context) return;

      const bounds = card.getBoundingClientRect();
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      context.clearRect(0, 0, bounds.width, bounds.height);

      const diagonal = Math.hypot(bounds.width, bounds.height);
      for (let x = 0; x < bounds.width; x += gap) {
        for (let y = 0; y < bounds.height; y += gap) {
          const distance = Math.hypot(x - bounds.width * 0.64, y - bounds.height * 0.36);
          const threshold = Math.min(1, distance / diagonal + 0.08);
          if (eased < threshold) continue;
          const seed = (Math.floor(x / gap) * 13 + Math.floor(y / gap) * 19) % colors.length;
          const alpha = Math.max(0, Math.min(0.54, (eased - threshold) * 1.8));
          context.globalAlpha = alpha;
          context.fillStyle = colors[seed];
          context.fillRect(x, y, 1.25, 1.25);
        }
      }
      context.globalAlpha = 1;

      if (progress < 1) frameRef.current = window.requestAnimationFrame(paint);
      else frameRef.current = null;
    };

    frameRef.current = window.requestAnimationFrame(paint);
  }, [cancel, colors, enabled, gap]);

  const settle = useCallback(() => {
    cancel();
    setActive(false);
    clear();
  }, [cancel, clear]);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;
    const update = () => setEnabled(finePointer.matches && !reducedMotion.matches && !forcedColors.matches && !connection?.saveData);
    update();
    [finePointer, reducedMotion, forcedColors].forEach((query) => query.addEventListener("change", update));
    connection?.addEventListener?.("change", update);
    return () => {
      [finePointer, reducedMotion, forcedColors].forEach((query) => query.removeEventListener("change", update));
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    resize();
    const observer = new ResizeObserver(resize);
    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      observer.disconnect();
      cancel();
    };
  }, [cancel, resize]);

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (!noFocus && !event.currentTarget.contains(event.relatedTarget)) bloom();
  };

  return (
    <div
      ref={cardRef}
      className={[styles.card, active && styles.active, className].filter(Boolean).join(" ")}
      style={style}
      tabIndex={noFocus ? undefined : 0}
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
        // Some desktop browser implementations report an empty pointerType
        // for a synthetic hover. Touch never emits a hover enter here, and
        // the eligibility gate above still excludes touch-first devices.
        if (event.pointerType !== "touch") bloom();
      }}
      onPointerLeave={settle}
      onFocus={handleFocus}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) settle();
      }}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
