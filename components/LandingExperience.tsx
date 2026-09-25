"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LuArrowUpRight } from "react-icons/lu";

import { PreorderPlasmaButton } from "@/components/Preorder";
import { AccordionGallery, type AccordionGalleryItem } from "@/components/AccordionGallery";
import { AppOrbPlayground } from "@/components/AppOrbPlayground";
import { MiniAppShowcase } from "@/components/MiniAppShowcase";
import { MobileAirIntro } from "@/components/MobileAirIntro";
import { VaultReveal } from "@/components/VaultReveal";
import { AIR_HERO_TITLE, AIR_PRODUCT_DESCRIPTION } from "@/lib/air-copy";
import styles from "./LandingExperience.module.css";

const LEGACY_HASHES = new Set([
  "agent-control-plane",
  "capabilities",
  "composable-computer",
  "faq",
  "imessage",
  "mini-apps",
  "pricing",
  "privacy",
  "roadmap",
  "what-is-air",
]);

const workspaceGallery: readonly AccordionGalleryItem[] = [
  {
    image: "/media/air/v2026-09-17-b/workspace/create.jpg",
    label: "Create",
    description: "Turn a thought, link, image, or file into a useful next move.",
    link: "/how-it-works#mini-apps",
    alt: "A creative professional shaping a launch concept with an AI workspace",
  },
  {
    image: "/media/air/v2026-09-17-b/workspace/organize.jpg",
    label: "Organize",
    description: "Keep the context, files, decisions, and tools together as the work changes.",
    link: "/composable-computer",
    alt: "A tactile system of project context organized around a blue glass core",
  },
  {
    image: "/media/air/v2026-09-17-b/workspace/continue.jpg",
    label: "Continue",
    description: "Return to the same workspace and review consequential actions before they happen.",
    link: "/how-it-works#agent-control-plane",
    alt: "A continuous path of review checkpoints leading toward a luminous gate",
  },
] as const;

export function LandingExperience() {
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const redirectLegacyHash = () => {
      const hash = window.location.hash.slice(1);
      if (LEGACY_HASHES.has(hash)) window.location.replace(`/how-it-works#${hash}`);
    };
    redirectLegacyHash();
    window.addEventListener("hashchange", redirectLegacyHash);
    return () => window.removeEventListener("hashchange", redirectLegacyHash);
  }, []);

  useEffect(() => {
    const complete = () => setIntroComplete(true);
    const fallback = window.setTimeout(complete, 7000);
    window.addEventListener("air:intro-complete", complete);
    return () => {
      window.clearTimeout(fallback);
      window.removeEventListener("air:intro-complete", complete);
    };
  }, []);

  return (
    <main id="main" className={styles.main}>
      <MobileAirIntro />
      <div id="top" />
      <section className={styles.hero} data-intro-complete={introComplete} aria-labelledby="landing-title">
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            src="/media/air/v2026-09-19/hero/air-sanctuary-2x.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.sceneWrap}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>AIR BY WZRD.TECH · PRIVATE BETA</p>
            <h1 id="landing-title">{AIR_HERO_TITLE}</h1>
            <p>{AIR_PRODUCT_DESCRIPTION}</p>
            <div className={styles.actions}>
              <PreorderPlasmaButton label="Try Air for free" />
              <Link href="/how-it-works">See how it works <LuArrowUpRight aria-hidden /></Link>
            </div>
            <a
              className={styles.productHuntBadge}
              href="https://www.producthunt.com/products/air-by-wzrd-tech?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-air-by-wzrd-tech"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                alt="air by WZRD.tech - your personal creative assistant | Product Hunt"
                width="250"
                height="54"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1260479&theme=light&t=1790346847861"
              />
            </a>
          </div>
        </div>
        <a className={styles.scrollCue} href="https://avatar.wzrd.tech">Play the Air mini-game <LuArrowUpRight aria-hidden /></a>
      </section>

      <div id="app-orbs"><AppOrbPlayground /></div>

      <MiniAppShowcase />

      <section id="why-air" className={styles.benefits} aria-labelledby="why-air-title">
        <div className={styles.benefitsEmboss} aria-hidden="true">FLOW</div>
        <div className={styles.benefitsChroma} aria-hidden="true" />
        <VaultReveal className={styles.benefitsIntro}>
          <p className={styles.eyebrow}>ONE CONTINUOUS WORKSPACE</p>
          <h2 id="why-air-title">Give Air the outcome. Keep your attention on the work.</h2>
        </VaultReveal>
        <VaultReveal className={styles.workspaceGallery} delay={120}>
          <AccordionGallery items={workspaceGallery} defaultIndex={0} height={520} expandRatio={.58} trigger="hover" />
        </VaultReveal>
        <VaultReveal className={styles.storyRail} delay={180}>
          <span>03 / KEEP THE THREAD</span>
          <Link className={styles.storyLink} href="/how-it-works">Walk through the complete Air experience <LuArrowUpRight aria-hidden /></Link>
        </VaultReveal>
      </section>
    </main>
  );
}
