import Link from "next/link";
import type { ReactNode } from "react";

import { DocsPager } from "@/components/DocsPager";
import { docPages, docSections, findDocPage } from "@/content/docs";

import styles from "./DocsShell.module.css";

/**
 * Wraps one MDX documentation page: title and lead pulled from the registry so
 * the sidebar, header, and metadata never drift apart, then prev/next links.
 */
export function DocArticle({ href, children }: { href: string; children: ReactNode }) {
  const page = findDocPage(href);
  if (!page) {
    throw new Error(`DocArticle: ${href} is not registered in content/docs.ts`);
  }
  const section = docSections.find((entry) => entry.id === page.section);

  return (
    <article className={styles.article}>
      <header className={styles.articleHeader}>
        <div className={styles.articleRail}>
          <span>{section?.label}</span>
          <span>air.wzrd.tech/docs</span>
        </div>
        <h1>{page.title}</h1>
        <p className={styles.articleLead}>{page.summary}</p>
      </header>
      {children}
      <DocsPager href={page.href} />
    </article>
  );
}

/** Card grid linking to every page except the current one; used on the overview. */
export function DocCards({ exclude }: { exclude?: string }) {
  return (
    <div className={styles.cards}>
      {docPages
        .filter((page) => page.href !== exclude)
        .map((page) => (
          <Link key={page.href} href={page.href} className={styles.card}>
            <strong>{page.title}</strong>
            <p>{page.summary}</p>
          </Link>
        ))}
    </div>
  );
}
