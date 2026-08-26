"use client";

import { gsap } from "gsap";
import {
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

import styles from "./ChromaGrid.module.css";

type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

type ChromaGridProps = {
  children: ReactNode;
  className?: string;
  radius?: number;
  damping?: number;
  fadeOut?: number;
};

/**
 * Air's adaptation of the ChromaGrid treatment: a single, restrained light
 * field follows a precise pointer across a group of product surfaces. It is
 * intentionally off for touch, reduced-motion, forced-colors, and Save Data
 * environments; card content is complete without the enhancement.
 */
export function ChromaGrid({
  children,
  className = "",
  radius = 360,
  damping = 0.34,
  fadeOut = 0.42,
}: ChromaGridProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;

    const update = () => {
      const eligible =
        finePointer.matches &&
        !reducedMotion.matches &&
        !forcedColors.matches &&
        !connection?.saveData;

      setEnabled(eligible);
      const grid = gridRef.current;
      if (!grid || eligible) return;
      gsap.set(grid, { "--chroma-opacity": 0, "--chroma-x": "50%", "--chroma-y": "50%" });
    };

    update();
    [finePointer, reducedMotion, forcedColors].forEach((query) => query.addEventListener("change", update));
    connection?.addEventListener?.("change", update);

    return () => {
      [finePointer, reducedMotion, forcedColors].forEach((query) => query.removeEventListener("change", update));
      connection?.removeEventListener?.("change", update);
      if (gridRef.current) gsap.killTweensOf(gridRef.current);
    };
  }, []);

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled || event.pointerType === "touch" || !gridRef.current) return;
    const bounds = gridRef.current.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 100;
    const y = ((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 100;
    const duration = Math.max(0.12, damping);

    gsap.to(gridRef.current, {
      "--chroma-x": `${Math.min(100, Math.max(0, x))}%`,
      "--chroma-y": `${Math.min(100, Math.max(0, y))}%`,
      "--chroma-opacity": 1,
      duration,
      ease: "power3.out",
      overwrite: true,
    });
  };

  const leave = () => {
    if (!enabled || !gridRef.current) return;
    gsap.to(gridRef.current, {
      "--chroma-opacity": 0,
      duration: Math.max(0.18, fadeOut),
      ease: "power2.out",
      overwrite: true,
    });
  };

  return (
    <div
      ref={gridRef}
      className={[styles.grid, className].filter(Boolean).join(" ")}
      style={{ "--chroma-radius": `${radius}px` } as CSSProperties}
      data-chroma-enabled={enabled ? "true" : "false"}
      onPointerMove={move}
      onPointerLeave={leave}
    >
      {children}
    </div>
  );
}
