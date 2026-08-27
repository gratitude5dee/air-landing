"use client";

import {
  createElement,
  createContext,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LuArrowUpRight,
  LuCheck,
  LuCopy,
  LuShare2,
  LuSparkles,
  LuUsers,
  LuX,
} from "react-icons/lu";

import { PlasmaButton } from "@/components/PlasmaButton";
import { AIR_STRIPE_PAYMENT_LINK } from "@/lib/checkout";

export type PreorderInterest =
  | "General"
  | "Personal"
  | "Adaptive"
  | "Creator OS"
  | "Dedicated Mac"
  | "Enterprise";

type PreorderContextValue = { openPreorder: (interest?: PreorderInterest) => void };
type PreorderStage = "form" | "saving" | "joined" | "checking-out";
type WaitlistMember = {
  receipt: string;
  totalWaiting: number;
  position: number;
  referralCode: string;
  referralCount: number;
  referralCredited?: boolean;
};
type PreorderResponse = {
  ok?: boolean;
  stored?: boolean;
  receipt?: string;
  totalWaiting?: number;
  position?: number;
  referralCode?: string;
  referralCount?: number;
  referralCredited?: boolean;
  message?: string;
};
type StatusResponse = {
  ok?: boolean;
  totalWaiting?: number;
  status?: Pick<WaitlistMember, "totalWaiting" | "position" | "referralCount"> | null;
};

const PreorderContext = createContext<PreorderContextValue | null>(null);
const OWNER_CODE_KEY = "air-waitlist-referral-code";
const OWNER_RECEIPT_KEY = "air-waitlist-receipt";
const SEEN_REFERRAL_COUNT_KEY = "air-waitlist-seen-referrals";

function loadStoredOwner() {
  return {
    code: window.localStorage.getItem(OWNER_CODE_KEY),
    receipt: window.localStorage.getItem(OWNER_RECEIPT_KEY),
    seenReferrals: Number(window.localStorage.getItem(SEEN_REFERRAL_COUNT_KEY) || "0"),
  };
}

function Confetti({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="waitlist-confetti" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
    </span>
  );
}

