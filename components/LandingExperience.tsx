"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { LuArrowDown, LuArrowUpRight, LuCalendarDays, LuMessageCircle, LuRefreshCw, LuSparkles } from "react-icons/lu";

import { PreorderPlasmaButton } from "@/components/Preorder";
import { AppOrbPlayground } from "@/components/AppOrbPlayground";
import { LandingCloudShader } from "@/components/LandingCloudShader";
import { AIR_PRODUCT_DESCRIPTION, AIR_TAGLINE } from "@/lib/air-copy";
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

const artifacts = [
  { kind: "image", src: "/media/air/v2026-08-19-a/directions/blue-hour/01-first.webp", label: "Creative reference", x: "15%", y: "20%", size: "5.6rem", rotate: "-11deg", delay: "80ms" },
  { kind: "note", label: "Launch plan", x: "35%", y: "7%", size: "5.2rem", rotate: "8deg", delay: "210ms" },
  { kind: "message", label: "Bring back what needs my review", x: "59%", y: "16%", size: "8.2rem", rotate: "4deg", delay: "330ms" },
  { kind: "image", src: "/media/air/v2026-08-19-a/directions/golden-gate/02-creator.webp", label: "Project image", x: "79%", y: "8%", size: "5rem", rotate: "12deg", delay: "460ms" },
  { kind: "calendar", label: "Review · 2:30", x: "82%", y: "36%", size: "6.6rem", rotate: "-7deg", delay: "560ms" },
  { kind: "image", src: "/media/air/v2026-08-19-a/directions/chrome-launch/03-orbit.webp", label: "Visual direction", x: "71%", y: "60%", size: "5.7rem", rotate: "9deg", delay: "690ms" },
  { kind: "spark", label: "Ready to review", x: "47%", y: "58%", size: "5.1rem", rotate: "-4deg", delay: "810ms" },
  { kind: "image", src: "/media/air/v2026-08-19-a/directions/blue-hour/02-hands.webp", label: "Working file", x: "20%", y: "58%", size: "6.2rem", rotate: "7deg", delay: "920ms" },
  { kind: "message", label: "Keep this moving", x: "5%", y: "43%", size: "7.2rem", rotate: "-8deg", delay: "1030ms" },
] as const;

type ArtifactStyle = CSSProperties & {
  "--artifact-x": string;
  "--artifact-y": string;
  "--artifact-size": string;
  "--artifact-rotate": string;
  "--artifact-delay": string;
};

function Artifact({ artifact }: { artifact: (typeof artifacts)[number] }) {
  const style: ArtifactStyle = {
    "--artifact-x": artifact.x,
    "--artifact-y": artifact.y,
    "--artifact-size": artifact.size,
    "--artifact-rotate": artifact.rotate,
    "--artifact-delay": artifact.delay,
  };

  return (
    <div className={`${styles.artifact} ${styles[artifact.kind]}`} style={style} aria-hidden="true">
      {artifact.kind === "image" && "src" in artifact ? (
        <Image src={artifact.src} alt="" fill sizes="112px" />
      ) : artifact.kind === "note" ? (
        <><span>Notes</span><strong>{artifact.label}</strong><i /></>
      ) : artifact.kind === "calendar" ? (
        <><LuCalendarDays /><span>{artifact.label}</span></>
      ) : artifact.kind === "spark" ? (
        <><LuSparkles /><span>{artifact.label}</span></>
      ) : (
        <><LuMessageCircle /><span>{artifact.label}</span></>
      )}
    </div>
  );
}

export function LandingExperience() {
  const [run, setRun] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const redirectLegacyHash = () => {
      const hash = window.location.hash.slice(1);
      if (LEGACY_HASHES.has(hash)) window.location.replace(`/how-it-works#${hash}`);
    };
    redirectLegacyHash();
    window.addEventListener("hashchange", redirectLegacyHash);
    return () => window.removeEventListener("hashchange", redirectLegacyHash);
  }, []);

  const replay = useCallback(() => {
    setRun((current) => current + 1);
    sceneRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <main id="main" className={styles.main}>
      <div id="top" />
      <section className={styles.hero} aria-labelledby="landing-title">
        <LandingCloudShader />
        <div className={styles.sceneWrap}>
          <div ref={sceneRef} className={styles.scene} data-run={run} tabIndex={-1}>
            <div className={styles.wordmark} aria-hidden="true">AIR</div>
            <div className={styles.artifactField} key={run}>
              {artifacts.map((artifact) => <Artifact artifact={artifact} key={`${artifact.label}-${run}`} />)}
            </div>
            <button className={styles.orbButton} type="button" onClick={replay} aria-label="Replay the Air workspace animation">
              <span className={styles.orb} aria-hidden="true"><LuRefreshCw /></span>
              <span>replay</span>
            </button>
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>AIR BY WZRD.TECH · PRIVATE BETA</p>
            <h1 id="landing-title">{AIR_TAGLINE}</h1>
            <p>{AIR_PRODUCT_DESCRIPTION}</p>
            <div className={styles.actions}>
              <PreorderPlasmaButton label="Try Air for free" />
              <Link href="/how-it-works">See how it works <LuArrowUpRight aria-hidden /></Link>
            </div>
          </div>
        </div>
        <a className={styles.scrollCue} href="#app-orbs">Bring your apps into orbit <LuArrowDown aria-hidden /></a>
        <div className={styles.clouds} aria-hidden="true"><span /><span /><span /><span /></div>
      </section>

      <div id="app-orbs"><AppOrbPlayground /></div>

      <section id="why-air" className={styles.benefits} aria-labelledby="why-air-title">
        <div className={styles.benefitsIntro}>
          <p className={styles.eyebrow}>ONE CONTINUOUS WORKSPACE</p>
          <h2 id="why-air-title">Give Air the outcome. Keep your attention on the work.</h2>
        </div>
        <div className={styles.benefitGrid}>
          <article><span>01</span><h3>Create</h3><p>Turn a thought, link, image, or file into a useful next move.</p></article>
          <article><span>02</span><h3>Organize</h3><p>Keep the context, files, decisions, and tools together as the job changes.</p></article>
          <article><span>03</span><h3>Continue</h3><p>Return to the same workspace and review consequential actions before they happen.</p></article>
        </div>
        <Link className={styles.storyLink} href="/how-it-works">Walk through the complete Air experience <LuArrowUpRight aria-hidden /></Link>
      </section>
    </main>
  );
}
