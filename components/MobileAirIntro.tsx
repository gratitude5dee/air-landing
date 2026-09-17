"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { LuArrowUp, LuCalendarDays, LuMessageCircle, LuSparkles } from "react-icons/lu";

import styles from "./MobileAirIntro.module.css";

const introPieces = [
  { kind: "image", src: "/media/air/v2026-09-17-c/hero/capture.jpg", label: "Capture", x: "9%", y: "12%", rotate: "-13deg", delay: "1.15s" },
  { kind: "note", label: "Launch plan", x: "60%", y: "2%", rotate: "9deg", delay: "1.28s" },
  { kind: "image", src: "/media/air/v2026-09-17-c/hero/create.jpg", label: "Create", x: "72%", y: "38%", rotate: "14deg", delay: "1.42s" },
  { kind: "message", label: "Keep this moving", x: "2%", y: "48%", rotate: "-8deg", delay: "1.55s" },
  { kind: "calendar", label: "Review · 2:30", x: "53%", y: "72%", rotate: "-5deg", delay: "1.68s" },
  { kind: "spark", label: "Ready", x: "26%", y: "78%", rotate: "7deg", delay: "1.82s" },
] as const;

type PieceStyle = CSSProperties & {
  "--piece-x": string;
  "--piece-y": string;
  "--piece-rotate": string;
  "--piece-delay": string;
};

export function MobileAirIntro() {
  const [active, setActive] = useState(true);
  const [exiting, setExiting] = useState(false);
  const exitingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);
    closeTimerRef.current = setTimeout(() => setActive(false), 620);
  }, []);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 720px)").matches) {
      setActive(false);
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const autoTimer = reducedMotion ? null : setTimeout(finish, 7200);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      if (autoTimer) clearTimeout(autoTimer);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [finish]);

  useEffect(() => {
    if (!active) document.body.style.overflow = "";
  }, [active]);

  if (!active) return null;

  return (
    <section
      className={styles.intro}
      data-exiting={exiting ? "true" : "false"}
      aria-label="Welcome to Air"
      aria-modal="true"
      role="dialog"
    >
      <button className={styles.skip} type="button" onClick={finish}>
        Skip intro
      </button>

      <div className={styles.meta} aria-hidden="true">
        <span>AIR / WZRD.TECH</span>
        <span>PRIVATE BETA</span>
      </div>

      <div className={styles.mark} aria-hidden="true"><span>AIR</span></div>

      <div className={styles.constellation} aria-hidden="true">
        <span className={styles.orb}><i /></span>
        {introPieces.map((piece) => {
          const style: PieceStyle = {
            "--piece-x": piece.x,
            "--piece-y": piece.y,
            "--piece-rotate": piece.rotate,
            "--piece-delay": piece.delay,
          };
          return (
            <span className={`${styles.piece} ${styles[piece.kind]}`} style={style} key={`${piece.kind}-${piece.label}`}>
              {piece.kind === "image" && "src" in piece ? (
                <Image src={piece.src} alt="" fill sizes="68px" />
              ) : piece.kind === "note" ? (
                <><small>Notes</small><strong>{piece.label}</strong></>
              ) : piece.kind === "calendar" ? (
                <><LuCalendarDays /><b>{piece.label}</b></>
              ) : piece.kind === "spark" ? (
                <><LuSparkles /><b>{piece.label}</b></>
              ) : (
                <><LuMessageCircle /><b>{piece.label}</b></>
              )}
            </span>
          );
        })}
      </div>

      <div className={styles.copy}>
        <p>Your personal assistant for your work.</p>
        <span>Capture a thought. Air keeps the context and brings back the next move.</span>
      </div>

      <button className={styles.enter} type="button" onClick={finish}>
        Enter Air <LuArrowUp aria-hidden="true" />
      </button>
      <p className={styles.hint}>Swipe up or tap to enter</p>
    </section>
  );
}
