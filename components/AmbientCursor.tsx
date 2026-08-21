"use client";

import { createElement, useEffect, useState } from "react";

import styles from "./AmbientCursor.module.css";

type NavigatorWithConnection = Navigator & {
  connection?: {
    saveData?: boolean;
    addEventListener?: (type: "change", listener: EventListener) => void;
    removeEventListener?: (type: "change", listener: EventListener) => void;
  };
};

type LegacyMediaQueryList = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

function subscribeToMediaQuery(
  query: LegacyMediaQueryList,
  listener: (event: MediaQueryListEvent) => void,
) {
  if (query.addEventListener) {
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }

  query.addListener?.(listener);
  return () => query.removeListener?.(listener);
}

/**
 * A pointer-modality-only, decorative cursor field. It intentionally does not
 * mount for keyboard-only sessions. The field wakes only after a fine pointer
 * moves and unmounts for keyboard, modal, reduced-data, and hidden-page modes.
 */
export function AmbientCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)") as LegacyMediaQueryList;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)") as LegacyMediaQueryList;
    const forcedColors = window.matchMedia("(forced-colors: active)") as LegacyMediaQueryList;

    const canUseAmbientCursor = () => (
      finePointer.matches &&
      !reducedMotion.matches &&
      !forcedColors.matches &&
      !connection?.saveData &&
      document.documentElement.dataset.airSaveData !== "true" &&
      !document.body.classList.contains("modal-open") &&
      !document.body.classList.contains("intro-open") &&
      !document.hidden
    );

    const disableIfUnsupported = () => {
      if (!canUseAmbientCursor()) {
        setEnabled(false);
      }
    };

    const enableForPointer = (event: PointerEvent) => {
      if (
        !event.isPrimary ||
        (event.pointerType !== "mouse" && event.pointerType !== "pen") ||
        !canUseAmbientCursor()
      ) {
        return;
      }

      setEnabled(true);
    };

    const disableForKeyboard = () => setEnabled(false);
    const disableForHiddenPage = () => {
      if (document.hidden) setEnabled(false);
    };
    const stateObserver = new MutationObserver(disableIfUnsupported);

    window.addEventListener("pointermove", enableForPointer, { passive: true });
    window.addEventListener("keydown", disableForKeyboard, { passive: true });
    document.addEventListener("visibilitychange", disableForHiddenPage, { passive: true });
    const unsubscribeMedia = [finePointer, reducedMotion, forcedColors]
      .map((query) => subscribeToMediaQuery(query, disableIfUnsupported));
    connection?.addEventListener?.("change", disableIfUnsupported);
    stateObserver.observe(document.documentElement, {
      attributeFilter: ["data-air-save-data"],
      attributes: true,
    });
    stateObserver.observe(document.body, {
      attributeFilter: ["class"],
      attributes: true,
    });

    return () => {
      window.removeEventListener("pointermove", enableForPointer);
      window.removeEventListener("keydown", disableForKeyboard);
      document.removeEventListener("visibilitychange", disableForHiddenPage);
      unsubscribeMedia.forEach((unsubscribe) => unsubscribe());
      connection?.removeEventListener?.("change", disableIfUnsupported);
      stateObserver.disconnect();
    };
  }, []);

  if (!enabled) return null;

  return createElement("dk-bubble", {
    "aria-hidden": "true",
    "data-air-ambient-cursor": "active",
    className: styles.field,
    viewport: "",
    from: "night",
    fade: "",
    pixel: "8",
    size: "72",
    trail: "14",
    idle: "460",
    fps: "24",
    bloom: "off",
    tabIndex: -1,
  });
}
