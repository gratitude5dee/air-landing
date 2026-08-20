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

function canUseAmbientCursor() {
  const connection = navigator as NavigatorWithConnection;

  return (
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    !window.matchMedia("(forced-colors: active)").matches &&
    !connection.connection?.saveData
  );
}

/**
 * A pointer-modality-only, decorative cursor field. It intentionally does not
 * mount for keyboard-only sessions; a keyboard interaction removes an active
 * field until the visitor next moves a fine pointer.
 */
export function AmbientCursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const connection = (navigator as NavigatorWithConnection).connection;
    const media = [
      window.matchMedia("(hover: hover) and (pointer: fine)"),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
      window.matchMedia("(forced-colors: active)"),
    ];

    const disableIfUnsupported = () => {
      if (!canUseAmbientCursor()) setEnabled(false);
    };

    const enableForPointer = (event: PointerEvent) => {
      if (event.pointerType === "touch" || !canUseAmbientCursor()) return;
      setEnabled(true);
    };

    const disableForKeyboard = () => setEnabled(false);

    window.addEventListener("pointermove", enableForPointer, { passive: true });
    window.addEventListener("keydown", disableForKeyboard, { passive: true });
    media.forEach((query) => query.addEventListener("change", disableIfUnsupported));
    connection?.addEventListener?.("change", disableIfUnsupported);

    return () => {
      window.removeEventListener("pointermove", enableForPointer);
      window.removeEventListener("keydown", disableForKeyboard);
      media.forEach((query) => query.removeEventListener("change", disableIfUnsupported));
      connection?.removeEventListener?.("change", disableIfUnsupported);
    };
  }, []);

  if (!enabled) return null;

  return createElement("dk-bubble", {
    "aria-hidden": "true",
    className: styles.field,
    viewport: "",
    from: "night",
    pixel: "6",
    size: "78",
    trail: "16",
    idle: "520",
    fps: "30",
    bloom: "off",
  });
}
