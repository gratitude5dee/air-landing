"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { LuArrowUpRight } from "react-icons/lu";

import styles from "./PlasmaButton.module.css";

type PlasmaButtonProps = {
  className?: string;
  href: string;
  label?: string;
};

type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

/**
 * A deliberately small, canvas-rendered plasma field. It takes the kinetic
 * feeling of the ThreeUI reference while keeping the CTA a normal, reliable
 * link for keyboards, no-JS, Save Data, and reduced-motion visitors.
 */
export function PlasmaButton({
  className = "",
  href,
  label = "Try Air Today",
}: PlasmaButtonProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;
    const update = () => {
      setMotionAllowed(!reducedMotion.matches && !forcedColors.matches && !connection?.saveData);
    };

    update();
    reducedMotion.addEventListener("change", update);
    forcedColors.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      forcedColors.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const link = linkRef.current;
    if (!canvas || !link) return;

    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    let inView = true;
    let active = true;
    let width = 0;
    let height = 0;
    const scratch = document.createElement("canvas");
    const scratchContext = scratch.getContext("2d", { alpha: false });

    const render = (time = 0) => {
      const bounds = link.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      if (width !== nextWidth || height !== nextHeight) {
        width = nextWidth;
        height = nextHeight;
        canvas.width = width;
        canvas.height = height;
      }

      // A low-resolution field is intentionally scaled up. The resulting
      // soft cells make the surface feel tactile without an expensive WebGL loop.
      const columns = Math.max(30, Math.min(88, Math.round(width / 5)));
      const rows = Math.max(8, Math.min(24, Math.round(height / 4)));
      if (scratch.width !== columns || scratch.height !== rows) {
        scratch.width = columns;
        scratch.height = rows;
      }
      const field = context.createImageData(columns, rows);
      const phase = time * 0.001;
      for (let y = 0; y < rows; y += 1) {
        for (let x = 0; x < columns; x += 1) {
          const index = (y * columns + x) * 4;
          const wave =
            Math.sin(x * 0.19 + phase * 1.25) +
            Math.sin(y * 0.31 - phase * 1.05) +
            Math.sin((x + y) * 0.13 + phase * 0.7);
          const energy = Math.max(0, Math.min(1, (wave + 3) / 6));
          field.data[index] = Math.round(5 + energy * 18);
          field.data[index + 1] = Math.round(40 + energy * 112);
          field.data[index + 2] = Math.round(105 + energy * 132);
          field.data[index + 3] = 255;
        }
      }
      scratchContext?.putImageData(field, 0, 0);
      context.imageSmoothingEnabled = true;
      context.clearRect(0, 0, width, height);
      context.drawImage(scratch, 0, 0, width, height);
      const glow = context.createRadialGradient(width * 0.28, height * 0.15, 0, width * 0.48, height * 0.5, width * 0.74);
      glow.addColorStop(0, "rgba(161, 251, 255, 0.48)");
      glow.addColorStop(0.4, "rgba(69, 178, 255, 0.2)");
      glow.addColorStop(1, "rgba(0, 26, 83, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    };

    const tick = (time: number) => {
      render(time);
      if (active && inView && motionAllowed && !document.hidden) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry?.isIntersecting ?? true;
        if (inView && active && motionAllowed && !document.hidden && frameRef.current === null) {
          frameRef.current = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "120px" },
    );
    const resizeObserver = new ResizeObserver(() => render(0));
    const onVisibilityChange = () => {
      if (document.hidden) {
        if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      } else if (active && inView && motionAllowed && frameRef.current === null) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    observer.observe(link);
    resizeObserver.observe(link);
    document.addEventListener("visibilitychange", onVisibilityChange);
    render(0);
    if (motionAllowed) frameRef.current = requestAnimationFrame(tick);

    return () => {
      active = false;
      observer.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    };
  }, [motionAllowed]);

  return (
    <a
      ref={linkRef}
      className={[styles.button, className].filter(Boolean).join(" ")}
      href={href}
    >
      <canvas ref={canvasRef} className={styles.plasma} aria-hidden="true" />
      <span className={styles.surface} aria-hidden="true" />
      <span className={styles.label}>{label}</span>
      <LuArrowUpRight aria-hidden="true" />
    </a>
  );
}
