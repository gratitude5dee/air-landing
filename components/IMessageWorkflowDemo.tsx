"use client";

import {
  type CSSProperties,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  LuCalendarDays,
  LuCheck,
  LuChevronRight,
  LuClock3,
  LuLockKeyhole,
  LuMail,
  LuSparkles,
} from "react-icons/lu";

import styles from "./IMessageWorkflowDemo.module.css";

type WorkflowStage = "thread" | "email" | "calendar";
type Tapback = "❤️" | "👍" | "👎" | "HA HA" | "‼️" | "?";

const TAPBACKS: readonly Tapback[] = ["❤️", "👍", "👎", "HA HA", "‼️", "?"];
const stageOrder: readonly WorkflowStage[] = ["thread", "email", "calendar"];

const stageCopy: Record<WorkflowStage, string> = {
  thread: "Message ready. Tap thumbs up to let Air prepare the work.",
  email: "Inbox Mini App prepared a follow-up draft. Nothing has been sent.",
  calendar: "Calendar Mini App proposed a review hold. It still needs your approval.",
};

function stageIndex(stage: WorkflowStage) {
  return stageOrder.indexOf(stage);
}

/**
 * An intentionally fictional workflow. It demonstrates the product's shape
 * without connecting to a mailbox, calendar, or external account.
 */
