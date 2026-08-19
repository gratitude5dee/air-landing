"use client";

import {
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

const PreorderContext = createContext<PreorderContextValue | null>(null);

const CAL_LINK =
  process.env.NEXT_PUBLIC_CAL_LINK || "https://cal.com/5deestudios/air-onboarding";

export function PreorderProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [stage, setStage] = useState<"form" | "calendar">("form");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const openPreorder = () => {
    setError("");
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => document.body.classList.remove("modal-open");
    const onOpen = () => document.body.classList.add("modal-open");
    const observer = new MutationObserver(() => {
      if (dialog.open) onOpen();
      else onClose();
    });
    observer.observe(dialog, { attributes: true, attributeFilter: ["open"] });
    return () => {
      observer.disconnect();
      onClose();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      imessage: String(form.get("imessage") || ""),
      consent: form.get("consent") === "on",
      company: String(form.get("company") || ""),
    };

    try {
      const response = await fetch("/api/preorder", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !result.ok) throw new Error(result.message || "Please try again.");
      setStage("calendar");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <PreorderContext.Provider value={{ openPreorder }}>
      {children}
      <dialog
        ref={dialogRef}
        className="preorder-dialog"
        aria-labelledby="preorder-title"
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="preorder-panel">
          <button className="dialog-close" type="button" onClick={close} aria-label="Close preorder">
            <LuX aria-hidden />
          </button>

          {stage === "form" ? (
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

              <form className="preorder-form" onSubmit={submit}>
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

                <button className="button button-primary form-submit" type="submit" disabled={pending}>
                  {pending ? "saving your place…" : "save my preorder"}
                  {!pending && <LuArrowUpRight aria-hidden />}
                </button>
                <p className="privacy-note">
                  We store these details only to manage your preorder and Air onboarding.
                </p>
              </form>
            </div>
          ) : (
            <div className="calendar-stage" role="status">
              <div className="calendar-heading">
                <span className="success-mark"><LuCheck aria-hidden /></span>
                <div>
                  <span className="eyebrow">You’re on the list</span>
                  <h2 id="preorder-title">Now, meet your Air.</h2>
                  <p>Choose a time below. Your preorder is already saved.</p>
                </div>
              </div>
              <iframe
                className="cal-frame"
                title="Book your Air onboarding call"
                src={`${CAL_LINK}?embed=true&layout=month_view`}
                allow="camera; microphone; fullscreen; payment"
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
