import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import {
  LuAppWindow,
  LuArrowDown,
  LuBot,
  LuBox,
  LuBrainCircuit,
  LuCheck,
  LuCircleDollarSign,
  LuCloud,
  LuCode,
  LuCpu,
  LuGlobe,
  LuInbox,
  LuLayers3,
  LuLockKeyhole,
  LuMessageCircle,
  LuMonitorCog,
  LuMousePointer2,
  LuNetwork,
  LuPanelTop,
  LuPhoneCall,
  LuRocket,
  LuShieldCheck,
  LuSparkles,
  LuStore,
  LuWorkflow,
} from "react-icons/lu";
import { SiHermes, SiOpencode } from "react-icons/si";

import { PreorderButton } from "@/components/Preorder";
import { MiniAppGallery } from "@/components/MiniAppGallery";
import { PixelCard } from "@/components/PixelCard";
import { ShinyText } from "@/components/ShinyText";
import { AIR_MINI_APPS } from "@/lib/mini-apps";

import ProfileCard from "./ProfileCard";
import styles from "./ComposableSections.module.css";

type CapabilityVisualKind = "workspace" | "memory" | "conversation" | "catalog" | "mini-app" | "approval";

const capabilityCards = [
  {
    Icon: LuMonitorCog,
    number: "01",
    title: "Persistent computer",
    status: "Private beta",
    body: "A managed Ubuntu workspace that can browse, code, create files, render media, and run multi-step work.",
    signal: ["Ubuntu", "Browser", "Terminal"],
    visual: "workspace",
  },
  {
    Icon: LuBrainCircuit,
    number: "02",
    title: "Memory that stays",
    status: "Private beta",
    body: "Files, preferences, skills, and useful context stay with the same agent across iMessage and web.",
    signal: ["Files", "Taste", "Context"],
    visual: "memory",
  },
  {
    Icon: LuMessageCircle,
    number: "03",
    title: "One conversation",
    status: "Private beta",
    body: "Start in iMessage, continue on the web, and return to the same working context.",
    signal: ["iMessage", "Web", "Inbox"],
    visual: "conversation",
  },
  {
    Icon: LuLayers3,
    number: "04",
    title: "1,000+ app toolkits",
    status: "Catalog",
    body: "Search supported integrations for communication, design, commerce, analytics, and more. Access and permissions vary.",
    signal: ["Connect", "Scope", "Approve"],
    visual: "catalog",
  },
  {
    Icon: LuAppWindow,
    number: "05",
    title: "Mini Apps",
    status: "Private beta",
    body: "Turn agent work into focused interfaces for calendars, vaults, browsers, analytics, payments, and media.",
    signal: ["Install", "Create", "Publish"],
    visual: "mini-app",
  },
  {
    Icon: LuShieldCheck,
    number: "06",
    title: "Approval built in",
    status: "Private beta",
    body: "Connecting, publishing, sending, spending, and other consequential actions wait for you.",
    signal: ["Needs you", "Review", "Run"],
    visual: "approval",
  },
] as const;

function CapabilityVisual({ icon, visual }: { icon: ReactNode; visual: CapabilityVisualKind }) {
  return (
    <div className={styles.capabilityVisual} data-visual={visual} aria-hidden="true">
      {visual === "workspace" ? (
        <div className={styles.visualWorkspace}>
          <header><i /><i /><i /><span>air://computer</span></header>
          <div><span /><span /><span /><b>browser</b></div>
          <aside><span>brief.md</span><span>sources</span><span>terminal</span></aside>
        </div>
      ) : null}
      {visual === "memory" ? (
        <div className={styles.visualMemory}>
          <span className={styles.memoryCore}>A</span>
          <i /><i /><i /><i /><i />
          <p>context retained<br />for this Air</p>
        </div>
      ) : null}
      {visual === "conversation" ? (
        <div className={styles.visualConversation}>
          <span>Plan the launch from this deck.</span>
          <span>On it. I’ll bring back what needs approval.</span>
          <span>Launch room ready <b>Open</b></span>
        </div>
      ) : null}
      {visual === "catalog" ? (
        <div className={styles.visualCatalog}>
          <span>IG</span><span>N</span><span>S</span><span>O</span>
          <span>M</span><span>F</span><span>C</span><span>+</span>
        </div>
      ) : null}
      {visual === "mini-app" ? (
        <div className={styles.visualMiniApp}>
          <header><span>chatbot</span><i>•••</i></header>
          <p><span>Memory</span><span>Browser</span><span>Private beta</span></p>
          <div><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
          <small><b /> running</small>
        </div>
      ) : null}
      {visual === "approval" ? (
        <div className={styles.visualApproval}>
          <p>Ready to publish this Mini App?</p>
          <span>Review first</span>
          <span>Approve</span>
        </div>
      ) : null}
      <div className={styles.capabilityIcon}>{icon}</div>
    </div>
  );
}

