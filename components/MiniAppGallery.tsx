"use client";

import dynamic from "next/dynamic";
import { type KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import { LuArrowUpRight, LuX } from "react-icons/lu";

import { MiniAppIcon } from "@/components/MiniAppIcon";
import { PreorderButton } from "@/components/Preorder";
import type { MiniAppDomeItem } from "@/lib/mini-apps";

import styles from "./MiniAppGallery.module.css";

const MiniAppDome = dynamic(() => import("./MiniAppDome"), {
  ssr: false,
  loading: () => <div className={styles.domeLoading} aria-hidden="true" />,
});

type ConnectionWithSaveData = EventTarget & { saveData?: boolean };

function wrapIndex(index: number, length: number) {
  return ((index % length) + length) % length;
}

export function MiniAppGallery({ items }: { items: readonly MiniAppDomeItem[] }) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const staticCatalogRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogHeadingRef = useRef<HTMLHeadingElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const previousEnhancedRef = useRef(false);
  const suppressRestoreRef = useRef(false);
  const [nearViewport, setNearViewport] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dialogIndex, setDialogIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const selectApp = useCallback((nextIndex: number) => {
    const normalized = wrapIndex(nextIndex, items.length);
    setActiveIndex(normalized);
    const app = items[normalized];
    setAnnouncement(`${app.name}, ${normalized + 1} of ${items.length}, ${app.availability}.`);
  }, [items]);

  const closeDetails = useCallback((restoreFocus = true) => {
    suppressRestoreRef.current = !restoreFocus;
    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    setDialogIndex(null);
  }, []);

  const openDetails = useCallback((index: number, trigger: HTMLElement) => {
    triggerRef.current = trigger;
    selectApp(index);
    setDialogIndex(wrapIndex(index, items.length));
  }, [items.length, selectApp]);

  useEffect(() => {
    const node = galleryRef.current;
    if (!node || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNearViewport(entry.isIntersecting),
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 960px)");
    const hover = window.matchMedia("(hover: hover)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: ConnectionWithSaveData }).connection;

    const updateEligibility = () => {
      const supportsThreeDimensions = CSS.supports("transform-style", "preserve-3d");
      setEnhanced(
        nearViewport &&
          desktop.matches &&
          hover.matches &&
          finePointer.matches &&
          !reducedMotion.matches &&
          !forcedColors.matches &&
          !connection?.saveData &&
          supportsThreeDimensions,
      );
    };

    updateEligibility();
    const media = [desktop, hover, finePointer, reducedMotion, forcedColors];
    media.forEach((query) => query.addEventListener("change", updateEligibility));
    connection?.addEventListener("change", updateEligibility);
    return () => {
      media.forEach((query) => query.removeEventListener("change", updateEligibility));
      connection?.removeEventListener("change", updateEligibility);
    };
  }, [nearViewport]);

  useEffect(() => {
    if (previousEnhancedRef.current && !enhanced && document.activeElement?.closest(`.${styles.domeShell}`)) {
      const app = items[activeIndex];
      requestAnimationFrame(() => {
        staticCatalogRef.current
          ?.querySelector<HTMLButtonElement>(`[data-mini-app-id="${app.id}"]`)
          ?.focus({ preventScroll: true });
      });
    }
    previousEnhancedRef.current = enhanced;
  }, [activeIndex, enhanced, items]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (dialogIndex === null) {
      if (dialog.open) dialog.close();
      return;
    }
    if (!dialog.open) dialog.showModal();
    const frame = window.requestAnimationFrame(() => dialogHeadingRef.current?.focus({ preventScroll: true }));
    return () => window.cancelAnimationFrame(frame);
  }, [dialogIndex]);

  const handleDialogClose = () => {
    setDialogIndex(null);
    if (!suppressRestoreRef.current) {
      window.requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
    }
    suppressRestoreRef.current = false;
  };

  const currentApp = dialogIndex === null ? null : items[dialogIndex];

  return (
    <div ref={galleryRef} className={styles.gallery}>
      <div className={styles.galleryCaption}>
        <span>First-party Air Mini Apps</span>
        <span>Private beta</span>
      </div>

      {enhanced ? (
        <MiniAppDome
          activeIndex={activeIndex}
          items={items}
          onOpen={openDetails}
          onSelect={selectApp}
        />
      ) : (
        <ul ref={staticCatalogRef} className={styles.staticCatalog} aria-label="Air Mini Apps">
          {items.map((app, index) => (
            <li key={app.id}>
              <button
                type="button"
                data-mini-app-id={app.id}
                onClick={(event) => openDetails(index, event.currentTarget)}
              >
                <span className={styles.staticIcon}><MiniAppIcon iconKey={app.iconKey} /></span>
                <span className={styles.staticCopy}>
                  <strong>{app.name}</strong>
                  <small>{app.safeguard ?? "First-party Mini App"}</small>
                </span>
                <LuArrowUpRight aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className={styles.liveRegion} aria-live="polite" aria-atomic="true">{announcement}</p>

      <dialog
        ref={dialogRef}
        className={styles.appDialog}
        aria-labelledby="mini-app-dialog-title"
        aria-describedby="mini-app-dialog-description"
        onCancel={(event) => {
          event.preventDefault();
          closeDetails();
        }}
        onClose={handleDialogClose}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDetails();
        }}
      >
        {currentApp && (
          <div className={styles.appDialogPanel}>
            <button className={styles.appDialogClose} type="button" onClick={() => closeDetails()} aria-label="Close Mini App details">
              <LuX aria-hidden />
            </button>
            <span className={styles.dialogIcon}><MiniAppIcon iconKey={currentApp.iconKey} /></span>
            <p className={styles.dialogEyebrow}>First-party Mini App · {currentApp.availability}</p>
            <h3 ref={dialogHeadingRef} id="mini-app-dialog-title" tabIndex={-1}>{currentApp.name}</h3>
            <p id="mini-app-dialog-description">{currentApp.summary}</p>
            {currentApp.safeguard && <span className={styles.safeguard}>{currentApp.safeguard}</span>}
            <PreorderButton label="Join the private beta" onBeforeOpen={() => closeDetails(false)} />
          </div>
        )}
      </dialog>
    </div>
  );
}
