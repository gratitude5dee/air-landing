"use client";

import type { CSSProperties } from "react";

const visuallyHidden: CSSProperties = {
  position: "fixed",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function LiveAnnouncer({ message }: { message: string }) {
  return (
    <p aria-live="polite" aria-atomic="true" style={visuallyHidden}>
      {message}
    </p>
  );
}
