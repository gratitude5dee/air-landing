import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";

import styles from "./ShinyText.module.css";

type ShinyTextProps = Omit<ComponentPropsWithoutRef<"span">, "children" | "color"> & {
  children?: ReactNode;
  text?: string;
  disabled?: boolean;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
};

/**
 * A CSS-only, low-cost text highlight inspired by React Bits' ShinyText.
 * It avoids a render-loop dependency, making it safe to reuse in landing copy
 * without adding per-frame JavaScript work.
 */
export function ShinyText({
  children,
  className,
  color = "currentColor",
  delay = 0,
  direction = "left",
  disabled = false,
  pauseOnHover = false,
  shineColor = "#ffffff",
  speed = 3.6,
  spread = 120,
  style,
  text,
  yoyo = false,
  ...spanProps
}: ShinyTextProps) {
  const content = text ?? children;
  // The sheen is a separate, decorative layer so the base text never becomes
  // transparent. That keeps a stable contrast ratio while the highlight moves
  // across it, and avoids duplicating arbitrary React content in the overlay.
  const sheenContent =
    typeof content === "string" || typeof content === "number" ? String(content) : null;

  const animationDirection = yoyo
    ? direction === "left"
      ? "alternate"
      : "alternate-reverse"
    : direction === "left"
      ? "normal"
      : "reverse";

  const shinyStyle = {
    ...style,
    "--shiny-color": color,
    "--shiny-shine": shineColor,
    "--shiny-angle": `${spread}deg`,
    "--shiny-speed": `${Math.max(speed, 0.1)}s`,
    "--shiny-delay": `${Math.max(delay, 0)}s`,
    "--shiny-direction": animationDirection,
  } as CSSProperties;

  return (
    <span
      {...spanProps}
      className={[styles.shiny, disabled && styles.disabled, pauseOnHover && styles.pauseOnHover, className]
        .filter(Boolean)
        .join(" ")}
      style={shinyStyle}
    >
      <span className={styles.content}>{content}</span>
      {sheenContent ? (
        <span className={styles.sheen} aria-hidden="true">
          {sheenContent}
        </span>
      ) : null}
    </span>
  );
}
