"use client";

import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { IconType } from "react-icons";
import { LuMessagesSquare } from "react-icons/lu";
import {
  SiFigma,
  SiGmail,
  SiInstagram,
  SiNetflix,
  SiNotion,
  SiShopify,
  SiSpotify,
  SiYoutube,
} from "react-icons/si";

import { SectionAutoplayVideo } from "./SectionAutoplayVideo";
import { VaultReveal } from "./VaultReveal";
import styles from "./AppOrbPlayground.module.css";

type AppDefinition = {
  name: string;
  Icon: IconType;
  color: string;
  x: number;
  y: number;
  size: number;
  delay: string;
};

const apps: readonly AppDefinition[] = [
  { name: "Spotify", Icon: SiSpotify, color: "#1ed760", x: 18, y: 28, size: 126, delay: "-1.2s" },
  { name: "Netflix", Icon: SiNetflix, color: "#e50914", x: 40, y: 19, size: 98, delay: "-3.7s" },
  { name: "Notion", Icon: SiNotion, color: "#171717", x: 64, y: 27, size: 120, delay: "-2.1s" },
  { name: "Figma", Icon: SiFigma, color: "#f24e1e", x: 82, y: 20, size: 88, delay: "-5.4s" },
  { name: "Gmail", Icon: SiGmail, color: "#ea4335", x: 27, y: 67, size: 88, delay: "-4.3s" },
  { name: "Slack", Icon: LuMessagesSquare, color: "#611f69", x: 49, y: 61, size: 142, delay: "-1.8s" },
  { name: "YouTube", Icon: SiYoutube, color: "#ff0033", x: 72, y: 70, size: 104, delay: "-3.1s" },
  { name: "Shopify", Icon: SiShopify, color: "#76a947", x: 89, y: 62, size: 82, delay: "-6.2s" },
  { name: "Instagram", Icon: SiInstagram, color: "#d62976", x: 9, y: 70, size: 78, delay: "-2.8s" },
] as const;

type Offset = { x: number; y: number; z: number };
type Drag = { index: number; pointerId: number; startX: number; startY: number; offsetX: number; offsetY: number };
type OrbStyle = CSSProperties & {
  "--app-color": string;
  "--orb-size": string;
  "--float-delay": string;
  "--drag-x": string;
  "--drag-y": string;
};

export function AppOrbPlayground() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const zRef = useRef(10);
  const [offsets, setOffsets] = useState<Offset[]>(() => apps.map(() => ({ x: 0, y: 0, z: 1 })));

  const beginDrag = (event: ReactPointerEvent<HTMLButtonElement>, index: number) => {
    const offset = offsets[index];
    dragRef.current = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    zRef.current += 1;
    setOffsets((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, z: zRef.current } : item));
  };

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    const field = fieldRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !field) return;
    const rect = field.getBoundingClientRect();
    const limitX = rect.width * 0.38;
    const limitY = rect.height * 0.34;
    const nextX = Math.max(-limitX, Math.min(limitX, drag.offsetX + event.clientX - drag.startX));
    const nextY = Math.max(-limitY, Math.min(limitY, drag.offsetY + event.clientY - drag.startY));
    setOffsets((current) => current.map((item, index) => index === drag.index ? { ...item, x: nextX, y: nextY } : item));
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  };

  const moveWithKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.shiftKey ? 24 : 8;
    const direction = event.key === "ArrowLeft" ? [-delta, 0]
      : event.key === "ArrowRight" ? [delta, 0]
        : event.key === "ArrowUp" ? [0, -delta]
          : event.key === "ArrowDown" ? [0, delta]
            : null;
    if (!direction) return;
    event.preventDefault();
    setOffsets((current) => current.map((item, itemIndex) => itemIndex === index
      ? { ...item, x: item.x + direction[0], y: item.y + direction[1] }
      : item));
  };

  return (
    <section className={styles.section} aria-labelledby="app-orbs-title">
      <div className={styles.embossMark} aria-hidden="true">ORBIT</div>
      <div className={styles.chromaticFloor} aria-hidden="true" />
      <VaultReveal className={styles.filmReveal}>
        <SectionAutoplayVideo
          desktopSrc="/media/air/v2026-09-17-d/demos/airclay-720.mp4"
          mobileSrc="/media/air/v2026-09-17-d/demos/airclay-540.mp4"
          poster="/media/air/v2026-09-17-d/demos/airclay-poster.jpg"
          kicker="Air / Field film 01"
          title="Step into Air."
          description="A personal world forms around the work—then stays ready for whatever comes next."
        />
      </VaultReveal>
      <VaultReveal className={styles.copy} delay={80}>
        <p>YOUR APPS, IN ORBIT</p>
        <h2 id="app-orbs-title">Pull the tools you love into the same working space.</h2>
        <span>Drag an orb. Use arrow keys when an orb is focused.</span>
      </VaultReveal>
      <VaultReveal className={styles.fieldReveal} delay={140}>
      <div ref={fieldRef} className={styles.field} role="group" aria-label="Interactive app orbs">
        <div className={styles.fieldGlow} aria-hidden="true" />
        <div className={styles.orbitTrack} aria-hidden="true"><span /><span /></div>
        {apps.map(({ name, Icon, color, x, y, size, delay }, index) => {
          const offset = offsets[index];
          const style: OrbStyle = {
            left: `${x}%`,
            top: `${y}%`,
            zIndex: offset.z,
            "--app-color": color,
            "--orb-size": `${size}px`,
            "--float-delay": delay,
            "--drag-x": `${offset.x}px`,
            "--drag-y": `${offset.y}px`,
          };
          return (
            <button
              key={name}
              className={styles.appOrb}
              style={style}
              type="button"
              aria-label={`${name} orb. Drag to move, or use arrow keys.`}
              onPointerDown={(event) => beginDrag(event, index)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              onKeyDown={(event) => moveWithKeys(event, index)}
            >
              <span className={styles.glass}><span className={styles.icon}><Icon aria-hidden="true" /></span></span>
              <strong>{name}</strong>
            </button>
          );
        })}
        <div className={styles.centerOrb} aria-hidden="true"><span>AIR</span><small>one context</small></div>
      </div>
      </VaultReveal>
    </section>
  );
}