export function PreorderProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);
  const [stage, setStage] = useState<PreorderStage>("form");
  const [error, setError] = useState("");
  const [interest, setInterest] = useState<PreorderInterest>("General");
  const [waitlist, setWaitlist] = useState<WaitlistMember | null>(null);
  const [totalWaiting, setTotalWaiting] = useState<number | null>(null);
  const [referrerCode, setReferrerCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const connection = (navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }).connection;
    const update = () => setMotionAllowed(!reducedMotion.matches && !forcedColors.matches && !connection?.saveData);
    update();
    reducedMotion.addEventListener("change", update);
    forcedColors.addEventListener("change", update);
    connection?.addEventListener?.("change", update);
    return () => {
      reducedMotion.removeEventListener("change", update);
      forcedColors.removeEventListener("change", update);
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => () => document.body.classList.remove("modal-open"), []);

  useEffect(() => {
    if (stage !== "joined") return;
    const frame = requestAnimationFrame(() => successHeadingRef.current?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(frame);
  }, [stage]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.scrollTop = 0;
    dialog.scrollLeft = 0;
  }, [stage]);

  useEffect(() => {
    if (!celebrate) return;
    const timeout = window.setTimeout(() => setCelebrate(false), 1_800);
    return () => window.clearTimeout(timeout);
  }, [celebrate]);

  async function loadSummary() {
    const response = await fetch("/api/preorder/status", { cache: "no-store" });
    const result = (await response.json().catch(() => null)) as StatusResponse | null;
    if (response.ok && result?.ok && typeof result.totalWaiting === "number") {
      setTotalWaiting(result.totalWaiting);
    }
  }

  async function restoreOwnerStatus(code: string, receipt: string | null, seenReferrals: number) {
    const response = await fetch(`/api/preorder/status?code=${encodeURIComponent(code)}`, { cache: "no-store" });
    const result = (await response.json().catch(() => null)) as StatusResponse | null;
    if (!response.ok || !result?.ok || !result.status || !receipt) return false;
    const status = result.status;
    setWaitlist({
      ...status,
      receipt,
      referralCode: code,
    });
    setTotalWaiting(status.totalWaiting);
    setStage("joined");
    if (status.referralCount > seenReferrals) {
      window.localStorage.setItem(SEEN_REFERRAL_COUNT_KEY, String(status.referralCount));
      setCelebrate(true);
    }
    return true;
  }

  const openPreorder = (nextInterest: PreorderInterest = "General") => {
    setError("");
    setCopied(false);
    setInterest(nextInterest);
    setCelebrate(false);
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      document.body.classList.add("modal-open");
      dialog.showModal();
    }

    const urlReferral = new URLSearchParams(window.location.search).get("ref");
    const stored = loadStoredOwner();
    const ownsReferral = Boolean(stored.code && (!urlReferral || urlReferral === stored.code));
    setReferrerCode(ownsReferral ? null : urlReferral);

    if (ownsReferral && stored.code) {
      void restoreOwnerStatus(stored.code, stored.receipt, stored.seenReferrals).then((restored) => {
        if (!restored) {
          setWaitlist(null);
          setStage("form");
          void loadSummary();
        }
      });
      return;
    }

    setWaitlist(null);
    setStage("form");
    void loadSummary();
  };

  const close = () => dialogRef.current?.close();

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
      interest,
      referralCode: referrerCode || undefined,
    };

    if (payload.company) {
      setStage("form");
      setError("We could not verify this waitlist entry. Please refresh and try again.");
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
        typeof result.totalWaiting === "number" &&
        typeof result.position === "number" &&
        typeof result.referralCode === "string" &&
        typeof result.referralCount === "number";

      if (!durableSuccess) {
        throw new Error(result?.message || "Air could not save your place yet. Please try again.");
      }

      const saved = result as Required<Pick<PreorderResponse,
        "receipt" | "totalWaiting" | "position" | "referralCode" | "referralCount"
      >> & PreorderResponse;

      const member: WaitlistMember = {
        receipt: saved.receipt,
        totalWaiting: saved.totalWaiting,
        position: saved.position,
        referralCode: saved.referralCode,
        referralCount: saved.referralCount,
        referralCredited: saved.referralCredited === true,
      };
      window.localStorage.setItem(OWNER_CODE_KEY, member.referralCode);
      window.localStorage.setItem(OWNER_RECEIPT_KEY, member.receipt);
      window.localStorage.setItem(SEEN_REFERRAL_COUNT_KEY, String(member.referralCount));
      setWaitlist(member);
      setTotalWaiting(member.totalWaiting);
      setStage("joined");
      setCelebrate(true);
    } catch (submitError) {
      setStage("form");
      setError(submitError instanceof Error ? submitError.message : "Please try again.");
    }
  }

  function referralUrl() {
    if (!waitlist) return "";
    const url = new URL(window.location.origin);
    url.searchParams.set("ref", waitlist.referralCode);
    return url.toString();
  }

  async function copyReferral() {
    const url = referralUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy your Air referral link", url);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_800);
  }

  async function shareReferral() {
    const url = referralUrl();
    if (!url) return;
    if (navigator.share) {
      await navigator.share({
        title: "Join me on the Air waitlist",
        text: "Join the Air waitlist. Your signup moves me one place closer to the front.",
        url,
      }).catch(() => undefined);
      return;
    }
    await copyReferral();
  }

  async function startCheckout() {
    if (!waitlist?.receipt) {
      setError("Your waitlist session has expired. Please join again.");
      setStage("form");
      return;
    }
    setStage("checking-out");
    setError("");
    try {
      const response = await fetch("/api/preorder/checkout-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ receipt: waitlist.receipt }),
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; checkoutUrl?: string; message?: string } | null;
      if (!response.ok || !result?.ok || !result.checkoutUrl) {
        throw new Error(result?.message || "Air could not open checkout right now. Please try again.");
      }
      window.location.assign(result.checkoutUrl);
    } catch (checkoutError) {
      setStage("joined");
      setError(checkoutError instanceof Error ? checkoutError.message : "Please try again.");
    }
  }

  const saving = stage === "saving";
  const checkingOut = stage === "checking-out";

  return (
    <PreorderContext.Provider value={{ openPreorder }}>
      {children}
      <dialog
        ref={dialogRef}
        className="preorder-dialog"
        aria-labelledby="preorder-title"
        data-preorder-stage={stage}
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
            <span>Air / waitlist / 01</span>
            <span>WZRD.tech · private beta</span>
          </div>
          <button className="dialog-close" type="button" onClick={close} aria-label="Close Air waitlist">
            <LuX aria-hidden />
          </button>

          {stage === "form" || stage === "saving" ? (
            <div className="preorder-grid">
              <div className="preorder-copy">
                <span className="eyebrow">Private beta access</span>
                <h2 id="preorder-title">Save your place in Air.</h2>
                <p>
                  Join the waitlist, invite collaborators, then continue to Stripe when you are ready to start.
                </p>
                <div className="waitlist-total" aria-live="polite">
                  <LuUsers aria-hidden />
                  <span><strong>{totalWaiting ?? "—"}</strong> people are waiting for Air</span>
                </div>
                <ul className="dialog-proof" aria-label="Waitlist benefits">
                  <li><LuCheck aria-hidden /> One referral moves you one place forward</li>
                  <li><LuCheck aria-hidden /> Stripe redirects to Cal.com onboarding</li>
                  <li><LuCheck aria-hidden /> Stripe handles all payment details</li>
                </ul>
              </div>

              <form className="preorder-form" onSubmit={submit} aria-busy={saving}>
                <p className="preorder-interest">
                  <span>Selected access</span>
                  <strong>{interest === "General" ? "Air private beta" : interest}</strong>
                </p>
                {referrerCode && <p className="referral-arrival"><LuSparkles aria-hidden /> You were invited to move someone one place forward.</p>}
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

                <label htmlFor="preorder-imessage">Phone / iMessage number</label>
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
                  <span>WZRD may contact me about Air access and onboarding.</span>
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}

                <button className="button button-primary form-submit" type="submit" disabled={saving}>
                  {saving ? "saving your place…" : "join the Air waitlist"}
                  {!saving && <LuArrowUpRight aria-hidden />}
                </button>
                <p className="privacy-note">
                  We use these details only to run the waitlist and Air onboarding. Payment stays with Stripe.
                </p>
              </form>
            </div>
          ) : (
            <div className="waitlist-stage">
              <Confetti active={celebrate && motionAllowed} />
              <div className="calendar-heading">
                <span className="success-mark"><LuCheck aria-hidden /></span>
                <div>
                  <span className="eyebrow">You’re on the Air waitlist</span>
                  <h2 ref={successHeadingRef} id="preorder-title" tabIndex={-1}>Your place is saved.</h2>
                  <p>
                    Invite people to move forward, or continue to Stripe to schedule Air onboarding after payment.
                  </p>
                </div>
              </div>

              {waitlist && (
                <div className="waitlist-status-grid" aria-label="Your Air waitlist status">
                  <p><span>Current position</span><strong>#{waitlist.position}</strong></p>
                  <p><span>People waiting</span><strong>{waitlist.totalWaiting}</strong></p>
                  <p><span>Successful referrals</span><strong>{waitlist.referralCount}</strong></p>
                </div>
              )}

              <div className="referral-card">
                <span className="eyebrow">Move up together</span>
                <h3>One new signup through your link moves you one place forward.</h3>
                <div className="referral-actions">
                  <button type="button" className="button button-secondary" onClick={() => void copyReferral()}>
                    <LuCopy aria-hidden /> {copied ? "link copied" : "copy referral link"}
                  </button>
                  <button type="button" className="button button-secondary" onClick={() => void shareReferral()}>
                    <LuShare2 aria-hidden /> share
                  </button>
                </div>
                {waitlist?.referralCredited && <p className="referral-credit" role="status">Your signup moved the inviter one place forward.</p>}
              </div>

              {error && <p className="form-error" role="alert">{error}</p>}
              <div className="checkout-row">
                <button className="button button-primary checkout-button" type="button" onClick={() => void startCheckout()} disabled={checkingOut}>
                  {checkingOut ? "opening Stripe…" : "buy now and start onboarding"}
                  {!checkingOut && <LuArrowUpRight aria-hidden />}
                </button>
                <p>Checkout opens in this tab. After payment, Stripe takes you to Air onboarding on Cal.com.</p>
              </div>
              <p className="privacy-note" role="status" aria-live="polite">
                {celebrate ? "Your waitlist update is saved." : "Your position and referral count update from durable waitlist data."}
              </p>
            </div>
          )}
        </div>
      </dialog>
    </PreorderContext.Provider>
  );
}

