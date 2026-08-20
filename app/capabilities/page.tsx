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
    number: "01",
    title: "Computer",
    status: "Private beta",
    body: "A private workspace that can browse, build, render, and finish the task—not just describe it.",
  },
  {
    Icon: LuPhone,
    number: "02",
    title: "Phone number",
    status: "Private beta",
    body: "A real number for calls, texts, confirmations, and conversations that stay attached to the work.",
  },
  {
    Icon: LuInbox,
    number: "03",
    title: "Email and inbox",
    status: "Private beta",
    body: "Air can draft, organize, follow up, and keep the details moving while you stay in iMessage.",
  },
  {
    Icon: LuKeyRound,
    number: "04",
    title: "Secrets manager",
    status: "Private beta",
    body: "Credentials live behind a vault boundary, so connected workflows can run without exposing your keys.",
  },
  {
    Icon: LuLink,
    number: "05",
    title: "1,000+ available app connections",
    status: "Connector catalog",
    body: "Browse Instagram, Meta Ads, Notion, Gmail, Shopify, Slack, and more. Availability does not mean every account is already configured.",
  },
  {
    Icon: LuWalletCards,
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
      <section className={styles.chapter} data-air-scene="pearl" data-variant="sky" aria-labelledby="support-title">
        <div className="shell">
          <div className={styles.rail}><span>Every agent gets a</span><span>06 capabilities</span></div>
          <div className={styles.leadGrid}>
            <h2 id="support-title">Support the idea without losing the thread.</h2>
            <p>These are the grounded systems that let a creative conversation turn into finished, reviewable work.</p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map(({ Icon, number, title, status, body }) => (
              <article className={styles.capabilityCard} key={title}>
                <div className={styles.capabilityTop}><span>{number}</span><Icon aria-hidden /></div>
                <h3>{title}</h3>
                <p>{body}</p>
                <span className={styles.status}>{status}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.callout} data-air-scene="cloud" aria-labelledby="connections-title">
        <div className="shell">
          <div>
            <p className="eyebrow">Approval stays in the loop</p>
            <h2 id="connections-title">The connections are not the point.</h2>
          </div>
          <div>
            <p>
              Air is designed to keep the creative conversation readable. You decide what Air may connect, publish, and spend.
            </p>
            <DetailArrowLink href="/how-it-works">See the review loop</DetailArrowLink>
          </div>
        </div>
      </section>
    </DetailPageShell>
  );
}
