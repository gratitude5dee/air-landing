import type { Metadata } from "next";

import { DetailArrowLink, DetailPageShell } from "@/components/DetailPageShell";
import styles from "@/components/DetailPageShell.module.css";

export const metadata: Metadata = {
  title: "How Air works — creative assistance in your iMessages | Air by WZRD",
  description:
    "A private-beta preview of the creative thread: text the outcome, coordinate approved tools, and review the next move in iMessage.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How Air works — creative assistance in your iMessages",
    description:
      "Text the outcome, coordinate approved tools, and review the next move in one private thread.",
    url: "/how-it-works",
  },
};

const steps: readonly { number: string; title: string; body: string; status?: string }[] = [
  {
    number: "01",
    title: "Text the outcome.",
    body: "Start the way you already brief a teammate: with a thought, reference, link, or the context that matters.",
  },
  {
    number: "02",
    title: "Air maps the next move.",
    body: "Air prepares work through the connections you approve and asks for missing context when it needs it.",
  },
  {
    number: "03",
    title: "Review what matters.",
    body: "The thread keeps the plan legible. Publishing, spending, and other consequential actions remain yours to approve.",
    status: "Approval required",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <DetailPageShell
      current="how-it-works"
      eyebrow="AIR BY WZRD.TECH · PRIVATE BETA"
      title="The creative thread is where the work starts."
      description="Text an outcome, a reference, or a rough brief. Air helps prepare the next creative move through the connections you approve—and returns the work to your iMessage thread."
    >
      <section
        className={styles.chapter}
        data-air-scene="ink"
        data-air-cloud-progress="0.74"
        data-air-cloud-rays="0.12"
        data-air-cloud-opacity="0.18"
        data-variant="night"
        aria-labelledby="thread-start-title"
      >
        <div className="shell">
          <div className={styles.rail}>
            <span>The creative thread</span>
            <span>Private-beta interface preview</span>
          </div>
          <div className={styles.chapterHeading}>
            <h2 id="thread-start-title">One thought, not six tabs.</h2>
            <p>
              Instead of switching between your analytics, ChatGPT, your creative suite, and Meta Ads,
              begin with the outcome in one private thread.
            </p>
          </div>

          <article className={styles.threadArtifact} aria-labelledby="thread-artifact-title">
            <header className={styles.artifactHeader}>
              <span>Air / private thread</span>
              <span>Interface preview · 01</span>
            </header>
            <div className={styles.threadArtifactGrid}>
              <div className={styles.threadConversation}>
                <p className={styles.threadTimestamp}>Today · 9:41</p>
                <div className={`${styles.threadBubble} ${styles.threadBubbleUser}`}>
                  <p>Turn the launch notes into a clear creative direction and bring back what needs my review.</p>
                </div>
                <div className={`${styles.threadBubble} ${styles.threadBubbleAir}`}>
                  <span>Air</span>
                  <p>I’ll map the next move across the connections you approve and keep the decision points here.</p>
                </div>
                <div className={styles.threadReaction} aria-label="Direction acknowledged">✦</div>
              </div>

              <aside className={styles.threadRun} aria-labelledby="thread-artifact-title">
                <div>
                  <p className={styles.artifactLabel}>What Air returns</p>
                  <h3 id="thread-artifact-title">A reviewable next move—not another dashboard.</h3>
                </div>
                <ol>
                  <li><span>01</span><p>Brief received <small>Context stays in the thread</small></p></li>
                  <li><span>02</span><p>Approved connections mapped <small>Only what you allow</small></p></li>
                  <li><span>03</span><p>Review ready <small>Action waits for your approval</small></p></li>
                </ol>
                <p className={styles.artifactNote}>Illustrative interface state · no connected action is shown as completed.</p>
              </aside>
            </div>
            <footer className={styles.artifactFooter}>
              <span>Conversation-first direction</span>
              <span>Visible action state</span>
              <span>Approval stays with you</span>
            </footer>
          </article>

          <ol className={styles.routeSteps} aria-label="How Air works">
            {steps.map((step) => (
              <li key={step.number}>
                <span>{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                  {step.status && <em>{step.status}</em>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        className={`${styles.editorialCallout} ${styles.editorialCalloutSky}`}
        data-air-scene="pearl"
        data-air-cloud-progress="0.86"
        data-air-cloud-rays="0.08"
        data-air-cloud-opacity="0.16"
        aria-labelledby="behind-thread-title"
      >
        <div className="shell">
          <div>
            <p className="eyebrow">Behind the thread</p>
            <h2 id="behind-thread-title">A private operating surface, not another dashboard.</h2>
          </div>
          <div className={styles.calloutAside}>
            <p>
              The workspace, phone line, inbox, scoped secrets, and connector catalog exist to support the
              conversation—not pull you away from it.
            </p>
            <DetailArrowLink href="/capabilities">See what sits behind the thread</DetailArrowLink>
          </div>
        </div>
      </section>
    </DetailPageShell>
  );
}
