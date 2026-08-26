"use client";

import {
  createContext,
  createElement,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
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
  LuMessagesSquare,
  LuPalette,
} from "react-icons/lu";

import {
  airDemoReducer,
  INITIAL_AIR_DEMO_STATE,
  type AirDemoAction,
  type AirDemoState,
} from "@/components/air-demo-state";
import {
  DIRECTIONS,
  getDirection,
  type DirectionSpec,
} from "@/content/directions";
import { AIR_TAGLINE } from "@/lib/air-copy";
import { resolveHeroTimeline } from "@/lib/hero-timeline";
import { ShinyText } from "@/components/ShinyText";
import { PlasmaButton } from "@/components/PlasmaButton";

export type { AirDemoAction, AirDemoState } from "@/components/air-demo-state";

export type AirExperienceValue = {
  state: AirDemoState;
  directions: readonly DirectionSpec[];
  selectedDirection: DirectionSpec;
  dispatch: Dispatch<AirDemoAction>;
  announce: (message: string) => void;
  cinematicEnabled: boolean;
  memoryEchoEnabled: boolean;
};

type AirExperienceProps = {
  cinematicEnabled: boolean;
  memoryEchoEnabled: boolean;
  phoneDemo: ReactNode;
  children?: ReactNode;
};

type HeroVariables = CSSProperties & {
  "--cloud-progress": number;
  "--cloud-veil-progress": number;
  "--cloud-prompt-progress": number;
  "--hero-progress": number;
  "--poster-exit-progress": number;
  "--reveal-progress": number;
  "--title-reveal-progress": number;
  "--title-exit-progress": number;
  "--title-progress": number;
  "--title-sheen-position": string;
  "--handoff-progress": number;
  "--orbit-progress": number;
  "--orbit-angle": string;
  "--counter-orbit-angle": string;
};

type SkyElement = HTMLElement & { progress: number; skyStatus?: string };
type IntroCompleteEvent = Event & { detail?: { bypassCinematic?: boolean } };

const AirExperienceContext = createContext<AirExperienceValue | null>(null);

const appIcons = [
  { Icon: SiInstagram, name: "Instagram", color: "#ff4b98", x: "7%", y: "18%", size: "3.25rem", rotate: "-4deg" },
  { Icon: SiGmail, name: "Gmail", color: "#ea4335", x: "21%", y: "6%", size: "2.7rem", rotate: "3deg" },
  { Icon: LuMessagesSquare, name: "Slack", color: "#7d5cff", x: "39%", y: "2%", size: "2.55rem", rotate: "-2deg" },
  // Keep the outer arc inside the phone half of the hero. The promise owns
  // the opposing column; an app tile should never land on its last line.
  { Icon: SiNotion, name: "Notion", color: "#15171a", x: "68%", y: "16%", size: "3rem", rotate: "4deg" },
  { Icon: LuPalette, name: "Canva", color: "#00b8d9", x: "82%", y: "34%", size: "2.75rem", rotate: "-3deg" },
  { Icon: SiFigma, name: "Figma", color: "#f24e1e", x: "83%", y: "59%", size: "3.1rem", rotate: "5deg" },
  { Icon: SiGooglecalendar, name: "Calendar", color: "#4285f4", x: "72%", y: "82%", size: "2.7rem", rotate: "-3deg" },
  { Icon: SiDropbox, name: "Dropbox", color: "#0061ff", x: "55%", y: "92%", size: "2.5rem", rotate: "4deg" },
  { Icon: SiShopify, name: "Shopify", color: "#76a947", x: "48%", y: "96%", size: "2.65rem", rotate: "-4deg" },
  { Icon: SiStripe, name: "Stripe", color: "#635bff", x: "23%", y: "88%", size: "2.7rem", rotate: "3deg" },
  { Icon: SiHubspot, name: "HubSpot", color: "#ff6f3d", x: "5%", y: "70%", size: "3rem", rotate: "-5deg" },
  { Icon: SiAirtable, name: "Airtable", color: "#f7c948", x: "-1%", y: "47%", size: "2.8rem", rotate: "4deg" },
  { Icon: SiTiktok, name: "TikTok", color: "#111111", x: "14%", y: "41%", size: "2.45rem", rotate: "-2deg" },
  { Icon: SiYoutube, name: "YouTube", color: "#ff0033", x: "68%", y: "49%", size: "2.55rem", rotate: "4deg" },
  { Icon: SiMeta, name: "Meta", color: "#0866ff", x: "62%", y: "26%", size: "2.8rem", rotate: "-3deg" },
] as const;

