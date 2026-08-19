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
  },
  {
    Icon: LuPhone,
    number: "02",
    title: "A Phone Number",
    body: "A real number for calls, texts, confirmations, and conversations that stay attached to the work.",
    visual: "phone",
  },
  {
    Icon: LuInbox,
    number: "03",
    title: "An Email and Inbox",
    body: "Air can draft, organize, follow up, and keep the details moving while you stay in iMessage.",
    visual: "inbox",
  },
  {
    Icon: LuKeyRound,
    number: "04",
    title: "A Secrets Manager",
    body: "Credentials live behind a vault boundary, so connected workflows can run without exposing your keys.",
    visual: "secrets",
  },
  {
    Icon: LuLink,
    number: "05",
    title: "1,000+ Apps to Connect",
    body: "Instagram, Meta Ads, Notion, Gmail, Shopify, Slack, and the long tail of tools your studio already uses.",
    visual: "apps",
  },
  {
    Icon: LuWalletCards,
    number: "06",
    title: "A Wallet & An AgentCard",
    body: "Identity, permissions, and payments designed for agents that can do business on your behalf.",
    visual: "wallet",
    soon: true,
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
        <div className="number-pill"><LuPhone /><span><small>Air line</small>+1 (415) 555–AIR</span><i>live</i></div>
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
      <div className="agent-card"><span>AIR / 0001</span><LuSparkles /><small>Verified creative agent</small></div>
      <span className="wallet-balance"><LuCircleDollarSign /> autonomous limit <b>$250</b></span>
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
    <section className="agent-section section" aria-labelledby="agent-title">
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
          <p className="eyebrow">Built to act</p>
          <h2 id="agent-title">Air arrives with everything it needs to get to work.</h2>
          <p>Not another chatbot tab. A complete operating surface behind one familiar conversation.</p>
        </div>
        <div className="feature-grid">
          {features.map(({ Icon, number, title, body, visual, ...feature }, index) => (
            <article
              className={`feature-card feature-${visual}`}
              data-reveal
              style={{ "--delay": `${index * 95}ms` } as React.CSSProperties}
              key={title}
            >
              <div className="feature-top">
                <span className="feature-number">{number}</span>
                <Icon aria-hidden />
                {'soon' in feature && feature.soon && <span className="soon-badge">coming soon</span>}
              </div>
              <FeatureVisual kind={visual} />
              <div className="feature-copy">
                <h3>{title}</h3>
                <p>{body}</p>
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
    <section className="signals-section section" id="how-it-works" aria-labelledby="signals-title">
      <div className="shell signals-heading">
        <div className="section-rail"><span>One prompt</span><span>Every surface</span></div>
        <div className="section-heading split" data-reveal>
          <h2 id="signals-title">Say it once. Air carries the idea everywhere.</h2>
          <p>
            A request in iMessage can become a search, a brief, a social post, an email, an ad set,
            or the next task in your team’s tools—without making you supervise every handoff.
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
          <p>It plans the work, asks when it must, and operates the right connected tools.</p>
        </article>
        <LuArrowRight className="step-arrow" aria-hidden />
        <article data-reveal>
          <span>03</span><LuCheck aria-hidden />
          <h3>The work comes back.</h3>
          <p>Review decisions, approve actions, and receive finished deliverables in the thread.</p>
        </article>
      </div>
    </section>
  );
}

export function ThreadProof() {
  return (
    <section className="proof-section section" aria-labelledby="proof-title">
      <div className="shell proof-grid">
        <div className="proof-copy" data-reveal>
          <div className="section-rail"><span>The interface</span><span>Messages.app</span></div>
          <p className="eyebrow">The thread is the workspace</p>
          <h2 id="proof-title">Creative momentum without another dashboard.</h2>
          <p>
            Ask for campaign analysis, creator outreach, edits, research, or a full workflow. Air
            keeps progress legible with native messages, reactions, and compact mini-apps.
          </p>
          <ul className="proof-list">
            <li><LuBot aria-hidden /><span><b>Conversation-first.</b> Direct the work the way you’d brief a teammate.</span></li>
            <li><LuPlay aria-hidden /><span><b>Action-visible.</b> See what is running and review the important moments.</span></li>
            <li><LuShieldCheck aria-hidden /><span><b>Permissioned.</b> You decide what Air may connect and spend.</span></li>
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
    <section className="closing-section section" aria-labelledby="closing-title">
      <div className="closing-clouds" aria-hidden />
      <div className="shell closing-inner" data-reveal>
        <div className="closing-orb"><LuSparkles aria-hidden /></div>
        <p className="eyebrow">Air is taking shape now</p>
        <h2 id="closing-title">Your next great idea should be one text away.</h2>
        <p>Preorder Air, save your place, and book a short onboarding conversation with WZRD.</p>
        <PreorderButton />
        <small>No payment today · founding access is limited</small>
      </div>
    </section>
  );
}
