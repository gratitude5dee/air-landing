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

type WorkflowStep = {
  number: string;
  title: string;
  body: string;
  status?: string;
};

const steps: readonly WorkflowStep[] = [
  {
    number: "01",
    title: "Text the outcome.",
    body: "Begin with the way you already brief a teammate. Add a thought, an image, a link, or the context that matters.",
  },
  {
    number: "02",
    title: "Air maps the next move.",
    body: "Air prepares the work across the connections you approve and asks for missing context when it needs it.",
  },
  {
    number: "03",
    title: "Review what matters.",
    body: "The thread keeps the plan and its decisions legible. Publishing, spending, and other consequential actions remain yours to approve.",
    status: "Approval required",
  },
];

export default function HowItWorksPage() {
  return (
    <DetailPageShell
      current="how-it-works"
      eyebrow="AIR BY WZRD.TECH · PRIVATE BETA"
      title="The creative thread is where the work starts."
      description="Text an outcome, a reference, or a rough brief. Air helps prepare the next creative move through the connections you approve—and returns the work to your iMessage thread."
    >
      <section className={styles.chapter} data-air-scene="ink" data-variant="night" aria-labelledby="thread-start-title">
        <div className="shell">
          <div className={styles.rail}><span>The thread</span><span>Private beta interface preview</span></div>
          <div className={styles.leadGrid}>
            <h2 id="thread-start-title">One thought, not six tabs.</h2>
            <p>
              Instead of switching between your analytics, ChatGPT, your creative suite, and Meta Ads,
              start with the outcome in one thread.
            </p>
          </div>
          <ol className={styles.stepGrid}>
            {steps.map((step) => (
              <li className={styles.step} key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                {step.status && <span className={styles.status}>{step.status}</span>}
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.callout} data-air-scene="pearl" aria-labelledby="behind-thread-title">
        <div className="shell">
          <div>
            <p className="eyebrow">Behind the thread</p>
            <h2 id="behind-thread-title">A private operating surface, not another dashboard.</h2>
          </div>
          <div>
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
