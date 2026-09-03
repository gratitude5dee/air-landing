"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { DocPage, DocSection } from "@/content/docs";

import styles from "./DocsShell.module.css";

type Group = { id: DocSection; label: string; pages: DocPage[] };

export function DocsSidebarNav({ groups }: { groups: Group[] }) {
  const pathname = (usePathname() ?? "/docs").replace(/\/+$/, "") || "/docs";

  return (
    <nav className={styles.nav} aria-label="Documentation pages">
      {groups.map((group) => (
        <div key={group.id} className={styles.navGroup}>
          <span className={styles.navLabel}>{group.label}</span>
          <ul>
            {group.pages.map((page) => {
              const current = pathname === page.href;
              return (
                <li key={page.href}>
                  <Link href={page.href} aria-current={current ? "page" : undefined}>
                    {page.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
