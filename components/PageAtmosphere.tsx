"use client";

import {
  createElement,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

import styles from "./PageAtmosphere.module.css";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: "change", listener: EventListener) => void;
    removeEventListener?: (type: "change", listener: EventListener) => void;
  };
};

type SkyElement = HTMLElement & {
  progress: number;
  skyStatus?: string;
};

type AtmosphereScene = {
  name: string;
  progress: number;
  rays: number;
  opacity: number;
};

type SceneCandidate = {
  ratio: number;
  scene: AtmosphereScene;
};

const DEFAULT_SCENE: AtmosphereScene = {
  name: "sky",
  progress: 0.78,
  rays: 0.28,
  opacity: 0.42,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function parseNumber(value: string | null, fallback: number, minimum: number, maximum: number) {
  const parsed = Number.parseFloat(value ?? "");
  return Number.isFinite(parsed) ? clamp(parsed, minimum, maximum) : fallback;
}

function sceneFromElement(element: Element): AtmosphereScene {
  const name = element.getAttribute("data-air-scene") || DEFAULT_SCENE.name;
  const preset = name === "pearl"
    ? { progress: 0.82, rays: 0.16, opacity: 0.34 }
    : name === "ink"
      ? { progress: 0.72, rays: 0.18, opacity: 0.27 }
      : name === "cloud"
        ? { progress: 0.68, rays: 0.38, opacity: 0.52 }
        : DEFAULT_SCENE;

  return {
    name,
    progress: parseNumber(element.getAttribute("data-air-cloud-progress"), preset.progress, 0, 1),
    rays: parseNumber(element.getAttribute("data-air-cloud-rays"), preset.rays, 0, 2),
    opacity: parseNumber(element.getAttribute("data-air-cloud-opacity"), preset.opacity, 0, 1),
  };
}

function canUsePageAtmosphere() {
  const connection = (navigator as NavigatorWithConnection).connection;

  return (
    window.matchMedia("(min-width: 740px) and (hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(forced-colors: active)").matches &&
    !connection?.saveData
  );
}

/**
 * One full-viewport ambient cloud layer for the non-hero narrative. Sections
 * opt in with `data-air-scene` and may tune their treatment using
 * `data-air-cloud-progress`, `data-air-cloud-rays`, and
 * `data-air-cloud-opacity`. The hero is deliberately a separate scene: this
 * component stays off until `.hero-scroll` has fully left the viewport.
 */
export function PageAtmosphere({
  className,
  enabled = true,
  sceneSelector = "[data-air-scene]",
  heroSelector = ".hero-scroll",
}: {
  className?: string;
  /** Lets the app feature flag opt out without removing static scene styling. */
  enabled?: boolean;
  sceneSelector?: string;
  heroSelector?: string;
}) {
  const skyRef = useRef<SkyElement>(null);
  const [eligible, setEligible] = useState(false);
  const [heroVisible, setHeroVisible] = useState(true);
  const [scene, setScene] = useState<AtmosphereScene | null>(null);
  const [status, setStatus] = useState<"idle" | "ready" | "fallback">("idle");

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const media = [
      window.matchMedia("(min-width: 740px) and (hover: hover) and (pointer: fine)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(forced-colors: active)"),
    ];
    const reconcile = () => setEligible(enabled && canUsePageAtmosphere());

    reconcile();
    media.forEach((query) => query.addEventListener("change", reconcile));
    connection?.addEventListener?.("change", reconcile);

    return () => {
      media.forEach((query) => query.removeEventListener("change", reconcile));
      connection?.removeEventListener?.("change", reconcile);
    };
  }, [enabled]);

  useEffect(() => {
    const candidates = new Map<Element, SceneCandidate>();
    let sceneObserver: IntersectionObserver | null = null;
    let heroObserver: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;
    // `undefined` deliberately means “not queried yet.” A detail route has
    // no `.hero-scroll`; initializing this as null would make the first
    // refresh bail out and incorrectly keep the page atmosphere idle.
    let observedHero: Element | null | undefined;
    let refreshFrame = 0;

    const chooseScene = () => {
      let selected: SceneCandidate | null = null;
      for (const candidate of candidates.values()) {
        if (!selected || candidate.ratio > selected.ratio) selected = candidate;
      }
      setScene(selected === null ? null : selected.scene);
    };

    const refreshTargets = () => {
      const targets = Array.from(document.querySelectorAll(sceneSelector));
      const targetSet = new Set(targets);

      candidates.forEach((_, element) => {
        if (!targetSet.has(element)) {
          candidates.delete(element);
          sceneObserver?.unobserve(element);
        }
      });
      targets.forEach((element) => {
        if (candidates.has(element)) return;
        candidates.set(element, { ratio: 0, scene: sceneFromElement(element) });
        sceneObserver?.observe(element);
      });
      chooseScene();
    };

    const refreshHero = () => {
      const nextHero = document.querySelector(heroSelector);
      if (nextHero === observedHero) return;

      heroObserver?.disconnect();
      observedHero = nextHero;
      if (!nextHero) {
        setHeroVisible(false);
        return;
      }

      setHeroVisible(true);
      heroObserver?.observe(nextHero);
    };

    sceneObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const candidate = candidates.get(entry.target);
          if (!candidate) return;
          candidate.ratio = entry.isIntersecting ? entry.intersectionRatio : 0;
          candidate.scene = sceneFromElement(entry.target);
        });
        chooseScene();
      },
      { rootMargin: "12% 0px", threshold: [0, 0.05, 0.2, 0.45, 0.7, 1] },
    );

    heroObserver = new IntersectionObserver(
      ([entry]) => setHeroVisible(Boolean(entry?.isIntersecting)),
      { threshold: 0 },
    );
    refreshHero();

    mutationObserver = new MutationObserver(() => {
      if (refreshFrame) return;
      refreshFrame = window.requestAnimationFrame(() => {
        refreshFrame = 0;
        refreshTargets();
        refreshHero();
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
    refreshTargets();

    return () => {
      if (refreshFrame) window.cancelAnimationFrame(refreshFrame);
      sceneObserver?.disconnect();
      heroObserver?.disconnect();
      mutationObserver?.disconnect();
    };
  }, [heroSelector, sceneSelector]);

  const visible = eligible && !heroVisible && scene !== null;
  const shaderActive = visible && status !== "fallback";

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;

    const syncSky = () => {
      if (!skyRef.current) return;
      // React's custom-element bridge may attempt property assignment for
      // unknown attributes after upgrade. `wz-sky` intentionally exposes
      // read-only mode/rays accessors, so set the public attributes directly.
      skyRef.current.setAttribute("mode", shaderActive ? "calm" : "off");
      skyRef.current.setAttribute("rays", String(scene?.rays ?? 0));
      if (shaderActive && scene) skyRef.current.progress = scene.progress;
    };
    const handleSkyStatus = (event: Event) => {
      const nextStatus = (event as CustomEvent<{ status?: string }>).detail?.status;
      if (nextStatus === "fallback") setStatus("fallback");
      if (nextStatus === "ready") setStatus("ready");
    };

    sky.addEventListener("wz-sky-status", handleSkyStatus);
    customElements.whenDefined("wz-sky").then(syncSky).catch(() => setStatus("fallback"));
    syncSky();

    return () => sky.removeEventListener("wz-sky-status", handleSkyStatus);
  }, [scene, shaderActive]);

  const classNames = [styles.field, className].filter(Boolean).join(" ");
  const sceneStyle = useMemo(
    () => ({
      "--page-atmosphere-opacity": scene?.opacity ?? 0,
    }) as CSSProperties,
    [scene?.opacity],
  );

  return (
    <div
      className={classNames}
      data-page-atmosphere={visible ? "active" : "idle"}
      data-page-atmosphere-scene={scene?.name ?? "sky"}
      aria-hidden="true"
      style={sceneStyle}
    >
      <div className={styles.fallback} />
      <div className={styles.dither} />
      {createElement("wz-sky", {
        ref: skyRef,
        className: styles.shader,
        "aria-hidden": "true",
      })}
    </div>
  );
}
