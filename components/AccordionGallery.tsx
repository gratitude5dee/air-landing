"use client";

import { gsap } from "gsap";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from "react";

import styles from "./AccordionGallery.module.css";

export type AccordionGalleryItem = Readonly<{ image: string; label: string; description?: string; link?: string; alt?: string }>;

type Props = {
  items: readonly AccordionGalleryItem[];
  defaultIndex?: number;
  accentColor?: string;
  overlayColor?: string;
  textColor?: string;
  height?: number;
  gap?: number;
  radius?: number;
  expandRatio?: number;
  duration?: number;
  ease?: string;
  parallax?: number;
  tilt?: number;
  stagger?: number;
  trigger?: "hover" | "click";
  grayscale?: boolean;
};

type GalleryStyle = CSSProperties & Record<`--ag-${string}`, string>;

export function AccordionGallery({
  items,
  defaultIndex = 0,
  accentColor = "#b9e6ff",
  overlayColor = "#08131b",
  textColor = "#ffffff",
  height = 500,
  gap = 10,
  radius = 24,
  expandRatio = 0.56,
  duration = 0.65,
  ease = "power3.out",
  parallax = 0.45,
  tilt = 6,
  stagger = 0.05,
  trigger = "hover",
  grayscale = true,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const mediaRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const barRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const textRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const firstRunRef = useRef(true);
  const mediaSizeRef = useRef(320);
  const count = items.length;
  const [active, setActive] = useState(Math.min(Math.max(defaultIndex, 0), count - 1));
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const applyLayout = useCallback((animate: boolean) => {
    const ratio = Math.min(Math.max(expandRatio, 0.2), 0.9);
    const grow = count > 1 ? ratio * (count - 1) / (1 - ratio) : 1;
    timelineRef.current?.kill();
    const transition = animate && !reduced ? duration : 0;
    const timeline = gsap.timeline();
    panelRefs.current.forEach((panel, index) => {
      if (!panel) return;
      const isActive = index === active;
      timeline.to(panel, { flexGrow: isActive ? grow : 1, rotateY: isActive ? 0 : index < active ? tilt : -tilt, duration: transition, ease }, 0);
      const media = mediaRefs.current[index];
      if (media) {
        const shift = Math.max(-1.5, Math.min(1.5, active - index)) * parallax * mediaSizeRef.current * .06;
        timeline.to(media, { xPercent: -50, yPercent: -50, x: isActive ? 0 : shift, "--ag-gray": grayscale ? isActive ? 0 : 1 : 0, "--ag-dim": isActive ? 0 : .35, duration: transition, ease }, 0);
      }
      const bar = barRefs.current[index];
      const text = textRefs.current[index];
      if (bar && text) timeline.to([bar, text], { opacity: isActive ? 1 : 0, x: isActive ? 0 : -14, duration: isActive ? transition : transition * .6, ease, stagger: isActive && !reduced ? stagger : 0 }, 0);
    });
    timelineRef.current = timeline;
  }, [active, count, duration, ease, expandRatio, grayscale, parallax, reduced, stagger, tilt]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const usable = Math.max(root.getBoundingClientRect().width - gap * (count - 1), 120);
      mediaSizeRef.current = Math.max(140, usable * Math.min(Math.max(expandRatio, .2), .9) * 1.22);
      root.style.setProperty("--ag-media-size", `${mediaSizeRef.current}px`);
      applyLayout(!firstRunRef.current);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [applyLayout, count, expandRatio, gap]);

  useEffect(() => { applyLayout(!firstRunRef.current); firstRunRef.current = false; }, [applyLayout]);
  useEffect(() => () => { timelineRef.current?.kill(); }, []);

  const changeWithKeys = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const forward = event.key === "ArrowRight" || event.key === "ArrowDown";
    const backward = event.key === "ArrowLeft" || event.key === "ArrowUp";
    if (!forward && !backward) return;
    event.preventDefault();
    const next = (index + (forward ? 1 : -1) + count) % count;
    setActive(next);
    panelRefs.current[next]?.focus();
  };

  const rootStyle: GalleryStyle = {
    "--ag-accent": accentColor,
    "--ag-overlay": overlayColor,
    "--ag-text": textColor,
    "--ag-gap": `${gap}px`,
    "--ag-radius": `${radius}px`,
    height: `${height}px`,
  };

  return (
    <div ref={rootRef} className={styles.gallery} style={rootStyle} role="list" aria-label="One continuous Air workspace">
      {items.map((item, index) => {
        const isActive = index === active;
        return (
          <a
            key={item.label}
            ref={(element) => { panelRefs.current[index] = element; }}
            className={`${styles.panel} ${isActive ? styles.active : ""}`}
            href={item.link ?? "/how-it-works"}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => { if (!isActive) { event.preventDefault(); setActive(index); } }}
            onMouseEnter={() => { if (trigger === "hover") setActive(index); }}
            onFocus={() => setActive(index)}
            onKeyDown={(event) => changeWithKeys(event, index)}
            role="listitem"
            aria-current={isActive ? "true" : undefined}
            aria-label={`${item.label}. ${item.description ?? ""}`}
          >
            <span className={styles.frame}>
              <span className={styles.media} ref={(element) => { mediaRefs.current[index] = element; }}><img src={item.image} alt={item.alt ?? ""} draggable={false} /></span>
              <span className={styles.overlay} aria-hidden="true" />
            </span>
            <span className={styles.label} aria-hidden="true">
              <span className={styles.bar} ref={(element) => { barRefs.current[index] = element; }} />
              <span className={styles.text} ref={(element) => { textRefs.current[index] = element; }}><strong>{item.label}</strong>{item.description && <small>{item.description}</small>}</span>
            </span>
          </a>
        );
      })}
    </div>
  );
}
