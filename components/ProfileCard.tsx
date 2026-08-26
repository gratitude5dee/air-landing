"use client";

import { createElement, type CSSProperties, type PointerEvent, useEffect, useRef, useState } from "react";
import {
  LuBadgeCheck,
  LuFingerprint,
  LuLockKeyhole,
  LuShieldCheck,
  LuSparkles,
} from "react-icons/lu";

import { ShinyText } from "@/components/ShinyText";

import styles from "./ProfileCard.module.css";

type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

type ProfileCardProps = {
  avatarUrl?: string;
  behindGlowEnabled?: boolean;
  className?: string;
  contactText?: string;
  enableMobileTilt?: boolean;
  enableTilt?: boolean;
  handle: string;
  iconUrl?: string;
  innerGradient?: string;
  name: string;
  onContactClick?: () => void;
  showUserInfo?: boolean;
  status: string;
  title: string;
};

/**
 * An Air-adapted ProfileCard with the public React Bits-style prop surface.
 * It keeps the profile treatment purpose-built for product identity rather
 * than borrowing a social-card visual language wholesale.
 */
function ProfileCard({
  avatarUrl,
  behindGlowEnabled = false,
  className = "",
  contactText,
  enableMobileTilt = false,
  enableTilt = true,
  handle,
  iconUrl,
  innerGradient,
  name,
  onContactClick,
  showUserInfo = true,
  status,
  title,
}: ProfileCardProps) {
  const cardRef = useRef<HTMLElement>(null);
  const [tiltEnabled, setTiltEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;
    const update = () => {
      setTiltEnabled(
        enableTilt &&
          finePointer.matches &&
          !reducedMotion.matches &&
          !forcedColors.matches &&
          !connection?.saveData,
      );
    };

    update();
    [finePointer, reducedMotion, forcedColors].forEach((query) => query.addEventListener("change", update));
    connection?.addEventListener?.("change", update);
    return () => {
      [finePointer, reducedMotion, forcedColors].forEach((query) => query.removeEventListener("change", update));
      connection?.removeEventListener?.("change", update);
    };
  }, [enableTilt]);

  const updatePointer = (event: PointerEvent<HTMLElement>) => {
    if (!tiltEnabled || (event.pointerType !== "mouse" && !enableMobileTilt)) return;
    const card = cardRef.current;
    if (!card) return;
    const bounds = card.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
    const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
    card.style.setProperty("--profile-x", `${x * 100}%`);
    card.style.setProperty("--profile-y", `${y * 100}%`);
    card.style.setProperty("--profile-rotate-x", `${(0.5 - y) * 5}deg`);
    card.style.setProperty("--profile-rotate-y", `${(x - 0.5) * 5}deg`);
  };

  const resetPointer = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--profile-x", "50%");
    card.style.setProperty("--profile-y", "50%");
    card.style.setProperty("--profile-rotate-x", "0deg");
    card.style.setProperty("--profile-rotate-y", "0deg");
  };

  const cardStyle = innerGradient
    ? ({ "--profile-inner-gradient": innerGradient } as CSSProperties)
    : undefined;

  return (
    <article
      ref={cardRef}
      className={[styles.card, className].filter(Boolean).join(" ")}
      style={cardStyle}
      aria-label={`${title}: ${status}`}
      onPointerMove={updatePointer}
      onPointerLeave={resetPointer}
    >
      {behindGlowEnabled ? <span className={styles.behindGlow} aria-hidden="true" /> : null}
      <div className={styles.shell}>
        <div className={styles.glare} aria-hidden="true" />
        <header className={styles.cardHeader}>
          <span><i /> verified identity</span>
          <LuFingerprint aria-hidden="true" />
        </header>

        <div className={styles.identityField} aria-hidden="true">
          <span className={styles.identityRing} />
          <span className={styles.identityGrid} />
          <span className={styles.avatar}>
            {avatarUrl ? <img src={avatarUrl} alt="" /> : (
              <>
                {createElement("dk-avatar", {
                  className: styles.avatarDither,
                  name: "onairos",
                  from: "cyan",
                  cells: "5",
                  bloom: "low",
                })}
                <span className={styles.avatarMark}>O</span>
                <span className={styles.avatarOrbit} />
              </>
            )}
          </span>
          <span className={styles.verified}><LuBadgeCheck /></span>
          {iconUrl ? <img className={styles.cornerIcon} src={iconUrl} alt="" /> : null}
        </div>

        <div className={styles.details}>
          {showUserInfo ? <p className={styles.name}>{name}</p> : null}
          <h3>
            <ShinyText color="#f7fdff" shineColor="#bff2ff" speed={6.4} spread={112} pauseOnHover>
              {title}
            </ShinyText>
          </h3>
          {showUserInfo ? <p className={styles.handle}>@{handle}</p> : null}
        </div>

        <div className={styles.statusRow}>
          <span><i /> {status}</span>
          <LuShieldCheck aria-hidden="true" />
        </div>

        <footer className={styles.cardFooter}>
          <span><LuLockKeyhole aria-hidden="true" /> encrypted context</span>
          {contactText ? (
            <button type="button" onClick={onContactClick}>
              <ShinyText color="#d8f6ff" shineColor="#ffffff" speed={4.8} spread={112} pauseOnHover>
                {contactText}
              </ShinyText>
              <LuSparkles aria-hidden="true" />
            </button>
          ) : <small>Private beta</small>}
        </footer>
      </div>
    </article>
  );
}

export { ProfileCard };
export default ProfileCard;
