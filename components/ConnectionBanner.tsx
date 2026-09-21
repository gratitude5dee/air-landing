import Link from "next/link";
import { LuArrowDown } from "react-icons/lu";

import styles from "./ConnectionBanner.module.css";

export function ConnectionBanner() {
  return (
    <Link className={styles.banner} href="#muse-connect">
      <span>Connect your Air to Muse, Codex, Claude, etc!</span>
      <LuArrowDown aria-hidden="true" />
    </Link>
  );
}
