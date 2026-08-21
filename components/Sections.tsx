import Image from "next/image";
import { createElement, type CSSProperties } from "react";
import {
  LuBot,
  LuCheck,
  LuCircleDollarSign,
  LuInbox,
  LuKeyRound,
  LuLaptop,
  LuLink,
  LuMessageCircle,
  LuPhone,
  LuPlay,
  LuShieldCheck,
  LuSparkles,
  LuWalletCards,
  LuWorkflow,
} from "react-icons/lu";

import { PreorderButton } from "@/components/Preorder";

import styles from "./EditorialSections.module.css";

const features = [
  {
    Icon: LuLaptop,
    number: "01",
    title: "Computer",
    body: "A private workspace that can browse, build, render, and finish the task—not just describe it.",
    visual: "computer",
    status: "Private beta",
  },
  {
    Icon: LuPhone,
    number: "02",
    title: "Phone number",
    body: "A real number for calls, texts, confirmations, and conversations that stay attached to the work.",
    visual: "phone",
    status: "Private beta",
  },
  {
    Icon: LuInbox,
    number: "03",
    title: "Email and inbox",
    body: "Air can draft, organize, follow up, and keep the details moving while you stay in iMessage.",
    visual: "inbox",
    status: "Private beta",
  },
  {
    Icon: LuKeyRound,
    number: "04",
    title: "Secrets manager",
    body: "Credentials live behind a vault boundary, so connected workflows can run without exposing your keys.",
    visual: "secrets",
    status: "Private beta",
  },
  {
    Icon: LuLink,
    number: "05",
    title: "1,000+ available app connections",
    body: "Browse the connector catalog for Instagram, Meta Ads, Notion, Gmail, Shopify, Slack, and more. Availability does not mean every account is already configured.",
    visual: "apps",
    status: "Connector catalog",
  },
  {
    Icon: LuWalletCards,
    number: "06",
    title: "Wallet & AgentCard",
    body: "Wallet is in private beta and AgentCard is coming soon. Payments and other consequential actions remain yours to approve.",
    visual: "wallet",
    status: "Private beta",
  },
] as const;

type Feature = (typeof features)[number];

function FeatureVisual({ kind }: { kind: Feature["visual"] }) {
  if (kind === "computer") {
    return (
      <div className="feature-visual computer-visual" aria-hidden>
        <div className="tiny-window-head"><i /><i /><i /><span>air://workspace</span></div>
        <div className="window-grid"><span /><span /><span /><span /></div>
        <div className="cursor-chip">Air is arranging your launch ↗</div>
      </div>
    );
  }

  if (kind === "phone") {
    return (
      <div className="feature-visual phone-visual" aria-hidden>
        <span className="signal-ripple r1" /><span className="signal-ripple r2" />
        <div className="number-pill"><LuPhone /><span><small>Air line</small>+1 (415) 555–AIR</span><i>beta</i></div>
      </div>
    );
  }

  if (kind === "inbox") {
    return (
      <div className="feature-visual inbox-visual" aria-hidden>
        <div><span>From Air</span><b>Creator brief is ready</b><small>3 assets attached · now</small></div>
        <div><span>To partners</span><b>Launch follow-up</b><small>scheduled · 10:30</small></div>
      </div>
    );
  }

  if (kind === "secrets") {
    return (
      <div className="feature-visual secret-visual" aria-hidden>
        <span className="vault-ring"><LuShieldCheck /></span>
        <div><small>SECRETS VAULT</small><strong>•••• •••• •••• 2048</strong><i>encrypted & scoped</i></div>
      </div>
    );
  }

  if (kind === "apps") {
    return (
      <div className="feature-visual apps-visual" aria-hidden>
        {["IG", "N", "S", "G", "M", "F", "C", "+"].map((app, index) => (
          <span key={app} style={{ "--n": index } as CSSProperties}>{app}</span>
        ))}
      </div>
    );
  }

  return (
    <div className="feature-visual wallet-visual" aria-hidden>
      <div className="agent-card"><span>AIR / 0001</span><LuSparkles /><small>AgentCard · coming soon</small></div>
      <span className="wallet-balance"><LuCircleDollarSign /> wallet · <b>private beta</b></span>
    </div>
  );
}