function usePreorderLink(interest: PreorderInterest, onBeforeOpen?: () => void) {
  const context = useContext(PreorderContext);
  if (!context) throw new Error("Preorder link must be used inside PreorderProvider");
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onBeforeOpen?.();
    context.openPreorder(interest);
  };
}

export function PreorderButton({
  className = "",
  compact = false,
  interest = "General",
  label = "Join the Air waitlist",
  onBeforeOpen,
  children,
}: {
  className?: string;
  compact?: boolean;
  interest?: PreorderInterest;
  label?: string;
  onBeforeOpen?: () => void;
  children?: ReactNode;
}) {
  const open = usePreorderLink(interest, onBeforeOpen);
  return (
    <a
      className={`button button-primary ${compact ? "button-compact" : ""} ${className}`}
      href={AIR_STRIPE_PAYMENT_LINK}
      onClick={open}
      aria-haspopup="dialog"
    >
      {children || <>{label} <LuArrowUpRight aria-hidden /></>}
    </a>
  );
}

export function PreorderPlasmaButton({
  className = "",
  interest = "General",
  label = "Try Air Today",
  onBeforeOpen,
}: {
  className?: string;
  interest?: PreorderInterest;
  label?: string;
  onBeforeOpen?: () => void;
}) {
  const open = usePreorderLink(interest, onBeforeOpen);
  return (
    <PlasmaButton
      className={className}
      href={AIR_STRIPE_PAYMENT_LINK}
      label={label}
      onClick={open}
      aria-haspopup="dialog"
    />
  );
}