const miniAppActions = [
  {
    Icon: LuBox,
    number: "01",
    title: "Install",
    body: "Add focused apps to your computer without rebuilding your assistant.",
    meta: "First-party + community",
  },
  {
    Icon: LuCode,
    number: "02",
    title: "Create",
    body: "Start from a template or build a custom interface with Air and your own files.",
    meta: "Templates + ZIP bundles",
  },
  {
    Icon: LuCircleDollarSign,
    number: "03",
    title: "Publish and earn",
    body: "Share publicly or privately and add paid access as publisher payments roll out.",
    meta: "Monetization rolling out",
  },
] as const;

const roadmapItems = [
  {
    status: "Available now",
    title: "Ubuntu",
    Icon: LuCloud,
    body: "Spin up a persistent Ubuntu computer with browser, files, terminal, memory, and skills.",
    tone: "live",
  },
  {
    status: "Coming soon",
    title: "Omarchy",
    Icon: LuPanelTop,
    body: "Run the same agent stack inside an Arch and Hyprland desktop environment.",
    tone: "soon",
  },
  {
    status: "Coming soon",
    title: "macOS",
    Icon: LuCpu,
    body: "Use an Apple-silicon environment for Mac-only applications and workflows.",
    tone: "soon",
  },
  {
    status: "Rolling out",
    title: "Mini App Store",
    Icon: LuStore,
    body: "Create, publish, share, and monetize Mini Apps from the same agent and workspace.",
    tone: "rolling",
  },
  {
    status: "Exploring",
    title: "Agent mesh + private networks",
    Icon: LuNetwork,
    body: "Coordinate specialized agents across private mesh networks, including future Tailscale support.",
    tone: "research",
  },
] as const;

const pricingPlans = [
  {
    name: "Adaptive",
    price: "$50",
    cadence: "/ month",
    status: "Private beta",
    description: "For an Air that learns your taste, rhythms, and preferred feeds.",
    features: [
      "One Air + persistent Ubuntu computer",
      "Hyper-personalized memory, feeds, and preferences",
      "Curated routing across 1,000+ supported models",
      "1,000+ app-toolkit catalog",
    ],
    cta: "Request Adaptive",
    featured: true,
  },
  {
    name: "Creator OS",
    price: "$100",
    cadence: "/ month",
    status: "Waitlist",
    description: "For creators and builders running complete creative systems.",
    features: [
      "Everything in Adaptive",
      "Omarchy environment when available",
      "Advanced agent and creator workflows",
      "Buzz, Berd, and creator Mini Apps",
    ],
    cta: "Join the Creator OS waitlist",
  },
  {
    name: "Dedicated Mac",
    price: "From $200",
    cadence: "/ month",
    status: "Capacity waitlist",
    description: "For people planning Apple-native workflows on dedicated compute.",
    features: [
      "Planned dedicated Apple-silicon environment",
      "macOS access when the environment ships",
      "Capacity confirmed before any activation",
      "Chip, region, and configuration quoted",
    ],
    cta: "Join the Mac waitlist",
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    status: "Managed",
    description: "For managed agents, custom integrations, and organization-wide operations.",
    features: [
      "Custom managed-agent fleets",
      "Organization onboarding and policies",
      "Custom connections and deployment options",
      "Commercial support terms",
    ],
    cta: "Talk to sales",
  },
] as const;

