"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

import styles from "./DriftWall.module.css";

export type DriftWallItem = Readonly<{
  image: string;
  title: string;
  description?: string;
  eyebrow?: string;
  accent?: string;
  href?: string;
}>;

type DriftWallProps = {
  items: readonly DriftWallItem[];
  columns?: number;
  tileWidth?: number;
  tileHeight?: number;
  gap?: number;
  radius?: number;
  tilt?: number;
  turn?: number;
  roll?: number;
  perspective?: number;
  depth?: number;
  speed?: number;
  direction?: "up" | "down";
  variance?: number;
  parallax?: number;
  pauseOnHover?: boolean;
  lift?: number;
  fade?: number;
  dim?: number;
  grayscale?: boolean;
  overlayColor?: string;
  className?: string;
};

type WallStyle = CSSProperties & Record<`--dw-${string}`, string | number>;

const columnFactor = (index: number, variance: number) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1;
  return 1 + variance * pseudo;
};

export function DriftWall({
  items,
  columns = 4,
  tileWidth = 190,
  tileHeight = 132,
  gap = 14,
  radius = 18,
  tilt = 13,
  turn = -11,
  roll = 0,
  perspective = 1200,
  depth = 100,
  speed = 25,
  direction = "up",
  variance = 0.4,
  parallax = 0.45,
  pauseOnHover = false,
  lift = 54,
  fade = 0.48,
  dim = 0.62,
  grayscale = false,
  overlayColor = "#dceef5",
  className = "",
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const trackRefs = useRef<Array<HTMLDivElement | null>>([]);
  const rafRef = useRef<number | null>(null);
  const offsetsRef = useRef<number[]>([]);
  const velocitiesRef = useRef<number[]>([]);
  const hoveredColRef = useRef(-1);
  const wallHoveredRef = useRef(false);
  const visibleRef = useRef(true);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pointerDampedRef = useRef({ x: 0, y: 0 });
  const lastTsRef = useRef<number | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const [containerHeight, setContainerHeight] = useState(600);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const columnItems = useMemo(() => {
    const safeColumns = Math.max(1, columns);
    const cols = Array.from({ length: safeColumns }, () => [] as DriftWallItem[]);
    items.forEach((item, index) => cols[index % safeColumns].push(item));
    return cols.map((column) => column.length ? column : items.slice(0, 1));
  }, [columns, items]);

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap;
    return columnItems.map((column) => {
      const copyHeight = Math.max(unit, column.length * unit);
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1);
      return { copyHeight, copies };
    });
  }, [columnItems, containerHeight, gap, tileHeight]);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const resizeObserver = new ResizeObserver(([entry]) => setContainerHeight(entry.contentRect.height || 600));
    const visibilityObserver = new IntersectionObserver(([entry]) => { visibleRef.current = entry.isIntersecting; }, { rootMargin: "160px" });
    resizeObserver.observe(container);
    visibilityObserver.observe(container);
    return () => {
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  const baseVelocities = useMemo(() => {
    const directionSign = direction === "up" ? 1 : -1;
    return columnItems.map((_, column) => speed * columnFactor(column, variance) * directionSign * (column % 2 === 0 ? 1 : -1));
  }, [columnItems, direction, speed, variance]);

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, column) => meta.copyHeight * ((column * 0.37) % 1));
    velocitiesRef.current = columnItems.map(() => 0);
  }, [columnItems, columnMeta]);

  const applyPlaneTransform = useCallback((pointerX: number, pointerY: number) => {
    const plane = planeRef.current;
    if (!plane) return;
    plane.style.transform = `translate(-50%, -50%) scale(1.2) rotateX(${tilt + pointerY}deg) rotateY(${turn + pointerX}deg) rotateZ(${roll}deg) translateZ(${-depth}px)`;
  }, [depth, roll, tilt, turn]);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTsRef.current === null) lastTsRef.current = timestamp;
      const delta = Math.min(0.05, Math.max(0, timestamp - lastTsRef.current) / 1000);
      lastTsRef.current = timestamp;

      if (visibleRef.current && !document.hidden) {
        const maxTilt = parallax * 8;
        const damping = 1 - Math.exp(-delta / 0.12);
        pointerDampedRef.current.x += (pointerRef.current.x * maxTilt - pointerDampedRef.current.x) * damping;
        pointerDampedRef.current.y += (-pointerRef.current.y * maxTilt - pointerDampedRef.current.y) * damping;
        applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y);

        if (!reduced) {
          trackRefs.current.forEach((element, column) => {
            const meta = columnMeta[column];
            if (!element || !meta) return;
            const paused = (wallHoveredRef.current && pauseOnHover) || hoveredColRef.current === column;
            const target = paused ? 0 : baseVelocities[column];
            const ease = 1 - Math.exp(-delta / (target === 0 ? 0.16 : 0.28));
            velocitiesRef.current[column] += (target - velocitiesRef.current[column]) * ease;
            let next = (offsetsRef.current[column] ?? 0) + velocitiesRef.current[column] * delta;
            next = ((next % meta.copyHeight) + meta.copyHeight) % meta.copyHeight;
            offsetsRef.current[column] = next;
            element.style.transform = `translate3d(0, ${-next}px, 0)`;
          });
        }
      }
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTsRef.current = null;
    };
  }, [applyPlaneTransform, baseVelocities, columnMeta, parallax, pauseOnHover, reduced]);

  const activate = useCallback((id: string, column: number) => {
    activeIdRef.current = id;
    hoveredColRef.current = column;
    setActiveId(id);
  }, []);

  const release = useCallback(() => {
    activeIdRef.current = null;
    hoveredColRef.current = -1;
    setActiveId(null);
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (parallax > 0 && !reduced) {
      pointerRef.current = { x: (event.clientX - rect.left) / rect.width - 0.5, y: (event.clientY - rect.top) / rect.height - 0.5 };
    }
    const hit = document.elementFromPoint(event.clientX, event.clientY);
    const tile = hit instanceof Element ? hit.closest<HTMLElement>("[data-tile-id]") : null;
    const id = tile?.dataset.tileId;
    if (!tile || !id || id === activeIdRef.current) return;
    activate(id, Number(tile.dataset.col));
  }, [activate, parallax, reduced]);

  const customStyle: WallStyle = {
    "--dw-tile-w": `${tileWidth}px`,
    "--dw-tile-h": `${tileHeight}px`,
    "--dw-gap": `${gap}px`,
    "--dw-radius": `${radius}px`,
    "--dw-perspective": `${perspective}px`,
    "--dw-tilt": `${tilt}deg`,
    "--dw-turn": `${turn}deg`,
    "--dw-roll": `${roll}deg`,
    "--dw-depth": `${-depth}px`,
    "--dw-lift": `${lift}px`,
    "--dw-dim": dim,
    "--dw-gray": grayscale ? 1 : 0,
    "--dw-overlay": overlayColor,
    "--dw-edge": `${Math.max(0, (1 - fade) * 100)}%`,
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.wall} ${reduced ? styles.reduced : ""} ${className}`}
      style={customStyle}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { wallHoveredRef.current = true; }}
      onPointerLeave={() => { wallHoveredRef.current = false; pointerRef.current = { x: 0, y: 0 }; release(); }}
      role="group"
      aria-label="Air Mini App creative wall"
    >
      <div ref={planeRef} className={styles.plane}>
        {columnItems.map((column, columnIndex) => {
          const meta = columnMeta[columnIndex];
          return (
            <div className={styles.column} key={`column-${columnIndex}`}>
              <div className={styles.track} ref={(element) => { trackRefs.current[columnIndex] = element; }}>
                {Array.from({ length: meta.copies }).flatMap((_, copyIndex) => column.map((item, itemIndex) => {
                  const id = `${columnIndex}-${copyIndex}-${itemIndex}`;
                  const primaryCopy = copyIndex === 0;
                  const itemStyle = { "--dw-item-accent": item.accent ?? "#168ed1" } as WallStyle;
                  const inner = (
                    <span className={styles.inner}>
                      <img src={item.image} alt={primaryCopy ? item.title : ""} loading="lazy" decoding="async" draggable={false} />
                      <span className={styles.overlay} aria-hidden="true" />
                      <span className={styles.caption} aria-hidden="true">
                        {item.eyebrow && <small>{item.eyebrow}</small>}
                        <strong>{item.title}</strong>
                        {item.description && <span>{item.description}</span>}
                      </span>
                    </span>
                  );
                  return item.href ? (
                    <a className={`${styles.tile} ${activeId === id ? styles.active : ""}`} style={itemStyle} data-tile-id={id} data-col={columnIndex} href={item.href} key={id} tabIndex={primaryCopy ? 0 : -1} aria-hidden={!primaryCopy} aria-label={[item.title, item.description].filter(Boolean).join(". ")} onFocus={() => activate(id, columnIndex)} onBlur={release}>{inner}</a>
                  ) : (
                    <button className={`${styles.tile} ${activeId === id ? styles.active : ""}`} style={itemStyle} data-tile-id={id} data-col={columnIndex} type="button" key={id} tabIndex={primaryCopy ? 0 : -1} aria-hidden={!primaryCopy} aria-label={[item.title, item.description].filter(Boolean).join(". ")} onClick={() => activate(id, columnIndex)} onFocus={() => activate(id, columnIndex)} onBlur={release}>{inner}</button>
                  );
                }))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
