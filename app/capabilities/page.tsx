import type { Metadata } from "next";
import {
  LuBrainCircuit,
  LuInbox,
  LuKeyRound,
  LuLaptop,
  LuLink,
  LuWalletCards,
} from "react-icons/lu";

import { DetailArrowLink, DetailPageShell } from "@/components/DetailPageShell";
import styles from "@/components/DetailPageShell.module.css";

export const metadata: Metadata = {
  title: "What sits behind the thread | Air by WZRD",
  description:
    "A labeled view of Air's persistent computer, memory, iMessage access, scoped secrets, app-toolkit catalog, Mini Apps, and approvals.",
  alternates: { canonical: "/capabilities" },
  openGraph: {
    title: "What sits behind the thread | Air by WZRD",
    description:
      "The labeled private-beta operating surface behind Air's personal composable computer.",
    url: "/capabilities",
  },
};

const capabilities = [
  {
    Icon: LuLaptop,
    kind: "Computer",
    number: "01",
    title: "Computer",
    status: "Private beta",
    body: "A private workspace that can browse, build, render, and finish the task—not just describe it.",
  },
  {
    Icon: LuBrainCircuit,
    kind: "Phone",
    number: "02",
    title: "Persistent memory",
    status: "Private beta",
    body: "Files, preferences, skills, and useful context stay with the same agent across iMessage and web.",
  },
  {
    Icon: LuInbox,
    kind: "Inbox",
    number: "03",
    title: "iMessage, web, and inbox",
    status: "Private beta",
    body: "Start in iMessage, continue on the web, and keep communication attached to the same working context.",
  },
  {
    Icon: LuKeyRound,
    kind: "Vault",
    number: "04",
    title: "Secrets manager",
    status: "Private beta",
    body: "Credentials live behind a vault boundary, so connected workflows can run without exposing your keys.",
  },
  {
    Icon: LuLink,
    kind: "Connections",
    number: "05",
    title: "1,000+ app toolkits",
    status: "Connector catalog",
    body: "Browse Instagram, Meta Ads, Notion, Gmail, Shopify, Slack, and more. Availability does not mean every account is already configured.",
  },
  {
    Icon: LuWalletCards,
    kind: "Wallet",
    number: "06",
    title: "Mini Apps & approval",
    status: "Mini Apps · Private beta / monetization · Rolling out",
    body: "Focused interfaces turn work into usable software, while consequential actions remain yours to approve.",
  },
] as const;

export default function CapabilitiesPage() {
  return (
    <DetailPageShell
      current="capabilities"
      eyebrow="THE OPERATING SURFACE · AVAILABILITY LABELED"
      title="The systems inside your composable computer."
      description="Air combines one persistent workspace, memory, communication surfaces, scoped secrets, supported connections, Mini Apps, and approval controls. Each item is labeled by current availability."
    >
      <section
        className={`${styles.chapter} ${styles.capabilityChapter}`}
        data-air-scene="pearl"
        data-air-cloud-progress="0.84"
        data-air-cloud-rays="0.1"
        data-air-cloud-opacity="0.18"
        data-variant="sky"
        aria-labelledby="support-title"
      >
        <div className="shell">
          <div className={styles.rail}>
            <span>Every agent gets a</span>
            <span>06 labeled capabilities</span>
          </div>
          <div className={styles.chapterHeading}>
            <h2 id="support-title">Change the stack without losing the context.</h2>
            <p>These are the grounded systems that let one request turn into finished, reviewable work.</p>
          </div>

          <div className={styles.capabilitySurface} aria-label="Air operating surface">
            {capabilities.map(({ Icon, kind, number, title, status, body }) => (
              <article className={`${styles.capabilityModule} ${styles[`capability${kind}`]}`} key={title}>
                <header>
                  <span>{number}</span>
                  <Icon aria-hidden />
                </header>
                <div className={styles.capabilityModuleVisual} aria-hidden>
                  <i /><i /><i /><i />
                </div>
                <div className={styles.capabilityModuleCopy}>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  <span className={styles.status}>{status}</span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.capabilityLegend}>
            <span>Operating-surface preview</span>
            <p>Availability labels describe the current product state—not an entitlement or a completed account connection.</p>
          </div>
        </div>
      </section>

      <section
        className={`${styles.editorialCallout} ${styles.editorialCalloutNight}`}
        data-air-scene="ink"
        data-air-cloud-progress="0.74"
        data-air-cloud-rays="0.14"
        data-air-cloud-opacity="0.18"
        aria-labelledby="connections-title"
      >
        <div className="shell">
          <div>
            <p className="eyebrow">Approval stays in the loop</p>
            <h2 id="connections-title">The connections are not the point.</h2>
          </div>
          <div className={styles.calloutAside}>
            <p>
              Air is designed to keep the creative conversation readable. You decide what Air may connect,
              publish, and spend.
            </p>
            <DetailArrowLink href="/how-it-works">See the review loop</DetailArrowLink>
          </div>
        </div>
      </section>
    </DetailPageShell>
  );
}
