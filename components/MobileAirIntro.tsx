"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuArrowUp, LuX } from "react-icons/lu";

import styles from "./MobileAirIntro.module.css";

const INTRO_KEY = "air-cinematic-intro-seen";
type Particle = { x: number; y: number; tx: number; ty: number; seed: number };

function buildParticles(width: number, height: number) {
  const sample = document.createElement("canvas");
  sample.width = Math.max(1, Math.floor(width));
  sample.height = Math.max(1, Math.floor(height));
  const context = sample.getContext("2d", { willReadFrequently: true });
  if (!context) return [] as Particle[];
  const fontSize = Math.min(width * 0.36, height * 0.22);
  context.fillStyle = "#000";
  context.font = `800 ${fontSize}px Inter, sans-serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("AIR", width / 2, height * 0.43);
  const pixels = context.getImageData(0, 0, sample.width, sample.height).data;
  const stride = Math.max(5, Math.round(fontSize / 23));
  const targets: Array<{ x: number; y: number }> = [];
  for (let y = 0; y < sample.height; y += stride) for (let x = 0; x < sample.width; x += stride) {
    if (pixels[(y * sample.width + x) * 4 + 3] > 20) targets.push({ x, y });
  }
  const cap = width < 700 ? 420 : 880;
  return targets.filter((_, index) => index % Math.max(1, Math.ceil(targets.length / cap)) === 0).map((target, index) => {
    const angle = index * 2.3999632297;
    const radius = Math.max(width, height) * (0.16 + ((index * 19) % 101) / 210);
    return { x: width / 2 + Math.cos(angle) * radius, y: height * 0.38 + Math.sin(angle) * radius * 0.58, tx: target.x, ty: target.y, seed: index * 0.173 };
  });
}

export function MobileAirIntro() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [active, setActive] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [returning, setReturning] = useState(false);
  const finish = useCallback(() => {
    if (exiting) return;
    sessionStorage.setItem(INTRO_KEY, "true");
    window.dispatchEvent(new Event("air:intro-complete"));
    setExiting(true);
    closeTimer.current = setTimeout(() => setActive(false), 560);
  }, [exiting]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(INTRO_KEY) === "true";
    setReturning(seen);
    const timer = setTimeout(finish, reduced ? 180 : seen ? 680 : 3300);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    window.addEventListener("keydown", onKeyDown);
    return () => { clearTimeout(timer); if (closeTimer.current) clearTimeout(closeTimer.current); window.removeEventListener("keydown", onKeyDown); };
    // The first render's callback is intentionally retained so the exit timer is
    // not cancelled when `exiting` flips true during the fade-out.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let particles: Particle[] = [];
    let frame = 0;
    let lastPaint = 0;
    let startedAt: number | null = null;
    let width = 1;
    let height = 1;
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, rect.width < 700 ? 1.5 : 2);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = buildParticles(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const paint = (now: number) => {
      if (document.hidden || now - lastPaint < 1000 / 30) { frame = requestAnimationFrame(paint); return; }
      lastPaint = now;
      startedAt ??= now;
      const elapsed = Math.min(1, (now - startedAt) / 3300);
      const settle = reduced || saveData ? 1 : Math.max(0, Math.min(1, (elapsed - 0.18) / 0.56));
      const wave = reduced || saveData ? 0 : Math.max(0, Math.min(1, (elapsed - 0.72) / 0.28));
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "screen";
      particles.forEach((particle, index) => {
        const swirl = (1 - settle) * (1 + Math.sin(now * 0.0018 + particle.seed) * 0.18);
        const x = particle.tx * settle + particle.x * swirl;
        const y = particle.ty * settle + particle.y * swirl + Math.sin(particle.tx * 0.07 + wave * 11) * wave * 7;
        context.fillStyle = `rgba(255,255,255,${0.13 + settle * 0.72})`;
        context.fillRect(x - (index % 4 === 0 ? 1.4 : 0.8), y - 0.8, index % 4 === 0 ? 2.8 : 1.6, 1.6);
      });
      context.globalCompositeOperation = "source-over";
      frame = requestAnimationFrame(paint);
    };
    frame = requestAnimationFrame(paint);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [active]);

  if (!active) return null;
  return <section className={styles.intro} data-exiting={exiting} data-returning={returning} aria-label="Air cinematic introduction">
    <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
    <div className={styles.grid} aria-hidden="true" />
    <p className={styles.meta}>AIR / WZRD.TECH <span>PRIVATE BETA</span></p>
    <button className={styles.skip} type="button" onClick={finish}>Skip <LuX aria-hidden="true" /></button>
    <div className={styles.artifacts} aria-hidden="true"><i /><i /><i /><i /><i /></div>
    <div className={styles.copy}><p>Air assembles around the work.</p><span>Context, apps, and the next move—already in reach.</span></div>
    <button className={styles.enter} type="button" onClick={finish}>Enter Air <LuArrowUp aria-hidden="true" /></button>
  </section>;
}