function CapabilityCard({
  feature,
  className,
  delay,
}: {
  feature: Feature;
  className: string;
  delay: number;
}) {
  const { Icon, number, title, body, visual, status } = feature;

  return (
    <article
      className={`feature-card feature-${visual} ${styles.capabilityCard} ${className}`}
      data-reveal
      style={{ "--delay": `${delay}ms` } as CSSProperties}
    >
      <div className="feature-top">
        <span className="feature-number">{number}</span>
        <Icon aria-hidden />
        <span className="soon-badge">{status}</span>
      </div>
      <FeatureVisual kind={visual} />
      <div className="feature-copy">
        <h3>{title}</h3>
        <p>{body}</p>
        {visual === "wallet" && (
          <p className={styles.walletStatus}>
            <span className="soon-badge">Wallet · Private beta</span>
            <span className="soon-badge">AgentCard · Coming soon</span>
            <span className="soon-badge">Approval required</span>
          </p>
        )}
      </div>
    </article>
  );
}

const signals = [
  "imessage-blue_hey-air-lets-run-a-wzrd-workflow.png",
  "instagram-dm_hey-air-lets-run-a-wzrd-workflow.png",
  "google-search_hey-air-lets-run-a-wzrd-workflow.png",
  "whatsapp-sent_hey-air-lets-run-a-wzrd-workflow.png",
  "youtube-comment_hey-air-lets-run-a-wzrd-workflow.png",
] as const;

