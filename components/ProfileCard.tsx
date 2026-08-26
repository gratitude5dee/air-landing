"use client";

import { type PointerEvent, useEffect, useRef, useState } from "react";
import { LuBadgeCheck, LuFingerprint, LuMessageCircle, LuShieldCheck, LuSparkles } from "react-icons/lu";

import { ShinyText } from "@/components/ShinyText";

import styles from "./ProfileCard.module.css";

type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

type ProfileCardProps = {
  className?: string;
  name: string;
  title: string;
  handle: string;
  status: string;
};

/** Air-adapted ProfileCard: a compact identity surface with a bounded pointer tilt. */
export function ProfileCard({ className = "", name, title, handle, status }: ProfileCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;
    const update = () => setTiltEnabled(finePointer.matches && !reducedMotion.matches && !forcedColors.matches && !connection?.saveData);
    update();
    [finePointer, reducedMotion, forcedColors].forEach((query) => query.addEventListener("change", update));
    connection?.addEventListener?.("change", update);
    return () => {
      [finePointer, reducedMotion, forcedColors].forEach((query) => query.removeEventListener("change", update));
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    if (!tiltEnabled || event.pointerType !== "mouse") return;
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    card.style.setProperty("--profile-x", `${x * 100}%`);
    card.style.setProperty("--profile-y", `${y * 100}%`);
    card.style.setProperty("--profile-rotate-x", `${(0.5 - y) * 7}deg`);
    card.style.setProperty("--profile-rotate-y", `${(x - 0.5) * 7}deg`);
  };

  const resetPointer = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--profile-x", "50%");
    card.style.setProperty("--profile-y", "50%");
    card.style.setProperty("--profile-rotate-x", "0deg");
    card.style.setProperty("--profile-rotate-y", "0deg");
  };

  return (
    <article
      ref={cardRef}
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-label={`${title}: ${status}`}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      <span className={styles.behindGlow} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.glare} aria-hidden="true" />
        <div className={styles.cardHeader}>
          <span><i /> iMessage / identity</span>
          <LuFingerprint aria-hidden="true" />
        </div>
        <div className={styles.avatarField} aria-hidden="true">
          <span className={styles.orbitOne} />
          <span className={styles.orbitTwo} />
          <span className={styles.avatar}><LuMessageCircle /></span>
          <span className={styles.verified}><LuBadgeCheck /></span>
        </div>
        <div className={styles.details}>
          <p className={styles.name}>{name}</p>
          <h3><ShinyText color="#f3fbff" shineColor="#bceeff" speed={5.8} spread={112} pauseOnHover>{title}</ShinyText></h3>
          <p className={styles.handle}>@{handle}</p>
        </div>
        <div className={styles.statusRow}>
          <span><i /> {status}</span>
          <LuShieldCheck aria-hidden="true" />
        </div>
        <div className={styles.cardFooter}>
          <span><LuSparkles aria-hidden="true" /> Context stays attached</span>
          <small>Approval-aware</small>
        </div>
      </div>
    </article>
  );
}
