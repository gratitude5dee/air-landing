import type { CSSProperties } from "react";

import styles from "./MiniAppArtIcon.module.css";

const atlasSlots: Record<string, readonly [number, number]> = {
  computer: [0, 0],
  browser: [1, 0],
  calendar: [2, 0],
  inbox: [3, 0],
  people: [0, 1],
  analytics: [1, 1],
  image: [2, 1],
  video: [3, 1],
  secrets: [0, 2],
  connect: [1, 2],
  pay: [2, 2],
  storefront: [3, 2],
};

export function MiniAppArtIcon({ iconKey }: { iconKey: string }) {
  const [column, row] = atlasSlots[iconKey] ?? atlasSlots.computer;
  const style = {
    "--atlas-x": `${(column / 3) * 100}%`,
    "--atlas-y": `${(row / 2) * 100}%`,
  } as CSSProperties;

  return <span className={styles.icon} style={style} aria-hidden="true" />;
}