const dropAssets = [
  {
    src: "/images/textlab/messages-notification_hey-air-lets-run-a-wzrd-workflow.png",
    alt: "A Messages notification that starts an Air workflow",
    x: "2%",
    y: "6%",
    r: "-5deg",
    delay: "0ms",
    visualWidth: "52%",
    imageWidth: 880,
    imageHeight: 184,
  },
  {
    src: "/images/textlab/imessage-blue_hey-air-lets-run-a-wzrd-workflow.png",
    alt: "An outgoing iMessage bubble asking Air to run a workflow",
    x: "38%",
    y: "23%",
    r: "3deg",
    delay: "110ms",
    visualWidth: "58%",
    imageWidth: 784,
    imageHeight: 120,
  },
  {
    src: "/images/textlab/ios-tapback_hey-air-lets-run-a-wzrd-workflow.png",
    alt: "An iMessage Tapback response",
    x: "7%",
    y: "42%",
    r: "-2deg",
    delay: "220ms",
    visualWidth: "34%",
    imageWidth: 769,
    imageHeight: 218,
  },
  {
    src: "/images/textlab/imessage-gray_hey-air-lets-run-a-wzrd-workflow.png",
    alt: "An incoming iMessage bubble in an Air workflow",
    x: "18%",
    y: "58%",
    r: "2deg",
    delay: "330ms",
    visualWidth: "55%",
    imageWidth: 784,
    imageHeight: 120,
  },
  {
    src: "/images/textlab/ios-context-menu_hey-air-lets-run-a-wzrd-workflow.png",
    alt: "An iOS context menu attached to a message",
    x: "65%",
    y: "52%",
    r: "-4deg",
    delay: "440ms",
    visualWidth: "31%",
    imageWidth: 690,
    imageHeight: 367,
  },
] as const;

export const AIR_FAQ_ITEMS = [
  {
    question: "What is a personal composable computer?",
    answer:
      "It is one persistent AI agent with its own workspace, memory, skills, supported models, app connections, and Mini Apps. Composable means the stack can change around the work without starting over.",
  },
  {
    question: "Does Air have its own computer?",
    answer:
      "Yes. In private beta, each Air runs with a durable managed Ubuntu workspace that can use files, a browser, a terminal, skills, and approved connections.",
  },
  {
    question: "Can I use Air through iMessage?",
    answer:
      "Yes. Air is designed to keep useful context continuous across iMessage and the web, so a request can begin in one surface and continue in the other.",
  },
  {
    question: "What does zero data retention mean for Air?",
    answer:
      "Air processes the messages, files, and task content you send to complete the work you request. That content is not retained afterward or used for model training or marketing.",
  },
  {
    question: "Can I create and monetize Mini Apps?",
    answer:
      "Air includes Mini App creation and publishing rails. Public, private, and paid access are rolling out, so availability is labeled inside the product.",
  },
  {
    question: "Which operating systems does Air support?",
    answer:
      "Ubuntu is available in private beta. Omarchy and Apple-silicon macOS environments are coming soon. Hardware and regional availability vary.",
  },
  {
    question: "Which actions require approval?",
    answer:
      "Connecting accounts, sending, publishing, spending, and other consequential actions are designed to pause for your review.",
  },
] as const;

