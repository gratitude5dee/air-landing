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
import { PreorderButton } from "@/components/Preorder";
import {
  DIRECTIONS,
  getDirection,
  type DirectionSpec,
} from "@/content/directions";

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
  "--hero-progress": number;
};

type SkyElement = HTMLElement & { progress: number };

const AirExperienceContext = createContext<AirExperienceValue | null>(null);

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
  const { state, directions, dispatch, cinematicEnabled } = useAirExperience();
  const sectionRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLElement>(null);
  const cinematicActiveRef = useRef(false);
  const [cinematicActive, setCinematicActive] = useState(false);

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
    let latestProgress = 1;
    let cancelled = false;

    const setSkyProgress = () => {
      if (cancelled || !skyRef.current) return;
      (skyRef.current as SkyElement).progress = latestProgress;
    };

    const update = () => {
      animationFrame = 0;
      const cinematicEligible =
        cinematicEnabled &&
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
        if (focusFloorActive) progress = Math.max(0.78, progress);
      }

      latestProgress = progress;
      if (cinematicActiveRef.current !== cinematicEligible) {
        cinematicActiveRef.current = cinematicEligible;
        setCinematicActive(cinematicEligible);
      }
      section.dataset.airPresentation = cinematicEligible
        ? "cinematic"
        : "static";
      section.style.setProperty("--cloud-progress", String(progress));
      section.style.setProperty(
        "--hero-progress",
        String(Math.min(1, progress * 1.42)),
      );
      document.documentElement.dataset.airHeroHeader =
        progress >= 0.62 ? "revealed" : "covered";
      setSkyProgress();
    };

    const scheduleUpdate = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(update);
    };
    const handleFocusIn = () => {
      focusFloorActive = true;
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

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    section.addEventListener("focusin", handleFocusIn);
    section.addEventListener("focusout", handleFocusOut);
    reducedMotion.addEventListener("change", scheduleUpdate);
    compactViewport.addEventListener("change", scheduleUpdate);
    finePointer.addEventListener("change", scheduleUpdate);
    forcedColors.addEventListener("change", scheduleUpdate);

    if (cinematicEnabled && !customElements.get("wz-sky")) {
      customElements.whenDefined("wz-sky").then(setSkyProgress);
    }

    return () => {
      cancelled = true;
      if (animationFrame) cancelAnimationFrame(animationFrame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      section.removeEventListener("focusin", handleFocusIn);
      section.removeEventListener("focusout", handleFocusOut);
      reducedMotion.removeEventListener("change", scheduleUpdate);
      compactViewport.removeEventListener("change", scheduleUpdate);
      finePointer.removeEventListener("change", scheduleUpdate);
      forcedColors.removeEventListener("change", scheduleUpdate);
      delete document.documentElement.dataset.airHeroHeader;
    };
  }, [cinematicEnabled]);

  const heroStyle: HeroVariables = cinematicEnabled
    ? {
        "--cloud-progress": 0,
        "--hero-progress": 0,
      }
    : {
        "--cloud-progress": 1,
        "--hero-progress": 1,
        height: "auto",
      };

  return (
    <section
      ref={sectionRef}
      className="hero-scroll"
      style={heroStyle}
      data-air-presentation={cinematicEnabled ? "cinematic-pending" : "static"}
      aria-labelledby="hero-title"
    >
      <div
        className="hero-sticky"
        style={cinematicEnabled ? undefined : { position: "relative" }}
      >
        <div className="hero-sky" aria-hidden />
        <div className="sun-haze" aria-hidden />

        <div
          id="air-opening"
          className="hero-opening"
          role="region"
          aria-label="Air opening"
          tabIndex={-1}
        >
          <img
            className="hero-opening-image"
            src="/images/opening/v2026-08-19-a/finframe.webp"
            alt="Air by WZRD.tech in an open blue sky above clouds."
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
        {cinematicActive &&
          createElement("dk-bubble", {
            "aria-hidden": "true",
            className: "hero-pointer-trail",
            from: "blue",
            pixel: "4",
            size: "44",
            trail: "18",
            bloom: "low",
            glow: "#a8ddff",
          })}
        {cinematicEnabled &&
          createElement("wz-sky", {
            ref: skyRef,
            "aria-hidden": "true",
            className: "hero-shader",
            rays: "0.86",
          })}
        {cinematicEnabled && (
          <div className="cloud-curtain" aria-hidden>
            <div className="cloud-bank bank-one" />
            <div className="cloud-bank bank-two" />
            <div className="cloud-bank bank-three" />
            <p>scroll to clear the clouds <LuChevronDown /></p>
          </div>
        )}
        <div className="hero-grain" aria-hidden />

        <div className="hero-frame" aria-hidden>
          <span>air.wzrd.tech</span>
          <span>creative intelligence / iMessage</span>
        </div>

        <div className="hero-content shell">
          <div className="hero-copy">
            <div className="hero-kicker">
              <span className="pulse-dot" aria-hidden /> air by WZRD.tech
              <span>Interface preview</span>
            </div>
            <h1 id="hero-title">
              <span>Text the beginning.</span>
              <em>Get the first visual back.</em>
            </h1>
            <p>
              Air is a private creative assistant in iMessage. Send the beginning,
              react to the first visual, and keep the creative conversation in one
              thread.
            </p>

            <div
              className="direction-cues"
              role="group"
              aria-label="Choose a curated direction · Interface preview"
            >
              {directions.map((direction) => {
                const selected = state.directionId === direction.id;
                return (
                  <button
                    key={direction.id}
                    type="button"
                    className={`direction-chip${selected ? " is-selected" : ""}`}
                    aria-pressed={selected}
                    aria-current={selected ? "true" : undefined}
                    style={{ minHeight: 44 }}
                    onClick={() =>
                      dispatch({
                        type: "select-direction",
                        directionId: direction.id,
                      })
                    }
                  >
                    {direction.cueLabel}
                  </button>
                );
              })}
            </div>

            <div className="hero-actions">
              <PreorderButton />
            </div>
            <ul className="hero-proof" aria-label="Air preview status">
              <li><LuCheck aria-hidden /> first visual · ready</li>
              <li><LuCheck aria-hidden /> storyboard · private beta preview</li>
              <li><LuCheck aria-hidden /> one private thread</li>
            </ul>
          </div>

          <div className="phone-stage" role="region" aria-label="Air in iMessage">
            <div className="app-orbit" aria-hidden="true">
              <svg
                className="orbit-map"
                viewBox="0 0 720 820"
                preserveAspectRatio="none"
                focusable="false"
              >
                <path d="M42 238C168 58 431 26 666 190" />
                <path d="M18 398C121 171 472 109 704 336" />
                <path d="M25 583C171 778 474 812 692 632" />
                <path d="M120 690C274 844 519 826 650 708" />
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
                    <Icon />
                  </span>
                ),
              )}
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