export function AgentFeatures() {
  const [computer, phone, inbox, secrets, apps, wallet] = features;

  return (
    <section
      className={`agent-section section ${styles.capabilityScene}`}
      data-air-scene="pearl"
      data-air-cloud-progress="0.86"
      data-air-cloud-rays="0.12"
      data-air-cloud-opacity="0.16"
      aria-labelledby="agent-title"
    >
      {createElement("dk-gradient", {
        "aria-hidden": "true",
        className: "agent-dither-field",
        from: "blue",
        direction: "radial",
        pixel: "5",
        bloom: "low",
        fade: "",
      })}
      <div className="shell">
        <div className="section-rail"><span>Every agent gets a:</span><span>06 capabilities / one Air</span></div>
        <div className={`section-heading ${styles.capabilityLead}`} data-reveal>
          <p className="eyebrow">Six foundations · availability labeled</p>
          <h2 id="agent-title">The operating surface behind your creative thread.</h2>
          <p>
            Air is more than a chat window: its workspace, communication layer, vault, and approved
            connections sit behind the same private thread.
          </p>
        </div>

        <div className={styles.capabilityField}>
          <CapabilityCard feature={computer} className={styles.anchorCard} delay={0} />

          <div className={styles.communicationStack} aria-label="Communication infrastructure">
            <p className={styles.groupLabel}>Communication layer</p>
            <CapabilityCard feature={phone} className={styles.communicationCard} delay={90} />
            <CapabilityCard feature={inbox} className={styles.communicationCard} delay={180} />
          </div>

          <div className={styles.utilityShelf} aria-label="Air utilities and catalog">
            <p className={styles.groupLabel}>Boundaries and connections</p>
            <CapabilityCard feature={secrets} className={styles.utilityCard} delay={120} />
            <CapabilityCard feature={apps} className={styles.connectorCard} delay={210} />
            <CapabilityCard feature={wallet} className={styles.utilityCard} delay={300} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function WorkflowSignals() {
  return (
    <section
      className={`signals-section section ${styles.workflowScene}`}
      id="how-it-works"
      data-air-scene="ink"
      data-air-cloud-progress="0.78"
      data-air-cloud-rays="0.12"
      data-air-cloud-opacity="0.16"
      aria-labelledby="signals-title"
    >
      <div className="shell">
        <div className="section-rail"><span>One thought</span><span>One private thread · Interface preview</span></div>
        <div className={`section-heading ${styles.workflowHeading}`} data-reveal>
          <p className="eyebrow">A conversation, not a control room</p>
          <h2 id="signals-title">One thought, not six tabs.</h2>
          <p>
            Instead of switching between your analytics, ChatGPT, creative suite, and Meta Ads,
            text Air once. It helps shape the next move and returns the review to iMessage.
          </p>
        </div>

        <div className={styles.workflowProofGrid}>
          <article className={styles.conversationArtifact} data-reveal aria-label="Air workflow interface preview">
            <header className={styles.threadChrome}>
              <span><i aria-hidden /> Air / private thread</span>
              <span>Interface preview</span>
            </header>
            <div className={styles.threadTranscript}>
              <div className={`${styles.threadMessage} ${styles.threadMessageUser}`}>
                <span>You</span>
                <p>Turn this week&apos;s performance into a launch direction.</p>
              </div>
              <div className={styles.connectionNotice}>
                <LuWorkflow aria-hidden />
                <span>Possible context: analytics · ChatGPT · creative suite · Meta Ads</span>
              </div>
              <div className={`${styles.threadMessage} ${styles.threadMessageAir}`}>
                <span>Air</span>
                <p>I&apos;ll prepare the next move, keep the choices visible, and bring the review back here.</p>
              </div>
              <ol className={styles.workflowLedger}>
                <li><span>01</span><div><b>Text the outcome</b><small>Brief the result in your own words.</small></div></li>
                <li><span>02</span><div><b>Shape the direction</b><small>Air coordinates only the connections you approve.</small></div></li>
                <li><span>03</span><div><b>Review in thread</b><small>Publishing, spending, and consequential actions stay with you.</small></div></li>
              </ol>
            </div>
            <footer className={styles.threadFooter}>
              <span className="soon-badge">Approval required</span>
              <span>Private beta preview</span>
            </footer>
          </article>

          <aside className={styles.workflowAside} data-reveal aria-labelledby="workflow-aside-title">
            <p className="eyebrow">The handoff</p>
            <h3 id="workflow-aside-title">Direction without the dashboard hop.</h3>
            <p>
              The thread holds the ask, the useful context, and the review moment—so the next decision
              does not disappear across a stack of tabs.
            </p>
            <ul>
              <li><LuMessageCircle aria-hidden /><span><b>Brief naturally.</b> Add words, links, images, or a reference.</span></li>
              <li><LuBot aria-hidden /><span><b>See the work.</b> Air keeps the next step legible while it is being prepared.</span></li>
              <li><LuCheck aria-hidden /><span><b>Choose the moment.</b> You approve what gets connected, published, or spent.</span></li>
            </ul>
          </aside>
        </div>
      </div>

      <div className={`shell ${styles.signalShelf}`} data-reveal>
        <div>
          <p className="eyebrow">Signal, where it already happens</p>
          <p>Messages and social replies can be the start of a brief. These are interface studies, not live connected accounts.</p>
        </div>
        <div className={styles.signalStrip} aria-hidden="true">
          {signals.map((signal) => (
            <figure key={signal}>
              <Image
                src={`/images/textlab/${signal}`}
                alt=""
                width={784}
                height={120}
                sizes="(max-width: 720px) 72vw, (max-width: 1100px) 31vw, 18vw"
              />
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ThreadProof() {
  return (
    <section
      className={`proof-section section ${styles.threadScene}`}
      data-air-scene="pearl"
      data-air-cloud-progress="0.88"
      data-air-cloud-rays="0.08"
      data-air-cloud-opacity="0.12"
      aria-labelledby="proof-title"
    >
      <div className="shell proof-grid">
        <div className="proof-copy" data-reveal>
          <div className="section-rail"><span>The interface</span><span>Messages.app</span></div>
          <p className="eyebrow">Interface preview · private beta</p>
          <h2 id="proof-title">The conversation is the creative workspace.</h2>
          <p>
            This curated private-beta preview shows how campaign analysis, creator outreach, edits,
            and research can stay legible in the same thread through messages, reactions, and compact mini-apps.
          </p>
          <ul className="proof-list">
            <li><LuBot aria-hidden /><span><b>Conversation-first.</b> Direct the work the way you&apos;d brief a teammate.</span></li>
            <li><LuPlay aria-hidden /><span><b>Action-visible.</b> See what is running and review the important moments.</span></li>
            <li><LuShieldCheck aria-hidden /><span><b>Approval required.</b> You decide what Air may connect, publish, and spend.</span></li>
          </ul>
        </div>
        <figure className={`phone-reference ${styles.threadReference}`} data-reveal>
          <div className="image-glow" aria-hidden />
          <Image
            className={styles.threadReferenceImage}
            src="/images/air-imessage-reference.png"
            alt="Air by WZRD.tech helping with unread messages, email, analytics, and ad copy inside iMessage"
            width={1080}
            height={1340}
            sizes="(max-width: 900px) 92vw, 46vw"
            loading="eager"
          />
          <figcaption>Air by WZRD.tech · iMessage interface study</figcaption>
        </figure>
      </div>
    </section>
  );
}

const faqItems = [
  {
    question: "Is Air available today?",
    answer: "Air is being introduced through a private beta. The product screens on this site are curated interface previews, and preorder is the way to share your details for Air onboarding.",
  },
  {
    question: "What still needs my approval?",
    answer: "Air can prepare work and return it to the thread, but connecting accounts, publishing, spending, and other consequential actions remain approval required.",
  },
  {
    question: "What does a preorder do?",
    answer: "A preorder saves your name, email, and iMessage number for Air onboarding. Once it is saved, you can book a short onboarding conversation. No payment is due today.",
  },
] as const;

export function AirFaq() {
  return (
    <section
      className={`section ${styles.faqSection}`}
      data-air-scene="pearl"
      data-air-cloud-progress="0.9"
      data-air-cloud-rays="0.05"
      data-air-cloud-opacity="0.1"
      aria-labelledby="faq-title"
    >
      <div className="shell">
        <div className="section-rail"><span>Practical details</span><span>Private beta / truthful by design</span></div>
        <div className={`section-heading ${styles.faqHeading}`} data-reveal>
          <p className="eyebrow">Before you preorder</p>
          <h2 id="faq-title">A few clear answers.</h2>
          <p>Air is taking shape in public. Here is what the preview and preorder mean today.</p>
        </div>
        <dl className={styles.faqList}>
          {faqItems.map((item, index) => (
            <div data-reveal style={{ "--delay": `${index * 95}ms` } as CSSProperties} key={item.question}>
              <dt><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section
      className={`closing-section section ${styles.closingScene}`}
      data-air-scene="cloud"
      data-air-cloud-progress="0.74"
      data-air-cloud-rays="0.2"
      data-air-cloud-opacity="0.2"
      data-air-closing-art="blue-hour-horizon"
      aria-labelledby="closing-title"
    >
      <div className={styles.closingArtwork} aria-hidden="true">
        <Image
          src="/images/closing/v2026-08-21-a/blue-hour-horizon.avif"
          alt=""
          fill
          sizes="100vw"
        />
      </div>
      <div className="closing-clouds" aria-hidden />
      <div className={`shell closing-inner ${styles.closingInner}`} data-reveal>
        <div className="closing-orb"><LuSparkles aria-hidden /></div>
        <p className="eyebrow">Air is taking shape now</p>
        <h2 id="closing-title">Keep the next idea moving.</h2>
        <p>Preorder Air to save your place, then book a short onboarding conversation with WZRD.</p>
        <PreorderButton />
        <small>No payment today · founding access is limited</small>
      </div>
    </section>
  );
}
