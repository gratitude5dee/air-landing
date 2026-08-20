"use client";

import {
  createElement,
  createContext,
  type FormEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { LuArrowUpRight, LuCalendarDays, LuCheck, LuX } from "react-icons/lu";

type PreorderContextValue = { openPreorder: () => void };
type PreorderStage = "form" | "saving" | "saved";
type CalendarState = "loading" | "ready" | "blocked";
type PreorderResponse = {
  ok?: boolean;
  stored?: boolean;
  receipt?: string;
  message?: string;
};

const PreorderContext = createContext<PreorderContextValue | null>(null);

const CAL_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK || "https://cal.com/5deestudios/air-onboarding";
const CALENDAR_LOAD_TIMEOUT_MS = 10_000;

export function PreorderProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState<PreorderStage>("form");
  const [calendarState, setCalendarState] = useState<CalendarState>("loading");
  const [error, setError] = useState("");

  const openPreorder = () => {
    setError("");
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      document.body.classList.add("modal-open");
      dialog.showModal();
    }
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => () => document.body.classList.remove("modal-open"), []);

  useEffect(() => {
    if (stage !== "saved" || calendarState !== "loading") return;
    const timeout = window.setTimeout(() => setCalendarState("blocked"), CALENDAR_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [calendarState, stage]);

  useEffect(() => {
    if (stage !== "saved") return;
    const frame = requestAnimationFrame(() => successHeadingRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStage("saving");
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      imessage: String(form.get("imessage") || ""),
      consent: form.get("consent") === "on",
      company: String(form.get("company") || ""),
    };

    // The server also treats this as a honeypot. Refuse to unlock Cal on the
    // client even if an intermediary ever returns a generic 2xx response.
    if (payload.company) {
      setStage("form");
      setError("We could not verify this preorder. Please refresh and try again.");
      return;
    }

    try {
      const response = await fetch("/api/preorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json().catch(() => null)) as PreorderResponse | null;
      const durableSuccess =
        response.ok &&
        result?.ok === true &&
        result.stored === true &&
        typeof result.receipt === "string" &&
        result.receipt.length > 0;

      if (!durableSuccess) {
        throw new Error(result?.message || "Air could not save your preorder yet. Please try again.");
      }

      setCalendarState("loading");
      setStage("saved");
    } catch (submitError) {
      setStage("form");
      setError(submitError instanceof Error ? submitError.message : "Please try again.");
    }
  }

  const saving = stage === "saving";

  return (
    <PreorderContext.Provider value={{ openPreorder }}>
      {children}
      <dialog
        ref={dialogRef}
        className="preorder-dialog"
        aria-labelledby="preorder-title"
        data-preorder-stage={stage}
        data-calendar-state={stage === "saved" ? calendarState : undefined}
        onClose={() => document.body.classList.remove("modal-open")}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="preorder-panel">
          {createElement("dk-gradient", {
            "aria-hidden": "true",
            className: "preorder-dither-field",
            from: "blue",
            direction: "radial",
            variant: "dotted",
            pixel: "4",
            bloom: "low",
            fade: "",
          })}
          <div className="preorder-console-chrome" aria-hidden="true">
            <span>Air / preorder / 01</span>
            <span>WZRD.tech · private beta</span>
          </div>
          <button className="dialog-close" type="button" onClick={close} aria-label="Close preorder">
            <LuX aria-hidden />
          </button>

          {stage !== "saved" ? (
            <div className="preorder-grid">
              <div className="preorder-copy">
                <span className="eyebrow">Founding preorder</span>
                <h2 id="preorder-title">Put Air in your pocket.</h2>
                <p>
                  Reserve early access, then choose a short onboarding call so we can learn the
                  first workflow you want Air to run.
                </p>
                <ul className="dialog-proof" aria-label="Preorder benefits">
                  <li><LuCheck aria-hidden /> Priority onboarding</li>
                  <li><LuCheck aria-hidden /> Founding-member access</li>
                  <li><LuCheck aria-hidden /> No payment due today</li>
                </ul>
              </div>

              <form className="preorder-form" onSubmit={submit} aria-busy={saving}>
                <label htmlFor="preorder-name">Name</label>
                <input id="preorder-name" name="name" autoComplete="name" required placeholder="Your name" />

                <label htmlFor="preorder-email">Email</label>
                <input
                  id="preorder-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  placeholder="you@studio.com"
                />

                <label htmlFor="preorder-imessage">iMessage number</label>
                <input
                  id="preorder-imessage"
                  name="imessage"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="+1 415 555 0123"
                />

                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="preorder-company">Company website</label>
                  <input id="preorder-company" name="company" tabIndex={-1} autoComplete="off" />
                </div>

                <label className="consent-row">
                  <input type="checkbox" name="consent" required />
                  <span>WZRD may contact me about my Air preorder and onboarding.</span>
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button className="button button-primary form-submit" type="submit" disabled={saving}>
                  {saving ? "saving your place…" : "save my preorder"}
                  {!saving && <LuArrowUpRight aria-hidden />}
                </button>
                <p className="privacy-note">
                  We store these details only to manage your preorder and Air onboarding.
                </p>
              </form>
            </div>
          ) : (
            <div className="calendar-stage">
              <div className="calendar-heading">
                <span className="success-mark"><LuCheck aria-hidden /></span>
                <div>
                  <span className="eyebrow">You’re on the list</span>
                  <h2 ref={successHeadingRef} id="preorder-title" tabIndex={-1}>Now, meet your Air.</h2>
                  <p>
                    {calendarState === "blocked"
                      ? "Your preorder is saved. Booking did not load here, so use the link below."
                      : "Your preorder is saved. Choose a time below or open booking in a new tab."}
                  </p>
                </div>
              </div>
              <p className="privacy-note" role="status" aria-live="polite">
                {calendarState === "loading" && "Loading the booking calendar…"}
                {calendarState === "ready" && "Booking calendar ready."}
                {calendarState === "blocked" && "Booking embed unavailable. Your preorder remains saved."}
              </p>
              <iframe
                className="cal-frame"
                title="Book your Air onboarding call"
                src={`${CAL_LINK}?embed=true&layout=month_view`}
                allow="fullscreen"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                aria-busy={calendarState === "loading"}
                onLoad={() => setCalendarState("ready")}
                onError={() => setCalendarState("blocked")}
              />
              <a className="calendar-fallback" href={CAL_LINK} target="_blank" rel="noreferrer">
                <LuCalendarDays aria-hidden /> Open booking in a new tab
              </a>
            </div>
          )}
        </div>
      </dialog>
    </PreorderContext.Provider>
  );
}

export function PreorderButton({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const context = useContext(PreorderContext);
  if (!context) throw new Error("PreorderButton must be used inside PreorderProvider");

  return (
    <button
      type="button"
      className={`button button-primary ${compact ? "button-compact" : ""} ${className}`}
      onClick={context.openPreorder}
    >
      pre-order air today <LuArrowUpRight aria-hidden />
    </button>
  );
}
