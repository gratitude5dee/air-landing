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

const routes: readonly { href: `/${DetailPage}`; label: string; key: DetailPage; number: string }[] = [
  { href: "/how-it-works", label: "How it works", key: "how-it-works", number: "01" },
  { href: "/text-to-film", label: "Text to film", key: "text-to-film", number: "02" },
  { href: "/capabilities", label: "Capabilities", key: "capabilities", number: "03" },
];

/** A shared, server-rendered editorial shell for Air's factual product pages. */
export function DetailPageShell({
  current,
  eyebrow,
  title,
  description,
  children,
}: DetailPageShellProps) {
  const route = routes.find((item) => item.key === current) ?? routes[0];

  return (
    <div className={styles.page} data-detail-page={current}>
      <Header />
      <main id="main">
        <div id="top" />
        <section
          className={styles.hero}
          data-air-scene="pearl"
          data-air-cloud-progress="0.84"
          data-air-cloud-rays="0.12"
          data-air-cloud-opacity="0.2"
          aria-labelledby="detail-page-title"
        >
          <div className={styles.heroHorizon} aria-hidden />
          <div className={styles.heroGrid} aria-hidden />
          <div className={`shell ${styles.heroInner}`}>
            <div className={styles.heroRail}>
              <span>Air / WZRD.tech</span>
              <span>{route.number} / 03 · {route.label}</span>
            </div>
            <p className="eyebrow">{eyebrow}</p>
            <h1 id="detail-page-title">{title}</h1>
            <p className={styles.heroDescription}>{description}</p>
            <div className={styles.heroActions}>
              <PreorderButton />
              <a className={styles.jumpLink} href="#page-story">
                Explore the proof <span aria-hidden>↓</span>
              </a>
            </div>
            <p className={styles.heroFootnote}>Private beta · interface previews · approval stays in the loop</p>
          </div>
        </section>

        <nav className={`shell ${styles.pageNav}`} aria-label="Explore Air">
          <span className={styles.pageNavLabel}>Explore Air</span>
          <div>
            {routes.map((item) => (
              <Link aria-current={item.key === current ? "page" : undefined} href={item.href} key={item.key}>
                <span aria-hidden>{item.number}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div id="page-story" className={styles.story}>{children}</div>

        <section
          className={styles.cta}
          data-air-scene="cloud"
          data-air-cloud-progress="0.7"
          data-air-cloud-rays="0.22"
          data-air-cloud-opacity="0.3"
          aria-labelledby="detail-cta-title"
        >
          <div className={styles.ctaCloudbank} aria-hidden />
          <div className={styles.ctaDither} aria-hidden />
          <div className={`shell ${styles.ctaInner}`}>
            <div className={styles.ctaCopy}>
              <p className="eyebrow">Air is taking shape now</p>
              <h2 id="detail-cta-title">Keep the next idea moving.</h2>
              <p>Reserve early access, then choose a short onboarding conversation with WZRD.</p>
              <div className={styles.ctaActions}>
                <PreorderButton />
                <span>No payment today</span>
              </div>
            </div>
            <div className={styles.ctaProof} aria-label="What preorder includes">
              <span className={styles.ctaOrb} aria-hidden>✦</span>
              <p>Founding access</p>
              <ul>
                <li>Private beta</li>
                <li>Approval stays with you</li>
                <li>Short onboarding conversation</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export function DetailArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className={styles.detailArrowLink} href={href}>
      {children} <span aria-hidden>↗</span>
    </Link>
  );
}
