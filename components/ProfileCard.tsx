"use client";

import { type CSSProperties, type PointerEvent, useEffect, useRef, useState } from "react";
import {
  LuBadgeCheck,
  LuFingerprint,
  LuKeyRound,
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

const identityStudies = [
  {
    id: "koi",
    eyebrow: "01 / koi study",
    label: "iMessage identity current",
    detail: "A private, recognizable presence in the thread.",
    Icon: LuFingerprint,
  },
  {
    id: "boundary",
    eyebrow: "02 / boundary",
    label: "Permission boundary",
    detail: "Access stays explicit, scoped, and revocable.",
    Icon: LuShieldCheck,
  },
  {
    id: "context",
    eyebrow: "03 / context",
    label: "Encrypted context",
    detail: "Continuity without a profile built from your work.",
    Icon: LuKeyRound,
  },
] as const;

function KoiFish() {
  return (
    <svg className={styles.koiFish} viewBox="0 0 160 110" aria-hidden="true">
      <path d="M31 55 7 29 9 55 7 81Z" fill="#f7b366" stroke="#fff0c9" strokeWidth="2" />
      <path d="M31 55c8-27 39-39 76-28 25 8 39 26 40 28-1 2-15 21-40 28-37 11-68-1-76-28Z" fill="#fff0cf" stroke="#d5f5f4" strokeWidth="2" />
      <path d="M58 29c7 8 11 17 10 26-1 8-3 16-10 25" fill="none" stroke="#ff704f" strokeLinecap="round" strokeWidth="12" />
      <path d="M100 28c8 9 11 18 10 27-1 8-4 17-11 25" fill="none" stroke="#ea5a45" strokeLinecap="round" strokeWidth="9" />
      <path d="M69 22 83 9l8 24M70 88l15 13 7-23" fill="#f4bd70" stroke="#fff1cb" strokeLinejoin="round" strokeWidth="2" />
      <circle cx="121" cy="46" r="4" fill="#08385a" /><circle cx="122.5" cy="44.5" r="1.2" fill="#fff" />
      <path d="M131 62c5 2 9 2 14 0" fill="none" stroke="#d77b5d" strokeLinecap="round" strokeWidth="2" />
      <circle cx="33" cy="22" r="3" fill="#9ff4e2" opacity=".9" /><circle cx="42" cy="15" r="2" fill="#c7f9ff" opacity=".8" /><circle cx="132" cy="18" r="2.5" fill="#b9eaff" opacity=".78" />
    </svg>
  );
}

/**
 * An Air-adapted ProfileCard with the public React Bits-style prop surface.
 * It keeps the profile treatment purpose-built for product identity rather
 * than borrowing a social-card visual language wholesale.
 */
function ProfileCard({
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
  const studyControlRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; traveled: number } | null>(null);
  const suppressStudyClickRef = useRef(false);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [activeStudy, setActiveStudy] = useState(0);
  const [privateMode, setPrivateMode] = useState(true);
  const [isDraggingStudy, setIsDraggingStudy] = useState(false);

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

  const moveStudy = (direction: 1 | -1) => {
    setActiveStudy((current) => (current + direction + identityStudies.length) % identityStudies.length);
  };

  const resetStudyTransform = () => {
    const control = studyControlRef.current;
    if (!control) return;
    control.style.setProperty("--study-drag-x", "0px");
    control.style.setProperty("--study-drag-y", "0px");
    control.style.setProperty("--study-tilt-x", "0deg");
    control.style.setProperty("--study-tilt-y", "0deg");
  };

  const onStudyPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== undefined && event.button !== 0) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      traveled: 0,
    };
  };

  const onStudyPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const control = studyControlRef.current;
    if (!drag || !control || drag.pointerId !== event.pointerId) return;
    const x = event.clientX - drag.startX;
    const y = event.clientY - drag.startY;
    drag.traveled = Math.max(drag.traveled, Math.hypot(x, y));
    if (drag.traveled > 6 && !isDraggingStudy) setIsDraggingStudy(true);
    control.style.setProperty("--study-drag-x", `${Math.max(-44, Math.min(44, x))}px`);
    control.style.setProperty("--study-drag-y", `${Math.max(-18, Math.min(18, y * 0.22))}px`);
    control.style.setProperty("--study-tilt-x", `${Math.max(-7, Math.min(7, -y * 0.08))}deg`);
    control.style.setProperty("--study-tilt-y", `${Math.max(-9, Math.min(9, x * 0.09))}deg`);
  };

  const releaseStudy = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const x = event.clientX - drag.startX;
    const distance = drag.traveled;
    dragRef.current = null;
    setIsDraggingStudy(false);
    resetStudyTransform();
    if (distance > 10) suppressStudyClickRef.current = true;
    if (Math.abs(x) >= 42) moveStudy(x < 0 ? 1 : -1);
  };

  const activeIdentityStudy = identityStudies[activeStudy];

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
          <span><i /> koi identity study</span>
          <LuFingerprint aria-hidden="true" />
        </header>

        <div className={styles.identityField}>
          <span className={styles.identityGrid} aria-hidden="true" />
          <button
            ref={studyControlRef}
            type="button"
            className={[styles.studyControl, isDraggingStudy ? styles.studyDragging : ""].filter(Boolean).join(" ")}
            aria-label={`Identity study: ${activeIdentityStudy.label}. Drag horizontally, use arrow keys, or press Enter to switch studies.`}
            onClick={() => {
              if (suppressStudyClickRef.current) {
                suppressStudyClickRef.current = false;
                return;
              }
              moveStudy(1);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                moveStudy(1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveStudy(-1);
              } else if (event.key === "Home") {
                event.preventDefault();
                setActiveStudy(0);
              } else if (event.key === "End") {
                event.preventDefault();
                setActiveStudy(identityStudies.length - 1);
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                moveStudy(1);
              }
            }}
            onPointerDown={onStudyPointerDown}
            onPointerMove={onStudyPointerMove}
            onPointerUp={releaseStudy}
            onPointerCancel={() => {
              dragRef.current = null;
              setIsDraggingStudy(false);
              resetStudyTransform();
            }}
          >
            {identityStudies.map(({ detail, eyebrow, Icon, id, label }, index) => {
              const order = (index - activeStudy + identityStudies.length) % identityStudies.length;
              return (
                <span className={styles.studyCard} data-order={order} key={id}>
                  <span className={styles.studyTopline}>{eyebrow}</span>
                  <span className={styles.studyGlyph}>
                    {id === "koi" ? (
                      <>
                        <KoiFish />
                      </>
                    ) : <Icon />}
                  </span>
                  <span className={styles.studyCopy}>
                    <strong>{label}</strong>
                    <small>{detail}</small>
                  </span>
                  <span className={styles.studySeal}><LuBadgeCheck /></span>
                </span>
              );
            })}
          </button>
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
          <button
            className={styles.skeuomorphicToggle}
            type="button"
            aria-pressed={privateMode}
            aria-label={`Identity privacy preview ${privateMode ? "on" : "off"}`}
            onClick={() => setPrivateMode((current) => !current)}
          >
            <span>{privateMode ? "private" : "preview"}</span>
            <i aria-hidden="true"><b /></i>
          </button>
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
