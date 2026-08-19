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
  { Icon: SiInstagram, name: "Instagram", color: "#ff4b98", x: "3%", y: "12%" },
  { Icon: SiGmail, name: "Gmail", color: "#ea4335", x: "23%", y: "1%" },
  { Icon: LuMessagesSquare, name: "Slack", color: "#7d5cff", x: "56%", y: "2%" },
  { Icon: SiNotion, name: "Notion", color: "#0b0b0c", x: "82%", y: "12%" },
  { Icon: LuPalette, name: "Canva", color: "#00b8d9", x: "94%", y: "33%" },
  { Icon: SiFigma, name: "Figma", color: "#f24e1e", x: "94%", y: "63%" },
  { Icon: SiGooglecalendar, name: "Calendar", color: "#4285f4", x: "83%", y: "84%" },
  { Icon: SiDropbox, name: "Dropbox", color: "#0061ff", x: "59%", y: "93%" },
  { Icon: SiShopify, name: "Shopify", color: "#76a947", x: "29%", y: "93%" },
  { Icon: SiStripe, name: "Stripe", color: "#635bff", x: "6%", y: "82%" },
  { Icon: SiHubspot, name: "HubSpot", color: "#ff6f3d", x: "-4%", y: "61%" },
  { Icon: SiAirtable, name: "Airtable", color: "#f7c948", x: "-4%", y: "36%" },
  { Icon: SiTiktok, name: "TikTok", color: "#111111", x: "15%", y: "52%" },
  { Icon: SiYoutube, name: "YouTube", color: "#ff0033", x: "78%", y: "53%" },
  { Icon: SiMeta, name: "Meta", color: "#0866ff", x: "69%", y: "23%" },
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
  const [menuOpen, setMenuOpen] = useState(false);
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
      <div className="tapback-menu" aria-label="Tapback reactions">
        {reactions.map((item) => (
          <button
            key={item}
            type="button"
            aria-label={`React ${item}`}
            onClick={() => setReaction(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <button type="button" className="phone-bubble" aria-label="Message. Hover or focus to react.">
        {children}
      </button>
      {reaction && <span className="reaction-badge" aria-label={`Reaction ${reaction}`}>{reaction}</span>}
    </div>
  );
}

function MiniApp() {
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
      <div className="mini-progress"><span /></div>
      <ul>
        <li><span className="task-icon instagram">IG</span><span>Schedule campaign reel</span><LuCheck aria-hidden /></li>
        <li><span className="task-icon mail">M</span><span>Draft creator outreach</span><LuCheck aria-hidden /></li>
        <li className="active"><span className="task-icon ads">A</span><span>Build Meta ad set</span><i>running</i></li>
      </ul>
      <button type="button" className="mini-review">Review launch board</button>
    </article>
  );
}

function IPhoneDemo() {
  return (
    <div className="phone-stage" aria-label="Air in iMessage">
      <div className="app-orbit" aria-hidden="true">
        {appIcons.map(({ Icon, name, color, x, y }, index) => (
          <span
            key={name}
            className="app-icon"
            style={{
              "--app-x": x,
              "--app-y": y,
              "--app-color": color,
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
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      if (reduced.matches) {
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
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduced.removeEventListener("change", update);
    };
  }, []);

  const heroStyle = {
    "--cloud-progress": progress,
    "--hero-progress": Math.min(1, progress * 1.55),
  } as CSSProperties;

  return (
    <section ref={sectionRef} className="hero-scroll" style={heroStyle} aria-labelledby="hero-title">
      <div className="hero-sticky">
        <div className="hero-sky" aria-hidden />
        <div className="sun-haze" aria-hidden />
        {createElement("dk-clouds", {
          "aria-hidden": "true",
          className: "webgl-clouds",
          from: "blue",
          fade: "",
          pixel: "6",
          scale: "1.12",
          speed: "0.45",
          cover: "0.24",
          density: "2.7",
          wind: "0.6",
          "wind-radius": "360",
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
            <h1 id="hero-title">
              Your creative assistant,
              <em>inside iMessage.</em>
            </h1>
            <p>
              Text Air what you need. It researches, creates, coordinates your apps, and brings the
              work back to the conversation you already live in.
            </p>
            <div className="hero-actions">
              <PreorderButton />
              <a className="text-link" href="#how-it-works">see how Air moves <span>↓</span></a>
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
