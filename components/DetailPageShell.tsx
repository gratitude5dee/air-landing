import Link from "next/link";
import type { ReactNode } from "react";

import { Footer, Header } from "@/components/Chrome";
import { PreorderButton } from "@/components/Preorder";

import styles from "./DetailPageShell.module.css";

export type DetailPage = "how-it-works" | "text-to-film" | "capabilities";

type DetailPageShellProps = {
  current: DetailPage;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

const routes: readonly { href: `/${DetailPage}`; label: string; key: DetailPage }[] = [
  { href: "/how-it-works", label: "How it works", key: "how-it-works" },
  { href: "/text-to-film", label: "Text to film", key: "text-to-film" },
  { href: "/capabilities", label: "Capabilities", key: "capabilities" },
];

/** A shared, server-rendered shell for Air's factual product detail pages. */
export function DetailPageShell({
  current,
  eyebrow,
  title,
  description,
  children,
}: DetailPageShellProps) {
  return (
    <div className={styles.page}>
      <Header />
      <main id="main">
        <div id="top" />
        <section className={styles.hero} data-air-scene="pearl" aria-labelledby="detail-page-title">
          <div className={styles.heroGlow} aria-hidden />
          <div className={styles.heroGrid} aria-hidden />
          <div className={`shell ${styles.heroInner}`}>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="detail-page-title">{title}</h1>
            <p className={styles.heroDescription}>{description}</p>
            <div className={styles.heroActions}>
              <PreorderButton />
              <a className={styles.jumpLink} href="#page-story">Explore the proof <span aria-hidden>↓</span></a>
            </div>
          </div>
        </section>
        <nav className={`shell ${styles.pageNav}`} aria-label="Explore Air">
          <span>Explore Air</span>
          <div>
            {routes.map((route) => (
              <Link aria-current={route.key === current ? "page" : undefined} href={route.href} key={route.key}>
                {route.label}
              </Link>
            ))}
          </div>
        </nav>
        <div id="page-story" className={styles.story}>{children}</div>
        <section className={styles.cta} data-air-scene="cloud" aria-labelledby="detail-cta-title">
          <div className={styles.ctaHorizon} aria-hidden />
          <div className={`shell ${styles.ctaInner}`}>
            <span className={styles.ctaOrb} aria-hidden>✦</span>
            <p className="eyebrow">Air is taking shape now</p>
            <h2 id="detail-cta-title">Keep the next idea moving.</h2>
            <p>Reserve early access, then choose a short onboarding conversation with WZRD.</p>
            <PreorderButton />
            <small>No payment today · founding access is limited</small>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function DetailArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link className={styles.detailArrowLink} href={href}>{children} <span aria-hidden>↗</span></Link>;
}
