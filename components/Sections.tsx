import Image from "next/image";
import { createElement } from "react";
import {
  LuArrowRight,
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

function FeatureVisual({ kind }: { kind: (typeof features)[number]["visual"] }) {
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
        {['IG','N','S','G','M','F','C','+'].map((app, index) => <span key={app} style={{ "--n": index } as React.CSSProperties}>{app}</span>)}
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

const signals = [
  "imessage-blue_hey-air-lets-run-a-wzrd-workflow.png",
  "instagram-dm_hey-air-lets-run-a-wzrd-workflow.png",
  "google-search_hey-air-lets-run-a-wzrd-workflow.png",
  "whatsapp-sent_hey-air-lets-run-a-wzrd-workflow.png",
  "youtube-comment_hey-air-lets-run-a-wzrd-workflow.png",
  "ios-tapback_hey-air-lets-run-a-wzrd-workflow.png",
  "tiktok-comment_hey-air-lets-run-a-wzrd-workflow.png",
  "messages-notification_hey-air-lets-run-a-wzrd-workflow.png",
] as const;

export function AgentFeatures() {
  return (
    <section
      className="agent-section section"
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
        <div className="section-heading" data-reveal>
          <p className="eyebrow">Six foundations · availability labeled</p>
          <h2 id="agent-title">The operating surface behind your creative thread.</h2>
          <p>Each capability is labeled by its current private-beta or catalog status.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ Icon, number, title, body, visual, status }, index) => (
            <article
              className={`feature-card feature-${visual}`}
              data-reveal
              style={{ "--delay": `${index * 95}ms` } as React.CSSProperties}
              key={title}
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
                  <p>
                    <span className="soon-badge">Wallet · Private beta</span>{" "}
                    <span className="soon-badge">AgentCard · Coming soon</span>{" "}
                    <span className="soon-badge">Approval required</span>
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkflowSignals() {
  return (
    <section
      className="signals-section section"
      id="how-it-works"
      data-air-scene="ink"
      data-air-cloud-progress="0.78"
      data-air-cloud-rays="0.12"
      data-air-cloud-opacity="0.16"
      aria-labelledby="signals-title"
    >
      <div className="shell signals-heading">
        <div className="section-rail"><span>One thought</span><span>One private thread · Interface preview</span></div>
        <div className="section-heading split" data-reveal>
          <h2 id="signals-title">One thought, not six tabs.</h2>
          <p>
            Instead of switching between your analytics, ChatGPT, your creative suite, and Meta Ads,
            text Air once. It coordinates the approved connections and returns the decisions to iMessage.
          </p>
        </div>
      </div>
      <div className="signal-marquee" aria-label="Air workflow examples">
        <div className="signal-track">
          {[...signals, ...signals].map((signal, index) => (
            <figure key={`${signal}-${index}`} aria-hidden={index >= signals.length}>
              <Image
                src={`/images/textlab/${signal}`}
                alt={index < signals.length ? "Hey Air, let's run a WZRD workflow" : ""}
                width={880}
                height={232}
                sizes="(max-width: 720px) 76vw, 34vw"
              />
            </figure>
          ))}
        </div>
      </div>
      <div className="shell workflow-steps">
        <article data-reveal>
          <span>01</span><LuMessageCircle aria-hidden />
          <h3>Text the outcome.</h3>
          <p>Give Air the brief in your own words, with images, links, or context attached.</p>
        </article>
        <LuArrowRight className="step-arrow" aria-hidden />
        <article data-reveal>
          <span>02</span><LuWorkflow aria-hidden />
          <h3>Air orchestrates.</h3>
          <p>It plans the work, asks when it must, and routes the task through the connections you approve.</p>
        </article>
        <LuArrowRight className="step-arrow" aria-hidden />
        <article data-reveal>
          <span>03</span><LuCheck aria-hidden />
          <h3>The work comes back.</h3>
          <p>Review decisions and receive the work in the thread. Publishing, spending, and other consequential actions are approval required.</p>
          <span className="soon-badge">Approval required</span>
        </article>
      </div>
      <div className="shell">
        <article className="feature-card air-memory-card" data-reveal aria-labelledby="air-memory-title">
          <div className="feature-top">
            <span className="feature-number">Air remembers</span>
            <LuSparkles aria-hidden />
            <span className="soon-badge">Private beta preview · resets when this page reloads</span>
          </div>
          <div className="feature-copy">
            <h3 id="air-memory-title">Keep the feel. Continue the thought.</h3>
            <p>
              A preview of how Air can carry an approved creative direction forward inside the same
              mounted page. This default study is not saved to a profile.
            </p>
            <p>
              <b>Mood:</b> quiet · <b>Palette:</b> mist blue and sun-warmed rust · <b>Pace:</b> unhurried · <b>Reference:</b> Golden Gate morning
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export function ThreadProof() {
  return (
    <section
      className="proof-section section"
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
            <li><LuBot aria-hidden /><span><b>Conversation-first.</b> Direct the work the way you’d brief a teammate.</span></li>
            <li><LuPlay aria-hidden /><span><b>Action-visible.</b> See what is running and review the important moments.</span></li>
            <li><LuShieldCheck aria-hidden /><span><b>Approval required.</b> You decide what Air may connect, publish, and spend.</span></li>
          </ul>
        </div>
        <figure className="phone-reference" data-reveal>
          <div className="image-glow" aria-hidden />
          <Image
            src="/images/air-imessage-reference.png"
            alt="Air by WZRD.tech helping with unread messages, email, analytics, and ad copy inside iMessage"
            width={1080}
            height={1340}
            sizes="(max-width: 900px) 92vw, 46vw"
          />
          <figcaption>Air by WZRD.tech · iMessage interface study</figcaption>
        </figure>
      </div>
    </section>
  );
}

export function ClosingCta() {
  return (
    <section
      className="closing-section section"
      data-air-scene="cloud"
      data-air-cloud-progress="0.74"
      data-air-cloud-rays="0.2"
      data-air-cloud-opacity="0.2"
      aria-labelledby="closing-title"
    >
      <div className="closing-clouds" aria-hidden />
      <div className="shell closing-inner" data-reveal>
        <div className="closing-orb"><LuSparkles aria-hidden /></div>
        <p className="eyebrow">Air is taking shape now</p>
        <h2 id="closing-title">Keep the next idea moving.</h2>
        <p>Preorder Air, save your place, and book a short onboarding conversation with WZRD.</p>
        <PreorderButton />
        <small>No payment today · founding access is limited</small>
      </div>
    </section>
  );
}
