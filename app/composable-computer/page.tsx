import type { Metadata } from "next";
import { LuAppWindow, LuBrainCircuit, LuMonitorCog, LuShieldCheck, LuWorkflow } from "react-icons/lu";

import { DetailArrowLink, DetailPageShell } from "@/components/DetailPageShell";
import { SectionVideo } from "@/components/SectionVideo";
import styles from "@/components/DetailPageShell.module.css";
import { AIR_PRODUCT_DESCRIPTION, AIR_TAGLINE } from "@/lib/air-copy";

export const metadata: Metadata = {
  title: "Personal composable AI computer | Air by WZRD",
  description:
    "See how Air combines one persistent agent, managed compute, memory, skills, app connections, Mini Apps, and approval controls.",
  alternates: { canonical: "/composable-computer" },
  openGraph: {
    title: `Air — ${AIR_TAGLINE}`,
    description: AIR_PRODUCT_DESCRIPTION,
    url: "/composable-computer",
  },
};

const layers = [
  {
    Icon: LuMonitorCog,
    number: "01",
    title: "Persistent compute",
    body: "A durable managed Ubuntu workspace with files, browser, terminal, and creative tools.",
    kind: "Computer",
    status: "Private beta",
  },
  {
    Icon: LuBrainCircuit,
    number: "02",
    title: "Persistent context",
    body: "Memory, preferences, skills, and useful context stay with the same agent across iMessage and web.",
    kind: "Phone",
    status: "Private beta",
  },
  {
    Icon: LuWorkflow,
    number: "03",
    title: "Composable stack",
    body: "Supported models, skills, connections, and schedules can change around the outcome.",
    kind: "Inbox",
    status: "Private beta",
  },
  {
    Icon: LuAppWindow,
    number: "04",
    title: "Focused Mini Apps",
    body: "Turn agent work into interfaces you can install, create, share, and publish.",
    kind: "Connections",
    status: "Rolling out",
  },
  {
    Icon: LuShieldCheck,
    number: "05",
    title: "Human approval",
    body: "Consequential actions pause so connecting, sending, publishing, and spending stay reviewable.",
    kind: "Wallet",
    status: "Approval required",
  },
] as const;

export default function ComposableComputerPage() {
  return (
    <DetailPageShell
      current="composable-computer"
      eyebrow="YOUR PERSONAL, COMPOSABLE COMPUTER"
      title="One agent. One computer. Composed around you."
      description="Air gives one persistent AI agent a durable workspace, memory, skills, supported connections, and Mini Apps—then keeps the important decisions with you."
      heroMedia={
        <SectionVideo
          desktopSrc="/media/air/v2026-09-17-d/demos/airclay-720.mp4"
          mobileSrc="/media/air/v2026-09-17-d/demos/airclay-540.mp4"
          poster="/media/air/v2026-09-17-d/demos/airclay-poster.jpg"
          kicker="Air / Field film 01"
          title="Step into Air."
          description="A personal world forms around the work—then stays ready for whatever comes next."
        />
      }
    >
      <section
        className={`${styles.chapter} ${styles.capabilityChapter}`}
        data-air-scene="pearl"
        data-air-cloud-progress="0.84"
        data-air-cloud-rays="0.1"
        data-air-cloud-opacity="0.18"
        data-variant="sky"
        aria-labelledby="computer-layers-title"
      >
        <div className="shell">
          <div className={styles.rail}>
            <span>What composable means</span>
            <span>Five grounded layers</span>
          </div>
          <div className={styles.chapterHeading}>
            <h2 id="computer-layers-title">The computer changes around the work—not the other way around.</h2>
            <p>
              Start with one persistent agent. Add the compute, context, tools, and focused interfaces the
              job needs without beginning again in a new chat.
            </p>
          </div>

          <div className={styles.capabilitySurface} aria-label="Layers of an Air composable computer">
            {layers.map(({ Icon, number, title, body, kind, status }) => (
              <article className={`${styles.capabilityModule} ${styles[`capability${kind}`]}`} key={title}>
                <header><span>{number}</span><Icon aria-hidden /></header>
                <div className={styles.capabilityModuleVisual} aria-hidden><i /><i /><i /><i /></div>
                <div className={styles.capabilityModuleCopy}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className={styles.status}>{status}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className={`${styles.editorialCallout} ${styles.editorialCalloutNight}`}
        data-air-scene="ink"
        data-air-cloud-progress="0.74"
        data-air-cloud-rays="0.14"
        data-air-cloud-opacity="0.18"
        aria-labelledby="computer-store-title"
      >
        <div className="shell">
          <div>
            <p className="eyebrow">The Mini App Store</p>
            <h2 id="computer-store-title">Install what you need. Publish what you invent.</h2>
          </div>
          <div className={styles.calloutAside}>
            <p>
              Air’s Mini App rails turn agent work into focused software. Publisher access and paid gates
              are rolling out with explicit availability labels.
            </p>
            <DetailArrowLink href="/how-it-works#mini-apps">Explore Mini Apps</DetailArrowLink>
          </div>
        </div>
      </section>
    </DetailPageShell>
  );
}