const visuallyHidden: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: 0,
};

export function useAirExperience(): AirExperienceValue {
  const experience = useContext(AirExperienceContext);
  if (!experience) {
    throw new Error("useAirExperience must be used inside AirExperience.");
  }
  return experience;
}

export function AirExperience({
  cinematicEnabled,
  memoryEchoEnabled,
  phoneDemo,
  children,
}: AirExperienceProps) {
  const [state, dispatch] = useReducer(
    airDemoReducer,
    INITIAL_AIR_DEMO_STATE as AirDemoState,
  );
  const announce = useCallback(
    (message: string) => dispatch({ type: "announce", message }),
    [],
  );
  const selectedDirection = getDirection(state.directionId);
  const value = useMemo<AirExperienceValue>(
    () => ({
      state,
      directions: DIRECTIONS,
      selectedDirection,
      dispatch,
      announce,
      cinematicEnabled,
      memoryEchoEnabled,
    }),
    [
      announce,
      cinematicEnabled,
      memoryEchoEnabled,
      selectedDirection,
      state,
    ],
  );

  return (
    <AirExperienceContext.Provider value={value}>
      <HeroPresentation phoneDemo={phoneDemo} />
      {children}
    </AirExperienceContext.Provider>
  );
}

function HeroPresentation({ phoneDemo }: { phoneDemo: ReactNode }) {
  const { state, cinematicEnabled } = useAirExperience();
  const sectionRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLElement>(null);
  const cinematicActiveRef = useRef(false);
  const [cinematicActive, setCinematicActive] = useState(false);
  const [cinematicBypassed, setCinematicBypassed] = useState(false);
  const useCinematicPresentation = cinematicEnabled && !cinematicBypassed;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compactViewport = window.matchMedia("(max-width: 900px)");
    const finePointer = window.matchMedia("(pointer: fine)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    let animationFrame = 0;
    let focusFloorActive = false;
    let headerFocusActive = false;
    let latestRevealProgress = 1;
    let cancelled = false;
    let shaderStatus: "pending" | "ready" | "fallback" = "pending";

    const setSkyProgress = () => {
      if (cancelled || !skyRef.current || !customElements.get("wz-sky")) return;
      const sky = skyRef.current as SkyElement;
      // The opening owns the only full-screen shader while it is actually
      // revealing the finframe. Once clear, release its render loop so the
      // page-level atmosphere can take over below the fold without two
      // full-screen canvases animating at once.
      const mode = latestRevealProgress >= 0.995 ? "off" : "full";
      sky.setAttribute("rays", "0.86");
      if (sky.getAttribute("mode") !== mode) sky.setAttribute("mode", mode);
      sky.progress = latestRevealProgress;
    };

    const handleSkyStatus = (event: Event) => {
      const detail = (event as CustomEvent<{ status?: string }>).detail;
      shaderStatus = detail?.status === "fallback" ? "fallback" : "ready";
      section.dataset.airShader = shaderStatus;
    };

    const update = () => {
      animationFrame = 0;
      const cinematicEligible =
        useCinematicPresentation &&
        !reducedMotion.matches &&
        !compactViewport.matches &&
        finePointer.matches &&
        !forcedColors.matches &&
        !connection?.saveData;

      let progress = 1;
      if (cinematicEligible) {
        const rect = section.getBoundingClientRect();
        const travel = Math.max(1, rect.height - window.innerHeight);
        progress = Math.min(1, Math.max(0, -rect.top / travel));
        if (focusFloorActive || headerFocusActive) progress = 1;
      }

      const timeline = resolveHeroTimeline(progress);
      // Keep the poster completely clean during its hold. The cloud curtain
      // enters only as the poster begins to dissolve, then clears on its own
      // track so the title can feel like it rises from the atmosphere.
      const cloudVeilProgress =
        timeline.posterExitProgress * (1 - timeline.revealProgress);
      const cloudPromptProgress =
        timeline.posterExitProgress * Math.max(0, 1 - timeline.revealProgress * 3);
      latestRevealProgress = timeline.revealProgress;
      if (cinematicActiveRef.current !== cinematicEligible) {
        cinematicActiveRef.current = cinematicEligible;
        setCinematicActive(cinematicEligible);
      }
      section.dataset.airPresentation = cinematicEligible
        ? "cinematic"
        : "static";
      section.dataset.airShader = cinematicEligible ? shaderStatus : "off";
      section.dataset.airPoster =
        timeline.posterExitProgress >= 0.995 ? "hidden" : "visible";
      section.style.setProperty("--reveal-progress", String(timeline.revealProgress));
      section.style.setProperty("--poster-exit-progress", String(timeline.posterExitProgress));
      section.style.setProperty("--title-reveal-progress", String(timeline.titleRevealProgress));
      section.style.setProperty("--title-exit-progress", String(timeline.titleExitProgress));
      section.style.setProperty("--title-progress", String(timeline.titleProgress));
      // The highlight is tied to the title track instead of a free-running
      // loop: it enters with the words, settles while the promise holds, and
      // leaves with the handoff to the product hero.
      const titleSheenPosition =
        150 - timeline.titleRevealProgress * 160 - timeline.titleExitProgress * 110;
      section.style.setProperty("--title-sheen-position", `${titleSheenPosition}%`);
      section.style.setProperty("--handoff-progress", String(timeline.handoffProgress));
      section.style.setProperty("--orbit-progress", String(timeline.orbitProgress));
      section.style.setProperty("--orbit-angle", `${timeline.orbitProgress * 25}deg`);
      section.style.setProperty("--counter-orbit-angle", `${timeline.orbitProgress * -25}deg`);
      // Legacy custom properties retain the existing non-cinematic fallback
      // rules while the named timeline tracks drive the cloudborne sequence.
      section.style.setProperty("--cloud-progress", String(timeline.revealProgress));
      section.style.setProperty("--cloud-veil-progress", String(cloudVeilProgress));
      section.style.setProperty("--cloud-prompt-progress", String(cloudPromptProgress));
      section.style.setProperty("--hero-progress", String(timeline.handoffProgress));
      document.documentElement.dataset.airHeroHeader =
        timeline.headerRevealed ? "revealed" : "covered";
      setSkyProgress();
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update);
    };
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target;
      // Keyboard focus must never land on an obscured product control. The
      // atmospheric sequence is visual-only once someone starts navigating.
      focusFloorActive = target instanceof Element;
      scheduleUpdate();
    };
    const handleFocusOut = (event: FocusEvent) => {
      if (
        event.relatedTarget instanceof Node &&
        section.contains(event.relatedTarget)
      ) {
        return;
      }
      focusFloorActive = false;
      scheduleUpdate();
    };
    const handleDocumentFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest(".site-header")) return;
      headerFocusActive = true;
      scheduleUpdate();
    };
    const handleDocumentFocusOut = () => {
      window.requestAnimationFrame(() => {
        if (cancelled) return;
        headerFocusActive = Boolean(
          document.activeElement instanceof Element &&
            document.activeElement.closest(".site-header"),
        );
        scheduleUpdate();
      });
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    // The intro is mounted alongside this experience. Give its final frame a
    // paint to leave the modal before recalculating the poster-first scene;
    // this prevents a stale pre-intro value from leaving the scroll sequence
    // hidden after a natural video completion.
    const handleIntroComplete = (event: Event) => {
      if ((event as IntroCompleteEvent).detail?.bypassCinematic) {
        setCinematicBypassed(true);
      }
      window.requestAnimationFrame(scheduleUpdate);
    };
    window.addEventListener("air:intro-complete", handleIntroComplete);
    section.addEventListener("focusin", handleFocusIn);
    section.addEventListener("focusout", handleFocusOut);
    document.addEventListener("focusin", handleDocumentFocusIn);
    document.addEventListener("focusout", handleDocumentFocusOut);
    skyRef.current?.addEventListener("wz-sky-status", handleSkyStatus);
    const initialSkyStatus = (skyRef.current as SkyElement | null)?.skyStatus;
    if (initialSkyStatus === "ready" || initialSkyStatus === "fallback") {
      handleSkyStatus(
        new CustomEvent("wz-sky-status", { detail: { status: initialSkyStatus } }),
      );
    }
    reducedMotion.addEventListener("change", scheduleUpdate);
    compactViewport.addEventListener("change", scheduleUpdate);
    finePointer.addEventListener("change", scheduleUpdate);
    forcedColors.addEventListener("change", scheduleUpdate);

    if (useCinematicPresentation) {
      customElements.whenDefined("wz-sky").then(setSkyProgress);
    }

    return () => {
      cancelled = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("air:intro-complete", handleIntroComplete);
      section.removeEventListener("focusin", handleFocusIn);
      section.removeEventListener("focusout", handleFocusOut);
      document.removeEventListener("focusin", handleDocumentFocusIn);
      document.removeEventListener("focusout", handleDocumentFocusOut);
      skyRef.current?.removeEventListener("wz-sky-status", handleSkyStatus);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      compactViewport.removeEventListener("change", scheduleUpdate);
      finePointer.removeEventListener("change", scheduleUpdate);
      forcedColors.removeEventListener("change", scheduleUpdate);
      delete document.documentElement.dataset.airHeroHeader;
    };
  }, [useCinematicPresentation]);

  const heroStyle: HeroVariables = useCinematicPresentation
    ? {
      "--cloud-progress": 0,
      "--cloud-veil-progress": 0,
      "--cloud-prompt-progress": 0,
      "--hero-progress": 0,
      "--poster-exit-progress": 0,
      "--reveal-progress": 0,
      "--title-reveal-progress": 0,
      "--title-exit-progress": 0,
      "--title-progress": 0,
      "--title-sheen-position": "150%",
      "--handoff-progress": 0,
        "--orbit-progress": 0,
        "--orbit-angle": "0deg",
        "--counter-orbit-angle": "0deg",
      }
    : {
      "--cloud-progress": 1,
      "--cloud-veil-progress": 0,
      "--cloud-prompt-progress": 0,
      "--hero-progress": 1,
      "--poster-exit-progress": 1,
      "--reveal-progress": 1,
      "--title-reveal-progress": 0,
      "--title-exit-progress": 1,
      "--title-progress": 0,
      "--title-sheen-position": "150%",
      "--handoff-progress": 1,
        "--orbit-progress": 1,
        "--orbit-angle": "25deg",
        "--counter-orbit-angle": "-25deg",
        height: "auto",
      };

  return (
    <section
      ref={sectionRef}
      className="hero-scroll"
      style={heroStyle}
      data-air-presentation={useCinematicPresentation ? "cinematic-pending" : "static"}
      aria-labelledby="hero-title"
    >
      <div
        className="hero-sticky"
        style={useCinematicPresentation ? undefined : { position: "relative" }}
      >
        <div className="hero-sky" aria-hidden />
        <div className="sun-haze" aria-hidden />

        <div
          id="air-opening"
          className="hero-opening"
          aria-hidden="true"
        >
          <img
            className="hero-opening-image"
            src="/images/opening/v2026-08-19-a/finframe.webp"
            alt=""
            width={1920}
            height={1080}
            fetchPriority="high"
          />
        </div>

        {cinematicActive &&
          createElement("dk-gradient", {
            "aria-hidden": "true",
            className: "hero-dither-lens",
            from: "cyan",
            direction: "radial",
            variant: "dotted",
            pixel: "5",
            bloom: "low",
            fade: "",
          })}
        {useCinematicPresentation &&
          createElement("wz-sky", {
            ref: skyRef,
            "aria-hidden": "true",
            className: "hero-shader",
          })}
        {useCinematicPresentation && (
          <div className="cloud-curtain" aria-hidden>
            <div className="cloud-bank bank-one" />
            <div className="cloud-bank bank-two" />
            <p>scroll to clear the clouds <LuChevronDown /></p>
          </div>
        )}
        <p className="hero-cloud-title" aria-hidden="true">
          <ShinyText
            className="hero-cloud-shiny"
            color="#eaf8ff"
            shineColor="#ffffff"
            spread={102}
            disabled={!cinematicActive}
          >
            {AIR_TAGLINE}
          </ShinyText>
        </p>
        <div className="hero-grain" aria-hidden />

        <div className="hero-frame" aria-hidden>
          <span>air.wzrd.tech</span>
          <span>personal compute / iMessage</span>
        </div>

        <div className="hero-content shell">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="pulse-dot" aria-hidden /> air by WZRD.tech
              <span>Private beta</span>
            </div>
            <h1
              id="hero-title"
              tabIndex={-1}
            >
              <ShinyText
                className="hero-shiny-line"
                color="#03234d"
                shineColor="#3d7faa"
                speed={13.2}
                spread={112}
              >
                Your personal,
              </ShinyText>
              {" "}
              <ShinyText
                className="hero-shiny-line"
                color="#03234d"
                shineColor="#3d7faa"
                speed={13.2}
                delay={0.42}
                spread={112}
              >
                creative composable
              </ShinyText>
              {" "}
              <ShinyText
                className="hero-shiny-line hero-shiny-line--signal"
                color="#045991"
                shineColor="#4b8fc1"
                speed={13.2}
                delay={0.84}
                spread={112}
              >
                computer.
              </ShinyText>
            </h1>
            <p>
              One persistent AI agent with its own workspace, memory, skills, app
              connections, and Mini Apps—available from iMessage and the web.
            </p>
            <p className="hero-status">
              Ubuntu private beta · 1,000+ app-toolkit catalog · human approval built in.
            </p>

            <div className="hero-actions">
              <PlasmaButton
                className="hero-plasma-button"
                href="https://buy.stripe.com/bJe5kF8Pg49RaPw9M6a3u02"
              />
              <a className="text-link" href="#what-is-air">Explore the computer <span aria-hidden>↓</span></a>
            </div>
            <ul className="hero-proof" aria-label="Air preview status">
              <li><LuCheck aria-hidden /> one person · one persistent agent</li>
              <li><LuCheck aria-hidden /> iMessage + web continuity</li>
              <li><LuCheck aria-hidden /> approval required</li>
            </ul>
          </div>

          <div className="phone-stage" role="region" aria-label="Air in iMessage">
            <div className="app-orbit" aria-hidden="true">
              <div className="app-orbit-motion">
                <svg
                  className="orbit-map"
                  viewBox="0 0 720 820"
                  preserveAspectRatio="none"
                  focusable="false"
                >
                  <path d="M42 238C168 58 431 26 666 190" />
                  <path d="M25 583C171 778 474 812 692 632" />
                  {[145, 268, 392, 518, 631].map((cx, index) => (
                    <circle
                      key={cx}
                      cx={cx}
                      cy={[174, 106, 92, 116, 174][index]}
                      r="3.25"
                    />
                  ))}
                  {[96, 206, 520, 650].map((cx, index) => (
                    <circle
                      key={cx}
                      cx={cx}
                      cy={[526, 700, 752, 654][index]}
                      r="3.25"
                    />
                  ))}
                </svg>
                {appIcons.map(
                  ({ Icon, name, color, x, y, size, rotate }, index) => (
                    <span
                      key={name}
                      className="app-icon"
                      style={
                        {
                          "--app-x": x,
                          "--app-y": y,
                          "--app-color": color,
                          "--app-size": size,
                          "--app-rotate": rotate,
                          "--app-delay": `${index * -0.42}s`,
                        } as CSSProperties
                      }
                      title={name}
                    >
                      <span className="app-icon-face"><Icon /></span>
                    </span>
                  ),
                )}
              </div>
            </div>
            {phoneDemo}
          </div>
        </div>

        <p
          className="air-demo-live"
          aria-live="polite"
          aria-atomic="true"
          style={visuallyHidden}
        >
          {state.announcement}
        </p>
      </div>
    </section>
  );
}