export function ComposableDefinition() {
  return (
    <section
      className={`section ${styles.definitionSection}`}
      id="what-is-air"
      data-air-scene="pearl"
      data-air-cloud-progress="0.88"
      data-air-cloud-rays="0.1"
      data-air-cloud-opacity="0.14"
      aria-labelledby="definition-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>What is Air?</span>
          <span>One person / one agent / one computer</span>
        </div>
        <div className={styles.definitionGrid}>
          <div className={styles.definitionCopy} data-reveal>
            <p className="eyebrow">A computer, not another chatbot</p>
            <h2 id="definition-title">A computer that builds itself around the work.</h2>
            <p>
              Air is a personal composable computer: one persistent AI agent with its own workspace,
              memory, tools, app connections, and Mini Apps.
            </p>
            <p className={styles.plainDefinition}>
              “Composable” means you can change the models, skills, connections, interfaces, and compute
              environment around the job without teaching a new assistant from scratch.
            </p>
          </div>

          <figure className={styles.systemMap} data-reveal aria-label="The parts of an Air composable computer">
            <header>
              <span><i aria-hidden /> air://you</span>
              <span>persistent</span>
            </header>
            <div className={styles.systemCore}>
              <span className={styles.coreOrb}><LuSparkles aria-hidden /></span>
              <div>
                <small>One Air</small>
                <strong>Your context stays with the computer.</strong>
              </div>
            </div>
            <div className={styles.systemModules}>
              <span><LuBrainCircuit aria-hidden /> Memory</span>
              <span><LuMonitorCog aria-hidden /> Ubuntu</span>
              <span><LuLayers3 aria-hidden /> Connections</span>
              <span><LuAppWindow aria-hidden /> Mini Apps</span>
              <span><LuShieldCheck aria-hidden /> Approval</span>
              <span><LuWorkflow aria-hidden /> Skills</span>
            </div>
            <figcaption>Private-beta operating surface · availability varies by module</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}

export function ComposableCapabilities() {
  return (
    <section
      className={`section ${styles.capabilitiesSection}`}
      id="capabilities"
      data-air-scene="pearl"
      data-air-cloud-progress="0.86"
      data-air-cloud-rays="0.08"
      data-air-cloud-opacity="0.12"
      aria-labelledby="capabilities-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>The composable computer</span>
          <span>Six grounded systems</span>
        </div>
        <div className={`section-heading ${styles.sectionLead}`} data-reveal>
          <p className="eyebrow">Composed around you</p>
          <h2 id="capabilities-title">One agent. The right stack for the job.</h2>
          <p>
            Air combines durable compute, memory, approved connections, and focused interfaces. Every
            capability is labeled by what is available now.
          </p>
        </div>

        <div className={styles.capabilityGrid}>
          {capabilityCards.map(({ Icon, number, title, status, body, signal, visual }, index) => (
            <div data-reveal style={{ "--delay": `${index * 70}ms` } as CSSProperties} key={title}>
              <PixelCard
                className={styles.capabilityPixelCard}
                colors={index % 2 === 0 ? ["#dff8ff", "#74d7fb", "#51a7de"] : ["#e0fff5", "#9eeedb", "#55b9af"]}
                gap={7}
                noFocus
              >
                <article className={styles.capabilityCard}>
                  <header>
                    <span>{number}</span>
                    <span className={styles.statusChip}>{status}</span>
                  </header>
                  <CapabilityVisual icon={<Icon />} visual={visual} />
                  <h3><ShinyText color="#f0faff" shineColor="#c5f1ff" speed={6 + index * 0.35} delay={index * 0.18} spread={112} pauseOnHover>{title}</ShinyText></h3>
                  <p>{body}</p>
                  <footer>
                    {signal.map((item) => <span key={item}>{item}</span>)}
                  </footer>
                </article>
              </PixelCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProductSequence() {
  return (
    <section
      className={`section ${styles.sequenceSection}`}
      id="composable-computer"
      data-air-scene="ink"
      data-air-cloud-progress="0.76"
      data-air-cloud-rays="0.14"
      data-air-cloud-opacity="0.18"
      aria-labelledby="sequence-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>From message to working system</span>
          <span>Product sequence / one pass</span>
        </div>
        <div className={styles.sequenceHeading} data-reveal>
          <div>
            <p className="eyebrow">Create on your composable computer</p>
            <h2 id="sequence-title">Watch one message become a working system.</h2>
          </div>
          <p>
            The request wakes Air’s computer, composes the right tools, pauses the sensitive moment,
            and returns a finished Mini App to the conversation.
          </p>
        </div>

        <figure className={styles.sequenceFigure} data-reveal>
          <div className={styles.sequenceStage} aria-hidden="true">
            <div className={styles.sequenceTopbar}>
              <span><i /> Air / launch-room</span>
              <span>Persistent computer · Ubuntu</span>
            </div>
            <div className={styles.sequenceRequest}>
              <small>iMessage · 9:41</small>
              <p>Plan the launch from this deck. Build the room and bring back what needs approval.</p>
            </div>
            <div className={styles.sequenceComputer}>
              <header><span>air://computer</span><span>composing…</span></header>
              <div className={styles.sequenceWorkspace}>
                <span><LuBrainCircuit /> Memory</span>
                <span><LuGlobe /> Browser</span>
                <span><LuLayers3 /> Files</span>
                <span><LuWorkflow /> Calendar</span>
              </div>
              <div className={styles.sequenceApproval}>
                <LuLockKeyhole />
                <span><small>Needs you</small>Approve publish</span>
                <b>Review</b>
              </div>
            </div>
            <div className={styles.sequenceResult}>
              <span className={styles.resultIcon}><LuRocket /></span>
              <div><small>Mini App ready</small><strong>Launch room</strong></div>
              <LuMousePointer2 />
            </div>
            <div className={styles.sequenceProgress}><span /></div>
          </div>
          <figcaption>
            Illustrative product sequence. Connections, publishing, sending, and spending remain approval required.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export function MiniAppStore() {
  return (
    <section
      className={`section ${styles.miniAppsSection}`}
      id="mini-apps"
      data-air-scene="pearl"
      data-air-cloud-progress="0.88"
      data-air-cloud-rays="0.08"
      data-air-cloud-opacity="0.12"
      aria-labelledby="mini-apps-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>The Mini App Store</span>
          <span>Create / publish / monetize</span>
        </div>
        <div className={styles.miniAppsHero}>
          <div data-reveal>
            <p className="eyebrow">Focused software, composed by your agent</p>
            <h2 id="mini-apps-title">Install what you need. Publish what you invent.</h2>
            <p>
              Start with Air’s first-party Mini Apps, then build your own. Share privately, publish to
              the store, and add paid access as publisher monetization rolls out.
            </p>
          </div>
          <div className={styles.storeBadge} data-reveal aria-label="Mini App Store status">
            <LuStore aria-hidden />
            <span><small>Publisher access</small>Rolling out</span>
          </div>
        </div>

        <div className={styles.agentCloud} data-reveal>
          <div>
            <p className="eyebrow">Agent field</p>
            <p>Give the Mini App Store a team: OpenClaw, Hermes, Pi, OpenCode, and the agents you bring to Air.</p>
          </div>
          <ul aria-label="Agent marks represented in the Air Mini App Store">
            <li>
              <span className={styles.agentMark} data-agent="openclaw">
                <Image src="/images/agents/v2026-08-25-a/openclaw-pixel-lobster.svg" alt="" width={36} height={36} />
              </span>
              <span>OpenClaw</span>
            </li>
            <li>
              <span className={styles.agentMark} data-agent="hermes"><SiHermes aria-hidden /></span>
              <span>Hermes</span>
            </li>
            <li>
              <span className={styles.agentMark} data-agent="pi" aria-hidden>π</span>
              <span>Pi</span>
            </li>
            <li>
              <span className={styles.agentMark} data-agent="opencode"><SiOpencode aria-hidden /></span>
              <span>OpenCode</span>
            </li>
          </ul>
        </div>

        <MiniAppGallery items={AIR_MINI_APPS} />

        <div className={styles.miniAppGrid}>
          {miniAppActions.map(({ Icon, number, title, body, meta }, index) => (
            <article data-reveal style={{ "--delay": `${index * 90}ms` } as CSSProperties} key={title}>
              <header><span>{number}</span><Icon aria-hidden /></header>
              <div className={styles.miniAppPreview} aria-hidden>
                <i /><i /><i />
                <span>{title}</span>
              </div>
              <h3>{title}</h3>
              <p>{body}</p>
              <small>{meta}</small>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PrivacyFirst() {
  return (
    <section
      className={`section ${styles.privacySection}`}
      id="privacy"
      data-air-scene="ink"
      data-air-cloud-progress="0.7"
      data-air-cloud-rays="0.1"
      data-air-cloud-opacity="0.14"
      aria-labelledby="privacy-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>Private by default</span>
          <span>Zero data retention</span>
        </div>
        <div className={styles.privacyGrid}>
          <ProfileCard
            className={styles.privacyProfile}
            name="Onairos"
            title="iMessage as an Identity Layer"
            handle="onairos-identity"
            status="Private identity active"
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={false}
            behindGlowEnabled
            innerGradient="linear-gradient(145deg, rgba(63, 145, 200, 0.82) 0%, rgba(4, 28, 55, 0.98) 51%, rgba(27, 142, 134, 0.72) 100%)"
          />

          <div className={styles.privacyCopy} data-reveal>
            <p className="eyebrow">A hard boundary around your work</p>
            <h2 id="privacy-title">Private context. Zero data retention.</h2>
            <p>
              Air processes the messages, files, and task content you send only to complete the work you request.
              It does not retain that content after processing or reuse it outside your work.
            </p>
            <ul>
              <li><LuShieldCheck aria-hidden /> Your messages and files stay out of training and marketing datasets.</li>
              <li><LuLockKeyhole aria-hidden /> Private context is scoped to the work and permissions you approve.</li>
              <li><LuCheck aria-hidden /> You decide when an agent gets access and when that access ends.</li>
            </ul>
          </div>

          <aside className={styles.privacyPolicy} data-reveal aria-label="Zero-data-retention privacy policy">
            <header>
              <span><i /> Air privacy policy</span>
              <LuLockKeyhole aria-hidden />
            </header>
            <div className={styles.retentionMark} aria-hidden="true">
              <strong>0</strong>
              <span>days<br />retained</span>
            </div>
            <dl>
              <div><dt>Messages &amp; files</dt><dd>Processed for the requested task, then not retained.</dd></div>
              <div><dt>Model training</dt><dd>Not used to train or improve models.</dd></div>
              <div><dt>Agent permissions</dt><dd>Explicit, reviewable, and revocable by you.</dd></div>
            </dl>
            <p>Zero-data-retention policy · Private beta</p>
          </aside>
        </div>
      </div>
    </section>
  );
}

export function CommunicationLayer() {
  return (
    <section
      className={`section ${styles.communicationSection}`}
      id="communication"
      data-air-scene="pearl"
      data-air-cloud-progress="0.82"
      data-air-cloud-rays="0.06"
      data-air-cloud-opacity="0.1"
      aria-labelledby="communication-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>Communication layer</span>
          <span>Private beta</span>
        </div>

        <div className={styles.communicationIntro} data-reveal>
          <p className="eyebrow">The work can move without losing its context</p>
          <h2 id="communication-title">One private operating layer for the work around you.</h2>
          <p>
            Give Air the computer, phone, and inbox surfaces it needs to move work forward—while
            you keep the thread, permissions, and final approval in one place.
          </p>
        </div>

        <div className={styles.communicationGrid}>
          <article className={`${styles.communicationCard} ${styles.communicationComputer}`} data-reveal>
            <header>
              <span>01</span>
              <span><LuMonitorCog aria-hidden /><small>Private beta</small></span>
            </header>
            <div className={`${styles.communicationPreview} ${styles.computerPreview}`} aria-hidden="true">
              <div className={styles.desktopWindow}>
                <div className={styles.desktopToolbar}><i /><i /><i /><span>air / workspace</span></div>
                <div className={styles.desktopCanvas}>
                  <div className={styles.desktopBrowser}><span /><span /><span /><b>Browser</b></div>
                  <div className={styles.desktopFiles}><span>brief.md</span><span>launch-plan</span><span>assets</span></div>
                  <div className={styles.desktopTerminal}><span>&gt; research sources</span><span>&gt; compose next step</span><b>Ready for review</b></div>
                </div>
              </div>
              <span className={styles.computerSignal}><LuSparkles /></span>
            </div>
            <h3>Computer</h3>
            <p>
              A private workspace that can browse, build, render, and finish the task—not just
              describe it.
            </p>
          </article>

          <article className={`${styles.communicationCard} ${styles.communicationPhone}`} data-reveal style={{ "--delay": "100ms" } as CSSProperties}>
            <header>
              <span>02</span>
              <span><LuPhoneCall aria-hidden /><small>Private beta</small></span>
            </header>
            <div className={`${styles.communicationPreview} ${styles.phonePreview}`} aria-hidden="true">
              <div className={styles.phoneChip}>
                <span><LuPhoneCall /></span>
                <p><small>Air line</small><strong>+1 (415) 555–AIR</strong></p>
                <b>Beta</b>
              </div>
            </div>
            <h3>Phone number</h3>
            <p>A dedicated number for calls, texts, confirmations, and conversations that stay attached to the work.</p>
          </article>

          <article className={`${styles.communicationCard} ${styles.communicationInbox}`} data-reveal style={{ "--delay": "180ms" } as CSSProperties}>
            <header>
              <span>03</span>
              <span><LuInbox aria-hidden /><small>Private beta</small></span>
            </header>
            <div className={`${styles.communicationPreview} ${styles.inboxPreview}`} aria-hidden="true">
              <div className={styles.inboxRow}><small>From Air</small><strong>Creator brief is ready</strong><span>3 assets attached · now</span></div>
              <div className={styles.inboxRow}><small>To partners</small><strong>Launch follow-up</strong><span>Scheduled · 10:30</span></div>
            </div>
            <h3>Email and inbox</h3>
            <p>Air can draft, organize, follow up, and keep the details moving while you stay in iMessage.</p>
          </article>
        </div>
      </div>
    </section>
  );
}

export function IMessageDrop() {
  return (
    <section
      className={`section ${styles.dropSection}`}
      id="imessage"
      data-air-scene="ink"
      data-air-cloud-progress="0.78"
      data-air-cloud-rays="0.12"
      data-air-cloud-opacity="0.16"
      aria-labelledby="drop-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>The input is already in your pocket</span>
          <span>iMessage + web</span>
        </div>
        <div className={styles.dropPanel}>
          <div className={styles.dropGrid}>
            <div className={styles.dropCopy} data-reveal>
            <p className="eyebrow">Drop in a thought</p>
            <h2 id="drop-title">Get back something you can use.</h2>
            <p>
              A link can become a research brief. A message can become a launch plan. An image can
              become a Mini App. Air keeps the work attached to one conversation while its computer
              handles the stack behind it.
            </p>
            <pre className={styles.dropCode} aria-hidden="true"><code><i>const</i> air = computer.forYou(&#123; private: <b>true</b> &#125;)<br /><i>await</i> air.compose(request)<br /><i>await</i> air.returnWhenReady()</code></pre>
            <ul>
              <li><LuCheck /> Start with words, links, images, or files</li>
              <li><LuCheck /> Continue with the same context on the web</li>
              <li><LuCheck /> Approve consequential actions before they run</li>
            </ul>
            </div>

            <figure className={styles.dropStage} data-reveal>
              <div className={styles.dropWell} aria-hidden="true">
              <span className={styles.dropMarker}><LuArrowDown /></span>
              {dropAssets.map((asset) => (
                <span
                  className={styles.dropAsset}
                  key={asset.src}
                  style={
                    {
                      "--drop-x": asset.x,
                      "--drop-y": asset.y,
                      "--drop-r": asset.r,
                      "--drop-delay": asset.delay,
                      "--drop-width": asset.visualWidth,
                    } as CSSProperties
                  }
                >
                  <Image
                    src={asset.src}
                    alt={asset.alt}
                    width={asset.imageWidth}
                    height={asset.imageHeight}
                    sizes="(max-width: 900px) 80vw, 40vw"
                  />
                </span>
              ))}
              <div className={styles.dropResult}>
                <span><LuSparkles /></span>
                <div><small>Air returned</small><strong>Launch room ready</strong></div>
                <b>Open</b>
              </div>
              </div>
              <figcaption>Existing iMessage assets settle into one reviewable result.</figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Roadmap() {
  return (
    <section
      className={`section ${styles.roadmapSection}`}
      id="roadmap"
      data-air-scene="pearl"
      data-air-cloud-progress="0.88"
      data-air-cloud-rays="0.07"
      data-air-cloud-opacity="0.1"
      aria-labelledby="roadmap-title"
    >
      <div className="shell">
        <div className="section-rail"><span>Roadmap</span><span>Availability, made explicit</span></div>
        <div className={styles.roadmapHeading} data-reveal>
          <p className="eyebrow">One agent. More ways to run it.</p>
          <h2 id="roadmap-title">Spin up your composable computer where the work belongs.</h2>
        </div>
        <ol className={styles.roadmapList}>
          {roadmapItems.map(({ status, title, Icon, body, tone }, index) => (
            <li data-reveal style={{ "--delay": `${index * 70}ms` } as CSSProperties} key={title}>
              <span className={styles.roadmapNumber}>{String(index + 1).padStart(2, "0")}</span>
              <span className={`${styles.roadmapIcon} ${styles[tone]}`}><Icon aria-hidden /></span>
              <div><small className={`${styles.roadmapStatus} ${styles[tone]}`}>{status}</small><h3>{title}</h3><p>{body}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Pricing() {
  return (
    <section
      className={`section ${styles.pricingSection}`}
      id="pricing"
      data-air-scene="ink"
      data-air-cloud-progress="0.76"
      data-air-cloud-rays="0.12"
      data-air-cloud-opacity="0.16"
      aria-labelledby="pricing-title"
    >
      <div className="shell">
        <div className="section-rail"><span>Private-beta plans</span><span>USD / monthly starting points</span></div>
        <div className={styles.pricingHeading} data-reveal>
          <p className="eyebrow">Choose how much computer Air gets</p>
          <h2 id="pricing-title">Start with more depth. Add environments or dedicated compute.</h2>
          <p>Every plan begins with one personal agent and one persistent workspace.</p>
        </div>

        <div className={styles.pricingGrid}>
          {pricingPlans.map((plan, index) => (
            <article
              className={"featured" in plan && plan.featured ? styles.featuredPlan : undefined}
              data-reveal
              style={{ "--delay": `${index * 60}ms` } as CSSProperties}
              key={plan.name}
              aria-labelledby={`plan-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <header>
                <h3 id={`plan-${plan.name.toLowerCase().replace(/\s+/g, "-")}`}>{plan.name}</h3>
                <small>{plan.status}</small>
              </header>
              <p className={styles.planPrice}>{plan.price}<span>{plan.cadence}</span></p>
              <p className={styles.planDescription}>{plan.description}</p>
              <ul>{plan.features.map((feature) => <li key={feature}><LuCheck aria-hidden />{feature}</li>)}</ul>
              <PreorderButton className={styles.planButton} interest={plan.name} label={plan.cta} />
            </article>
          ))}
        </div>
        <p className={styles.pricingNote}>
          Private-beta pricing is proposed in USD per month. Included usage is subject to safety,
          fair-use, and infrastructure limits. Model, connector, operating-system, hardware, and
          regional availability may change. Third-party fees may apply. No payment is collected by
          the current preorder form.
        </p>
      </div>
    </section>
  );
}

export function ComposableFaq() {
  return (
    <section
      className={`section ${styles.faqSection}`}
      id="faq"
      data-air-scene="pearl"
      data-air-cloud-progress="0.9"
      data-air-cloud-rays="0.05"
      data-air-cloud-opacity="0.1"
      aria-labelledby="faq-title"
    >
      <div className="shell">
        <div className="section-rail"><span>Clear answers</span><span>Product state / August 2026</span></div>
        <div className={styles.faqHeading} data-reveal>
          <p className="eyebrow">Air, in plain language</p>
          <h2 id="faq-title">Questions a personal computer should answer upfront.</h2>
        </div>
        <dl className={styles.faqList}>
          {AIR_FAQ_ITEMS.map((item, index) => (
            <div data-reveal style={{ "--delay": `${index * 55}ms` } as CSSProperties} key={item.question}>
              <dt><span>{String(index + 1).padStart(2, "0")}</span>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function ComposableClosing() {
  return (
    <section
      className={`section ${styles.closingSection}`}
      data-air-scene="cloud"
      data-air-cloud-progress="0.74"
      data-air-cloud-rays="0.2"
      data-air-cloud-opacity="0.2"
      aria-labelledby="closing-title"
    >
      <Image
        className={styles.closingImage}
        src="/images/closing/v2026-08-21-a/blue-hour-horizon.avif"
        alt=""
        fill
        sizes="100vw"
      />
      <div className={styles.closingScrim} aria-hidden />
      <div className={`shell ${styles.closingInner}`} data-reveal>
        <span className={styles.closingOrb}><LuBot aria-hidden /></span>
        <p className="eyebrow">Your computer is waiting</p>
        <h2 id="closing-title">Compose an Air around the way you work.</h2>
        <p>Join the private beta, then map the first job, tools, and approval boundaries with WZRD.</p>
        <PreorderButton label="Join the private beta" />
        <small>No payment today · capacity and features are availability labeled</small>
      </div>
    </section>
  );
}
