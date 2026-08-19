"use client";

import {
  type CSSProperties,
  createElement,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  SiAirtable,
  SiDropbox,
  SiFigma,
  SiGmail,
  SiGooglecalendar,
  SiHubspot,
  SiInstagram,
  SiMeta,
  SiNotion,
  SiShopify,
  SiStripe,
  SiTiktok,
  SiYoutube,
} from "react-icons/si";
import {
  LuCheck,
  LuChevronDown,
  LuCircleEllipsis,
  LuMessagesSquare,
  LuPalette,
  LuSparkles,
} from "react-icons/lu";

import { PreorderButton } from "@/components/Preorder";

const appIcons = [
  { Icon: SiInstagram, name: "Instagram", color: "#ff4b98", x: "7%", y: "18%", size: "3.25rem", rotate: "-4deg" },
  { Icon: SiGmail, name: "Gmail", color: "#ea4335", x: "21%", y: "6%", size: "2.7rem", rotate: "3deg" },
  { Icon: LuMessagesSquare, name: "Slack", color: "#7d5cff", x: "39%", y: "2%", size: "2.55rem", rotate: "-2deg" },
  { Icon: SiNotion, name: "Notion", color: "#15171a", x: "85%", y: "16%", size: "3rem", rotate: "4deg" },
  { Icon: LuPalette, name: "Canva", color: "#00b8d9", x: "97%", y: "34%", size: "2.75rem", rotate: "-3deg" },
  { Icon: SiFigma, name: "Figma", color: "#f24e1e", x: "98%", y: "59%", size: "3.1rem", rotate: "5deg" },
  { Icon: SiGooglecalendar, name: "Calendar", color: "#4285f4", x: "87%", y: "82%", size: "2.7rem", rotate: "-3deg" },
  { Icon: SiDropbox, name: "Dropbox", color: "#0061ff", x: "70%", y: "92%", size: "2.5rem", rotate: "4deg" },
  { Icon: SiShopify, name: "Shopify", color: "#76a947", x: "48%", y: "96%", size: "2.65rem", rotate: "-4deg" },
  { Icon: SiStripe, name: "Stripe", color: "#635bff", x: "23%", y: "88%", size: "2.7rem", rotate: "3deg" },
  { Icon: SiHubspot, name: "HubSpot", color: "#ff6f3d", x: "5%", y: "70%", size: "3rem", rotate: "-5deg" },
  { Icon: SiAirtable, name: "Airtable", color: "#f7c948", x: "-1%", y: "47%", size: "2.8rem", rotate: "4deg" },
  { Icon: SiTiktok, name: "TikTok", color: "#111111", x: "14%", y: "41%", size: "2.45rem", rotate: "-2deg" },
  { Icon: SiYoutube, name: "YouTube", color: "#ff0033", x: "80%", y: "49%", size: "2.55rem", rotate: "4deg" },
  { Icon: SiMeta, name: "Meta", color: "#0866ff", x: "72%", y: "26%", size: "2.8rem", rotate: "-3deg" },
] as const;

const reactions = ["❤️", "👍", "👎", "HA HA", "‼️", "?"];

function TapbackMessage({
  side,
  children,
}: {
  side: "air" | "you";
  children: React.ReactNode;
}) {
  const [reaction, setReaction] = useState<string | null>(side === "you" ? "👍" : null);
  const [menuOpen, setMenuOpen] = useState(side === "you");
  return (
    <div
      className={`phone-message-row ${side} ${menuOpen ? "tapback-open" : ""}`}
      onMouseEnter={() => setMenuOpen(true)}
      onMouseLeave={() => setMenuOpen(false)}
      onFocus={() => setMenuOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setMenuOpen(false);
      }}
    >
      <button
        type="button"
        className="phone-bubble"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen(true)}
      >
        {children}
      </button>
      <div className="tapback-menu" role="toolbar" aria-label="Tapback reactions">
        {reactions.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`React ${item}`}
            aria-pressed={reaction === item}
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => setReaction(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {reaction && <span className="reaction-badge" aria-label={`Reaction ${reaction}`}>{reaction}</span>}
    </div>
  );
}

