"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuX } from "react-icons/lu";

import styles from "./MobileAirIntro.module.css";

const INTRO_KEY = "air-cinematic-intro-h3-seen";
const VIDEO_SRC = "/media/air/v2026-09-19/hero/air-intro-h3-max-turbo.mp4";
const POSTER_SRC = "/media/air/v2026-09-19/hero/air-sanctuary-2x.jpg";

type IntroMode = "checking" | "video" | "still";

export function MobileAirIntro() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitingRef = useRef(false);
  const [active, setActive] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [mode, setMode] = useState<IntroMode>("checking");

  const finish = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    try { sessionStorage.setItem(INTRO_KEY, "true"); } catch { /* Storage may be disabled. */ }
    window.dispatchEvent(new Event("air:intro-complete"));
    setExiting(true);
    if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    closeTimer.current = setTimeout(() => setActive(false), 680);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    let seen = false;
    try { seen = sessionStorage.getItem(INTRO_KEY) === "true"; } catch { /* Storage may be disabled. */ }

    if (reducedMotion || saveData || seen) {
      setMode("still");
      fallbackTimer.current = setTimeout(finish, reducedMotion ? 180 : 760);
    } else {
      setMode("video");
      fallbackTimer.current = setTimeout(finish, 6800);
    }

    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") finish(); };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      if (closeTimer.current) clearTimeout(closeTimer.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [finish]);

  useEffect(() => {
    if (mode !== "video") return;
    const playback = videoRef.current?.play();
    playback?.catch(() => {
      setMode("still");
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
      fallbackTimer.current = setTimeout(finish, 900);
    });
  }, [finish, mode]);

  if (!active) return null;

  return (
    <section
      className={styles.intro}
      data-exiting={exiting}
      data-mode={mode}
      aria-label="Air cinematic introduction"
    >
      <div className={styles.poster} aria-hidden="true" />
      {mode === "video" ? (
        <video
          ref={videoRef}
          className={styles.video}
          autoPlay
          muted
          playsInline
          preload="auto"
          poster={POSTER_SRC}
          onEnded={finish}
          aria-hidden="true"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}
      <div className={styles.vignette} aria-hidden="true" />
      <button className={styles.skip} type="button" onClick={finish} aria-label="Skip introduction">
        Skip <LuX aria-hidden="true" />
      </button>
    </section>
  );
}
