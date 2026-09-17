"use client";

import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight, LuMove, LuScan } from "react-icons/lu";

import { DriftWall, type DriftWallItem } from "@/components/DriftWall";
import { PreorderPlasmaButton } from "@/components/Preorder";
import { VaultReveal } from "@/components/VaultReveal";
import styles from "./MiniAppShowcase.module.css";

const wallItems: readonly DriftWallItem[] = [
  {
    image: "/media/air/v2026-09-17-b/mini-apps/create.jpg",
    eyebrow: "01 / MAKE",
    title: "Create",
    description: "Turn references, files, and a rough idea into launch-ready creative work.",
    accent: "#168ed1",
  },
  {
    image: "/media/air/v2026-09-17-b/mini-apps/inbox.jpg",
    eyebrow: "02 / RESPOND",
    title: "Inbox",
    description: "Triage chosen threads, catch up fast, and review prepared replies before sending.",
    accent: "#5d73ff",
  },
  {
    image: "/media/air/v2026-09-17-b/mini-apps/shop.jpg",
    eyebrow: "03 / LAUNCH",
    title: "Shop",
    description: "Compare products and compose a storefront, checkout, and launch story in one place.",
    accent: "#3c9b69",
  },
  {
    image: "/media/air/v2026-09-17-b/mini-apps/zap.jpg",
    eyebrow: "04 / AUTOMATE",
    title: "Zap",
    description: "Connect a trigger to repeatable work while keeping every handoff visible.",
    accent: "#ee9a25",
  },
  {
    image: "/media/air/v2026-09-17-b/mini-apps/trade.jpg",
    eyebrow: "05 / REVIEW",
    title: "Trade",
    description: "Bring research, scenarios, and risk context together before approving a move.",
    accent: "#6468d4",
  },
] as const;

export function MiniAppShowcase() {
  return (
    <section className={styles.section} id="mini-app-showcase" aria-labelledby="mini-app-showcase-title">
      <Image className={styles.cloudBackdrop} src="/images/landing-clouds-v2.webp" alt="" fill sizes="100vw" />
      <div className={styles.skyWash} aria-hidden="true" />
      <div className={styles.embossMark} aria-hidden="true">MINI APPS</div>
      <div className={styles.chromaticFloor} aria-hidden="true" />

      <div className={styles.shell}>
        <VaultReveal className={styles.heading}>
          <div>
            <p>MINI APPS / YOUR AIR, YOUR WAY</p>
            <h2 id="mini-app-showcase-title">Five focused worlds. One agent already in context.</h2>
          </div>
          <div className={styles.headingSide}>
            <p>Move through the wall. Every tile opens a focused surface built around the thing you want to finish.</p>
            <span><LuMove aria-hidden="true" /> Hover, focus, or tap through the worlds</span>
          </div>
        </VaultReveal>

        <VaultReveal className={styles.wallStage} delay={120}>
          <DriftWall
            className={styles.fullWall}
            items={wallItems}
            columns={5}
            tileWidth={190}
            tileHeight={268}
            gap={16}
            speed={12}
            variance={0.28}
            lift={58}
            dim={0.8}
            fade={0.3}
            tilt={9}
            turn={-7}
            depth={72}
          />
          <div className={styles.wallBadge} aria-hidden="true"><LuScan /><span>Five live surfaces</span></div>
        </VaultReveal>

        <VaultReveal className={styles.actionRail} delay={180}>
          <div>
            <span>PRIVATE BETA</span>
            <strong>Start with one Mini App. Keep the context as the work changes.</strong>
          </div>
          <div className={styles.actions}>
            <PreorderPlasmaButton label="Try Air for free" />
            <Link href="/how-it-works#mini-apps">Explore every Mini App <LuArrowUpRight aria-hidden="true" /></Link>
          </div>
        </VaultReveal>

        <VaultReveal className={styles.trustBar} delay={220}>
          <div><span>PERSISTENT CONTEXT</span><span>APPROVAL REQUIRED WHEN IT MATTERS</span><span>OPTIMIZED FOR PHONE + DESKTOP</span></div>
          <div>
            <a href="https://agenthunt.com/" target="_blank" rel="noreferrer">Explore Agent Hunt <LuArrowUpRight aria-hidden="true" /></a>
            <a href="https://www.5-dee.com/" target="_blank" rel="noreferrer">Built by 5DEE Studios <LuArrowUpRight aria-hidden="true" /></a>
          </div>
        </VaultReveal>
      </div>
    </section>
  );
}