function MiniApp() {
  const [reviewed, setReviewed] = useState(false);
  const tasks = [
    { label: "Schedule campaign reel", icon: "IG", tone: "instagram", state: "done" },
    { label: "Draft creator outreach", icon: "M", tone: "mail", state: "done" },
    { label: "Build Meta ad set", icon: "A", tone: "ads", state: "done" },
    { label: "Design hero assets", icon: "F", tone: "design", state: "running" },
    { label: "Write launch copy", icon: "W", tone: "copy", state: "queued" },
    { label: "Sync calendar & reminders", icon: "31", tone: "calendar", state: "queued" },
    { label: "Track results", icon: "↗", tone: "analytics", state: "queued" },
  ] as const;

  return (
    <article className="mini-app" aria-label="Air launch workflow status">
      <div className="mini-app-head">
        <span className="air-orb"><LuSparkles aria-hidden /></span>
        <div>
          <strong>Launch conductor</strong>
          <small>Air is working across 7 apps</small>
        </div>
        <LuCircleEllipsis aria-hidden />
      </div>
      <div className={`mini-progress ${reviewed ? "complete" : ""}`}><span /></div>
      <ul>
        {tasks.map((task) => {
          const state = reviewed ? "done" : task.state;
          return (
            <li className={state === "running" ? "active" : undefined} key={task.label}>
              <span className={`task-icon ${task.tone}`}>{task.icon}</span>
              <span>{task.label}</span>
              {state === "done" ? <LuCheck aria-hidden /> : <i>{state}</i>}
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        className={`mini-review ${reviewed ? "is-reviewed" : ""}`}
        aria-pressed={reviewed}
        onClick={() => setReviewed((value) => !value)}
      >
        {reviewed ? "Launch board approved" : "Review launch board"}
      </button>
    </article>
  );
}

function IPhoneDemo() {
  return (
    <div className="phone-stage" aria-label="Air in iMessage">
      <div className="app-orbit" aria-hidden="true">
        <svg className="orbit-map" viewBox="0 0 720 820" preserveAspectRatio="none" focusable="false">
          <path d="M42 238C168 58 431 26 666 190" />
          <path d="M18 398C121 171 472 109 704 336" />
          <path d="M25 583C171 778 474 812 692 632" />
          <path d="M120 690C274 844 519 826 650 708" />
          {[145, 268, 392, 518, 631].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[174, 106, 92, 116, 174][index]} r="3.25" />
          ))}
          {[96, 206, 520, 650].map((cx, index) => (
            <circle key={cx} cx={cx} cy={[526, 700, 752, 654][index]} r="3.25" />
          ))}
        </svg>
        {appIcons.map(({ Icon, name, color, x, y, size, rotate }, index) => (
          <span
            key={name}
            className="app-icon"
            style={{
              "--app-x": x,
              "--app-y": y,
              "--app-color": color,
              "--app-size": size,
              "--app-rotate": rotate,
              "--app-delay": `${index * -0.42}s`,
            } as CSSProperties}
            title={name}
          >
            <Icon />
          </span>
        ))}
      </div>

      <div className="iphone-shell">
        <div className="iphone-screen">
          <div className="dynamic-island" aria-hidden />
          <div className="ios-status"><span>9:41</span><span>● ●● ᯤ ▰</span></div>
          <div className="thread-head">
            <span className="thread-back">‹</span>
            <span className="thread-avatar">A</span>
            <span>air by WZRD.tech <small>›</small></span>
          </div>
          <div className="thread-body">
            <p className="thread-time">Today 9:41</p>
            <TapbackMessage side="you">Air, turn this drop into a full launch.</TapbackMessage>
            <TapbackMessage side="air">
              On it. I’ll brief your channels, prep the assets, and keep you posted here.
            </TapbackMessage>
            <MiniApp />
            <div className="typing-row" aria-label="Air is working">
              <span /><span /><span />
              <small>Air is orchestrating</small>
            </div>
          </div>
          <div className="message-composer"><span>＋</span><div>iMessage</div><span>◉</span></div>
          <div className="home-indicator" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const staticHero = window.matchMedia("(max-width: 900px)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      if (reduced.matches || staticHero.matches) {
        setProgress(1);
        return;
      }
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, -rect.top / travel)));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    reduced.addEventListener("change", update);
    staticHero.addEventListener("change", update);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduced.removeEventListener("change", update);
      staticHero.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const setShaderProgress = () => {
      if (cancelled || !skyRef.current) return;
      // `progress` is a custom-element property, not an attribute. Waiting for
      // definition avoids shadowing its setter while the afterInteractive script loads.
      (skyRef.current as HTMLElement & { progress: number }).progress = progress;
    };

    if (customElements.get("wz-sky")) {
      setShaderProgress();
    } else {
      customElements.whenDefined("wz-sky").then(setShaderProgress);
    }

    return () => {
      cancelled = true;
    };
  }, [progress]);

  const heroStyle = {
    "--cloud-progress": progress,
    "--hero-progress": Math.min(1, progress * 1.55),
  } as CSSProperties;

  return (
    <section ref={sectionRef} className="hero-scroll" style={heroStyle} aria-labelledby="hero-title">
      <div className="hero-sticky">
        <div className="hero-sky" aria-hidden />
        <div className="sun-haze" aria-hidden />
        {createElement("wz-sky", {
          ref: skyRef,
          "aria-hidden": "true",
          className: "hero-shader",
          rays: "0.86",
        })}
        <div className="cloud-curtain" aria-hidden>
          <div className="cloud-bank bank-one" />
          <div className="cloud-bank bank-two" />
          <div className="cloud-bank bank-three" />
          <p>scroll to clear the clouds <LuChevronDown /></p>
        </div>
        <div className="hero-grain" aria-hidden />

        <div className="hero-frame" aria-hidden>
          <span>air.wzrd.tech</span>
          <span>creative intelligence / iMessage</span>
        </div>

        <div className="hero-content shell">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="pulse-dot" aria-hidden /> air by WZRD.tech
              <span>private preorder</span>
            </div>
            <h1 id="hero-title" aria-label="Your creative assistant, inside iMessage.">
              <span>Your creative</span>
              <span>assistant,</span>
              <em>inside iMessage.</em>
            </h1>
            <p>
              Text Air what you need. It researches, creates, coordinates your apps, and brings the
              work back to the conversation you already live in.
            </p>
            <div className="hero-actions">
              <PreorderButton />
            </div>
            <ul className="hero-proof" aria-label="Air benefits">
              <li><LuCheck aria-hidden /> no new app</li>
              <li><LuCheck aria-hidden /> one private thread</li>
              <li><LuCheck aria-hidden /> every tool connected</li>
            </ul>
          </div>
          <IPhoneDemo />
        </div>
      </div>
    </section>
  );
}
