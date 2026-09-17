"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import {
  LuArrowUpRight,
  LuCheck,
  LuInbox,
  LuMessageCircle,
  LuShoppingBag,
  LuTrendingUp,
  LuWandSparkles,
  LuZap,
} from "react-icons/lu";
import type { IconType } from "react-icons";

import { DriftWall, type DriftWallItem } from "@/components/DriftWall";
import { PreorderPlasmaButton } from "@/components/Preorder";
import styles from "./MiniAppShowcase.module.css";

type MiniApp = {
  id: string;
  name: string;
  Icon: IconType;
  kicker: string;
  title: string;
  body: string;
  status: string;
  proof: readonly string[];
  prompt: string;
  result: string;
  accent: string;
  fragments: readonly { label: string; kind: "note" | "image" | "message" | "metric" }[];
};

const miniApps: readonly MiniApp[] = [
  {
    id: "create",
    name: "Create",
    Icon: LuWandSparkles,
    kicker: "FROM THOUGHT TO SOMETHING REAL",
    title: "Make the thing. Air handles the busywork.",
    body: "Drop in a thought, link, image, or file. Air turns the context into a focused creative workspace you can direct and review.",
    status: "Private beta",
    proof: ["Images + video", "Reusable context", "Publish when ready"],
    prompt: "Turn these references into a launch reel.",
    result: "Storyboard ready to review",
    accent: "#168ed1",
    fragments: [
      { label: "Launch reel", kind: "image" },
      { label: "9:16 cut", kind: "note" },
      { label: "Hook options", kind: "message" },
      { label: "12 scenes", kind: "metric" },
    ],
  },
  {
    id: "inbox",
    name: "Inbox",
    Icon: LuInbox,
    kicker: "THE THREAD, WITHOUT THE TAB SPIRAL",
    title: "Know what matters before you open everything.",
    body: "Air reads the threads you choose, groups the context, and prepares replies without sending until you approve.",
    status: "Private beta",
    proof: ["Priority threads", "Draft replies", "Approval before send"],
    prompt: "Catch me up and draft the three replies.",
    result: "3 drafts waiting for approval",
    accent: "#4c6fff",
    fragments: [
      { label: "Collab request", kind: "message" },
      { label: "Launch update", kind: "note" },
      { label: "3 drafts", kind: "metric" },
      { label: "Needs reply", kind: "message" },
    ],
  },
  {
    id: "shop",
    name: "Shop",
    Icon: LuShoppingBag,
    kicker: "YOUR STOREFRONT, IN CONTEXT",
    title: "Turn an idea into a shop people can actually use.",
    body: "Compose products, checkout, launch assets, and promotion inside one workspace instead of rebuilding the story in every tool.",
    status: "Rolling out",
    proof: ["Products + checkout", "Launch assets", "Revenue in context"],
    prompt: "Build a drop from these three products.",
    result: "Storefront preview is ready",
    accent: "#44a26b",
    fragments: [
      { label: "Drop 001", kind: "image" },
      { label: "3 products", kind: "metric" },
      { label: "Checkout", kind: "note" },
      { label: "Launch copy", kind: "message" },
    ],
  },
  {
    id: "zap",
    name: "Zap",
    Icon: LuZap,
    kicker: "REPEAT THE RESULT, NOT THE SETUP",
    title: "Make the useful part happen again automatically.",
    body: "Connect supported tools, schedule repeat work, and keep the handoff visible. Sensitive actions still stop for your review.",
    status: "Approval aware",
    proof: ["Connected tools", "Schedules", "Visible handoffs"],
    prompt: "Run this every Friday after analytics lands.",
    result: "Workflow staged for Friday",
    accent: "#ef9c2f",
    fragments: [
      { label: "Every Friday", kind: "note" },
      { label: "Analytics", kind: "metric" },
      { label: "Draft recap", kind: "message" },
      { label: "4 connected", kind: "image" },
    ],
  },
  {
    id: "trade",
    name: "Trade",
    Icon: LuTrendingUp,
    kicker: "RESEARCH FIRST. CONFIRM THE MOVE.",
    title: "See the context before anything moves.",
    body: "Bring research, positions, and payment context together. Air can prepare a reviewed action; execution stays approval-required.",
    status: "Approval required",
    proof: ["Fiat + USDC context", "Research view", "Confirm before action"],
    prompt: "Compare the position and prepare the next move.",
    result: "Action prepared — not submitted",
    accent: "#5f63c4",
    fragments: [
      { label: "Position view", kind: "metric" },
      { label: "Risk notes", kind: "note" },
      { label: "USDC", kind: "image" },
      { label: "Confirm first", kind: "message" },
    ],
  },
] as const;

