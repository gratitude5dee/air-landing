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
    eyebrow: "01 / identity study",
    label: "iMessage-bound identity",
    detail: "A private, recognizable presence for the work in your thread.",
    Icon: LuFingerprint,
  },
  {
    id: "boundary",
    eyebrow: "02 / boundary study",
    label: "Permission boundary",
    detail: "Access stays explicit, scoped, and revocable.",
    Icon: LuShieldCheck,
  },
  {
    id: "context",
    eyebrow: "03 / context study",
    label: "Encrypted context",
    detail: "Continuity without a profile built from your work.",
    Icon: LuKeyRound,
  },
] as const;

function KoiFish() {
  return (
    <svg className={styles.koiFish} viewBox="0 0 300 260" aria-hidden="true">
      <path d="M107 125C80 90 54 68 25 62c14 23 13 44 0 63 31-8 58 4 82 31-2-11 0-21 7-31-7-10-9-20-7-31Z" fill="#9f6424" opacity=".92" />
      <path d="M100 126c9-62 67-99 125-82 34 10 56 39 61 81-9 45-39 73-80 82-59 13-108-25-106-81Z" fill="#e2a33e" stroke="#2b2419" strokeWidth="4" />
      <path d="M127 66c23 14 34 35 32 62-2 28-12 50-32 68M177 48c24 20 37 46 36 77-1 31-12 56-33 77M220 65c17 20 24 41 20 65-3 19-11 36-24 50" fill="none" stroke="#2b2419" strokeLinecap="round" strokeWidth="17" />
      <path d="M149 59c20 13 28 33 24 59-3 25-11 45-24 60" fill="none" stroke="#f4dca8" strokeLinecap="round" strokeWidth="8" opacity=".92" />
      <path d="M111 96 83 72l12 44M119 159l-25 30 39-11M212 51l7-35 18 37M220 201l14 35-34-22" fill="#bb7828" stroke="#2b2419" strokeLinejoin="round" strokeWidth="4" />
      <path d="M245 110c13 4 24 4 35-1" fill="none" stroke="#2b2419" strokeLinecap="round" strokeWidth="4" />
      <circle cx="247" cy="93" r="8" fill="#1b1914" /><circle cx="249.5" cy="90.5" r="2.1" fill="#f9f0d6" />
      <path d="M106 119c8 4 15 6 23 6M105 139c8-3 15-4 23-3M181 82c9 5 17 8 26 8M182 162c9-5 17-7 25-7" fill="none" stroke="#f5d99c" strokeLinecap="round" strokeWidth="5" opacity=".9" />
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
                <span className={styles.studyCard} data-order={order} data-study={id} key={id}>
                  <span className={styles.studyArtwork}>
                    <span className={styles.studyWaterRings} aria-hidden="true"><i /><i /><i /></span>
                    <span className={styles.studyReeds} aria-hidden="true"><i /><i /><i /></span>
                    <span className={styles.studyGlyph}>
                      {id === "koi" ? <KoiFish /> : <Icon />}
                    </span>
                  </span>
                  <span className={styles.studyCaption}>
                    <span className={styles.studyTopline}>{eyebrow}</span>
                    <span className={styles.studyCopy}>
                      <strong>{label}</strong>
                      <small>{detail}</small>
                    </span>
                    <span className={styles.studySeal}><LuBadgeCheck /></span>
                  </span>
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
