import type { Metadata } from "next";
import {
  LuInbox,
  LuKeyRound,
  LuLaptop,
  LuLink,
  LuPhone,
  LuWalletCards,
} from "react-icons/lu";

import { DetailArrowLink, DetailPageShell } from "@/components/DetailPageShell";
import styles from "@/components/DetailPageShell.module.css";

export const metadata: Metadata = {
  title: "What sits behind the thread | Air by WZRD",
  description:
    "A labeled view of the private-beta workspace, phone line, inbox, scoped secrets, connector catalog, wallet, and AgentCard behind Air.",
  alternates: { canonical: "/capabilities" },
  openGraph: {
    title: "What sits behind the thread | Air by WZRD",
    description:
      "The labeled private-beta operating surface that supports Air's creative thread.",
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
    Icon: LuPhone,
    kind: "Phone",
    number: "02",
    title: "Phone number",
    status: "Private beta",
    body: "A real number for calls, texts, confirmations, and conversations that stay attached to the work.",
  },
  {
    Icon: LuInbox,
    kind: "Inbox",
    number: "03",
    title: "Email and inbox",
    status: "Private beta",
    body: "Air can draft, organize, follow up, and keep the details moving while you stay in iMessage.",
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
    title: "1,000+ available app connections",
    status: "Connector catalog",
    body: "Browse Instagram, Meta Ads, Notion, Gmail, Shopify, Slack, and more. Availability does not mean every account is already configured.",
  },
  {
    Icon: LuWalletCards,
    kind: "Wallet",
    number: "06",
    title: "Wallet & AgentCard",
    status: "Wallet · Private beta / AgentCard · Coming soon",
    body: "Payments and other consequential actions remain yours to approve.",
  },
] as const;

export default function CapabilitiesPage() {
  return (
    <DetailPageShell
      current="capabilities"
      eyebrow="THE OPERATING SURFACE · AVAILABILITY LABELED"
      title="The tools behind the creative thread."
      description="Air’s creative thread is designed to be supported by a workspace, phone line, inbox, scoped secrets, and a connector catalog. Each item is labeled by its current availability."
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
            <h2 id="support-title">Support the idea without losing the thread.</h2>
            <p>These are the grounded systems that let a creative conversation turn into finished, reviewable work.</p>
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