const wallItems: readonly DriftWallItem[] = [
  { image: "/media/air/v2026-08-19-a/directions/blue-hour/01-first.webp", title: "Air blue-hour launch world" },
  { image: "/media/air/v2026-08-19-a/directions/chrome-launch/02-macro.webp", title: "Chrome launch detail" },
  { image: "/media/air/v2026-08-19-a/directions/golden-gate/02-creator.webp", title: "Creator working with Air" },
  { image: "/media/air/v2026-08-19-a/directions/chrome-launch/03-orbit.webp", title: "Air orbital interface" },
  { image: "/media/air/v2026-08-19-a/directions/blue-hour/02-hands.webp", title: "Creative work in motion" },
  { image: "/media/air/v2026-08-19-a/directions/golden-gate/03-bridge.webp", title: "Connected work across tools" },
  { image: "/media/air/v2026-08-19-a/directions/blue-hour/03-city.webp", title: "Persistent workspace at blue hour" },
  { image: "/media/air/v2026-08-19-a/directions/golden-gate/01-first.webp", title: "Air Golden Gate direction" },
  { image: "/media/air/v2026-08-19-a/directions/chrome-launch/01-first.webp", title: "Air chrome launch world" },
  { image: "/media/air/v2026-08-19-a/first-cut/golden-gate-poster.webp", title: "Air launch film" },
] as const;

type AccentStyle = CSSProperties & { "--mini-accent": string };

export function MiniAppShowcase() {
  const [activeId, setActiveId] = useState(miniApps[0].id);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const active = miniApps.find((item) => item.id === activeId) ?? miniApps[0];

  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction) return;
    event.preventDefault();
    const next = (index + direction + miniApps.length) % miniApps.length;
    setActiveId(miniApps[next].id);
    tabsRef.current[next]?.focus();
  };

  return (
    <section className={styles.section} id="mini-app-showcase" aria-labelledby="mini-app-showcase-title">
      <Image className={styles.cloudBackdrop} src="/images/landing-clouds-v2.webp" alt="" fill sizes="100vw" />
      <div className={styles.skyWash} aria-hidden="true" />
      <div className={styles.shell}>
        <div className={styles.heading}>
          <div>
            <p>MINI APPS / YOUR AIR, YOUR WAY</p>
            <h2 id="mini-app-showcase-title">Five modes. One agent that already knows the context.</h2>
          </div>
          <p>Skip the blank chat. Open a focused surface built around the thing you want to finish.</p>
        </div>

        <div className={styles.tabs} role="tablist" aria-label="Explore Air Mini Apps">
          {miniApps.map(({ id, name, Icon }, index) => (
            <button
              ref={(node) => { tabsRef.current[index] = node; }}
              key={id}
              id={`mini-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={active.id === id}
              aria-controls="mini-app-panel"
              tabIndex={active.id === id ? 0 : -1}
              onClick={() => setActiveId(id)}
              onKeyDown={(event) => moveTab(event, index)}
            >
              <span><Icon aria-hidden="true" /></span>{name}
            </button>
          ))}
        </div>

        <div
          className={styles.productStage}
          id="mini-app-panel"
          role="tabpanel"
          aria-labelledby={`mini-tab-${active.id}`}
          style={{ "--mini-accent": active.accent } as AccentStyle}
          key={active.id}
        >
          <div className={styles.productCopy}>
            <span className={styles.status}>{active.status}</span>
            <p className={styles.kicker}>{active.kicker}</p>
            <h3>{active.title}</h3>
            <p className={styles.body}>{active.body}</p>
            <ul>
              {active.proof.map((item) => <li key={item}><LuCheck aria-hidden="true" />{item}</li>)}
            </ul>
            <div className={styles.actions}>
              <PreorderPlasmaButton label="Try Air for free" />
              <Link href="/how-it-works#mini-apps">Explore all Mini Apps <LuArrowUpRight aria-hidden="true" /></Link>
            </div>
          </div>

          <div className={styles.demo} aria-label={`${active.name} Mini App product preview`}>
            <DriftWall items={wallItems} columns={4} tileWidth={178} tileHeight={124} gap={14} speed={22} lift={46} dim={.7} fade={.42} />
            <div className={styles.wallAgentCard}>
              <div className={styles.wallAgentHead}><span><active.Icon aria-hidden="true" /></span><strong>{active.name}</strong><small>Live surface</small></div>
              <p><LuMessageCircle aria-hidden="true" />{active.prompt}</p>
              <div><LuCheck aria-hidden="true" /><span>{active.result}</span></div>
              <ul>{active.fragments.map((fragment) => <li key={fragment.label}>{fragment.label}</li>)}</ul>
            </div>
          </div>
        </div>

        <div className={styles.trustBar}>
          <div><span>PRIVATE BETA</span><span>PERSISTENT CONTEXT</span><span>APPROVAL REQUIRED WHEN IT MATTERS</span></div>
          <div>
            <a href="https://agenthunt.com/" target="_blank" rel="noreferrer">Explore Agent Hunt <LuArrowUpRight aria-hidden="true" /></a>
            <a href="https://www.5-dee.com/" target="_blank" rel="noreferrer">Built by 5DEE Studios <LuArrowUpRight aria-hidden="true" /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
