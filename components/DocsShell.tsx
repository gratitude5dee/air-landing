import Link from "next/link";
import type { ReactNode } from "react";

import { Footer, Header } from "@/components/Chrome";
import { DocsSidebarNav } from "@/components/DocsSidebarNav";
import { PreorderButton } from "@/components/Preorder";
import { docPages, docSections } from "@/content/docs";

import styles from "./DocsShell.module.css";

export function DocsShell({ children }: { children: ReactNode }) {
  const groups = docSections.map((section) => ({
    ...section,
    pages: docPages.filter((page) => page.section === section.id),
  }));

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Header />
      <div id="top" className={styles.page}>
        <div className={`shell ${styles.frame}`}>
          <aside className={styles.sidebar} aria-label="Documentation">
            <div className={styles.sidebarHeader}>
              <span className={styles.eyebrow}>Air docs</span>
              <Link href="/docs" className={styles.sidebarTitle}>
                User guide
              </Link>
            </div>
            <DocsSidebarNav groups={groups} />
            <div className={styles.sidebarCta}>
              <p>Air is in early access.</p>
              <PreorderButton compact />
            </div>
          </aside>
          <main id="main" className={styles.main}>
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </>
  );
}