export function IMessageWorkflowDemo() {
  const demoRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<WorkflowStage>("thread");
  const [reaction, setReaction] = useState<Tapback | null>(null);
  const [started, setStarted] = useState(false);
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const compact = window.matchMedia("(max-width: 720px)");
    const connection = (
      navigator as Navigator & { connection?: EventTarget & { saveData?: boolean } }
    ).connection;

    const update = () => {
      setMotionAllowed(
        !reducedMotion.matches &&
          !forcedColors.matches &&
          !compact.matches &&
          !connection?.saveData,
      );
    };

    update();
    [reducedMotion, forcedColors, compact].forEach((query) =>
      query.addEventListener("change", update),
    );
    connection?.addEventListener?.("change", update);

    return () => {
      [reducedMotion, forcedColors, compact].forEach((query) =>
        query.removeEventListener("change", update),
      );
      connection?.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    if (!motionAllowed || !started) return;

    let frame = 0;
    const updateFromScroll = () => {
      frame = 0;
      const demo = demoRef.current;
      if (!demo) return;
      const bounds = demo.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.8 - bounds.top) / Math.max(bounds.height, 1)),
      );

      if (progress >= 0.72) {
        setStage((current) => (stageIndex(current) < stageIndex("calendar") ? "calendar" : current));
      } else if (progress >= 0.38) {
        setStage((current) => (stageIndex(current) < stageIndex("email") ? "email" : current));
      }
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [motionAllowed, started]);

  const selectReaction = (nextReaction: Tapback) => {
    setReaction(nextReaction);
    if (nextReaction === "👍") {
      setStarted(true);
      setStage("email");
    }
  };

  const chooseStage = (nextStage: WorkflowStage) => {
    if (nextStage !== "thread") setStarted(true);
    setStage(nextStage);
  };

  const preventPointerFocus = (event: MouseEvent<HTMLButtonElement>) => {
    // Do not let a pointer choice unexpectedly move focus away from the
    // currently read message. Keyboard interactions retain normal focus.
    if (event.detail > 0) event.currentTarget.blur();
  };

  return (
    <div
      ref={demoRef}
      className="message-workflow-demo"
      data-workflow-stage={stage}
      data-workflow-started={started ? "true" : "false"}
    >
      <div className={styles.chrome} aria-hidden="true">
        <span><i /> iMessage / launch desk</span>
        <span>illustrative workflow</span>
      </div>

      <div className={styles.stage}>
        <div className={styles.threadPanel}>
          <div className={styles.threadHead} aria-hidden="true">
            <span className={styles.airAvatar}>A</span>
            <span>air by WZRD.tech</span>
            <small>Today · 9:41</small>
          </div>
          <div className={styles.threadBody}>
            <p className={`${styles.bubble} ${styles.incoming}`}>
              Reply to the launch email and hold a 30-minute calendar review.
            </p>
            <p className={`${styles.bubble} ${styles.outgoing}`}>
              I’ll prepare both and bring the final choices back for review.
            </p>
            <div className={styles.tapbackRow} role="toolbar" aria-label="Direct Air with a Tapback">
              {TAPBACKS.map((tapback) => (
                <button
                  key={tapback}
                  type="button"
                  aria-label={
                    tapback === "👍"
                      ? "Thumbs up — prepare the email and calendar Mini Apps"
                      : `Tapback ${tapback}`
                  }
                  aria-pressed={reaction === tapback}
                  className={tapback === "👍" ? styles.primaryTapback : undefined}
                  onMouseUp={preventPointerFocus}
                  onClick={() => selectReaction(tapback)}
                >
                  {tapback}
                </button>
              ))}
            </div>
            <p className={styles.threadHint}>
              {reaction === "👍"
                ? "Air is composing the first Mini App."
                : "Use a Tapback to direct the illustrative flow."}
            </p>
          </div>
        </div>

        <div className={styles.appDeck}>
          <article
            className={`${styles.miniApp} ${styles.emailApp}`}
            aria-labelledby="workflow-email-title"
            aria-current={stage === "email" ? "step" : undefined}
          >
            <header>
              <span className={styles.appIcon}><LuMail aria-hidden="true" /></span>
              <span><small>Inbox Mini App</small><strong id="workflow-email-title">Launch follow-up</strong></span>
              <span className={styles.readyChip}><LuCheck aria-hidden="true" /> Draft</span>
            </header>
            <div className={styles.emailBody}>
              <span>To: Partners</span>
              <strong>The creator brief is ready for review.</strong>
              <p>A concise follow-up is prepared with the deck, review notes, and a proposed approval window.</p>
            </div>
            <footer>
              <span>Nothing sent</span>
              <button type="button" onClick={() => chooseStage("calendar")}>Load calendar Mini App <LuChevronRight aria-hidden="true" /></button>
            </footer>
          </article>

          <article
            className={`${styles.miniApp} ${styles.calendarApp}`}
            aria-labelledby="workflow-calendar-title"
            aria-current={stage === "calendar" ? "step" : undefined}
          >
            <header>
              <span className={styles.appIcon}><LuCalendarDays aria-hidden="true" /></span>
              <span><small>Calendar Mini App</small><strong id="workflow-calendar-title">Review hold</strong></span>
              <span className={styles.readyChip}><LuClock3 aria-hidden="true" /> Proposed</span>
            </header>
            <div className={styles.calendarBody}>
              <span>Thu · 10:30 AM</span>
              <strong>30-minute launch review</strong>
              <p>Air found an open window and held the proposed meeting details for you to review.</p>
            </div>
            <footer>
              <span>Nothing scheduled</span>
              <button type="button" onClick={() => chooseStage("email")}>Back to email <LuChevronRight aria-hidden="true" /></button>
            </footer>
          </article>
        </div>

        <aside className={styles.approvalCard} aria-label="Approval required">
          <span className={styles.approvalIcon}><LuLockKeyhole aria-hidden="true" /></span>
          <div>
            <small>Needs you</small>
            <strong>Review email and calendar hold</strong>
            <p>Air prepares the work. You decide whether either action happens.</p>
          </div>
          <span className={styles.reviewState}>Review first</span>
        </aside>
      </div>

      <div className={styles.stepper} aria-label="Workflow steps">
        {stageOrder.map((item, index) => (
          <button
            key={item}
            type="button"
            aria-current={stage === item ? "step" : undefined}
            aria-disabled={item !== "thread" && !started}
            disabled={item !== "thread" && !started}
            onClick={() => chooseStage(item)}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {item === "thread" ? "Message" : item === "email" ? "Email Mini App" : "Calendar Mini App"}
          </button>
        ))}
      </div>
      <p className={styles.liveStatus} role="status" aria-live="polite">{stageCopy[stage]}</p>
    </div>
  );
}

