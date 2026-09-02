import Link from "next/link";

import { adjacentDocPages } from "@/content/docs";

import styles from "./DocsShell.module.css";

export function DocsPager({ href }: { href: string }) {
  const { previous, next } = adjacentDocPages(href);
  if (!previous && !next) return null;

  return (
    <nav className={styles.pager} aria-label="Previous and next pages">
      {previous ? (
        <Link href={previous.href} rel="prev">
          <span>Previous</span>
          {previous.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} rel="next" className={styles.pagerNext}>
          <span>Next</span>
          {next.title}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
