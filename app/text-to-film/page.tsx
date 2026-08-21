import type { Metadata } from "next";
import Image from "next/image";

import { DetailArrowLink, DetailPageShell } from "@/components/DetailPageShell";
import styles from "@/components/DetailPageShell.module.css";
import { FEATURED_FILM, getDirection } from "@/content/directions";

export const metadata: Metadata = {
  title: "Text to film — storyboard and first-cut preview | Air by WZRD",
  description:
    "A later private-beta proof: turn one text into a storyboard and first cut. Curated previews, not live browser generation.",
  alternates: { canonical: "/text-to-film" },
  openGraph: {
    title: "Text to film — storyboard and first-cut preview",
    description:
      "A later private-beta creative proof in Air: one text, a storyboard, and a curated first-cut study.",
    url: "/text-to-film",
  },
};

const study = getDirection("golden-gate");

export default function TextToFilmPage() {
  return (
    <DetailPageShell
      current="text-to-film"
      eyebrow="TEXT TO FILM · LATER PRIVATE-BETA PROOF"
      title="Turn one text into a storyboard and first cut."
      description="A later creative proof in Air. The study below is a curated interface preview—it shows a possible direction, not live browser generation."
    >
      <section
        className={`${styles.chapter} ${styles.filmChapter}`}
        data-air-scene="ink"
        data-air-cloud-progress="0.76"
        data-air-cloud-rays="0.16"
        data-air-cloud-opacity="0.2"
        data-variant="night"
        aria-labelledby="first-frame-title"
      >
        <div className="shell">
          <div className={styles.rail}>
            <span>A direction, made visible</span>
            <span>Curated interface study</span>
          </div>
          <div className={styles.chapterHeading}>
            <h2 id="first-frame-title">Give the thought a first frame.</h2>
            <p>
              Text a prompt, inspect a three-frame storyboard, and review a first-cut study before an idea moves further.
            </p>
          </div>

          <article className={styles.filmArtifact} aria-labelledby="film-artifact-title">
            <header className={styles.artifactHeader}>
              <span>Air / text-to-film</span>
              <span>Storyboard + first-cut study</span>
            </header>
            <div className={styles.filmBrief}>
              <span>Texted direction</span>
              <p>{study.request}</p>
              <small>Curated preview · {study.cueLabel}</small>
            </div>

            <div className={styles.filmStoryboard}>
              <figure className={styles.filmFirstFrame}>
                <Image
                  src={study.frames[0].src}
                  alt={study.frames[0].alt}
                  width={study.frames[0].width}
                  height={study.frames[0].height}
                  sizes="(max-width: 900px) 92vw, 62vw"
                  priority
                  style={{ objectPosition: study.objectPosition }}
                />
                <figcaption><span>01 / first frame</span>{study.frames[0].note}</figcaption>
              </figure>
              <div className={styles.filmFrameRail}>
                {study.frames.slice(1).map((frame) => (
                  <figure className={styles.filmFrame} key={frame.src}>
                    <Image
                      src={frame.src}
                      alt={frame.alt}
                      width={frame.width}
                      height={frame.height}
                      sizes="(max-width: 900px) 45vw, 25vw"
                      style={{ objectPosition: study.objectPosition }}
                    />
                    <figcaption>{frame.note}</figcaption>
                  </figure>
                ))}
                <aside className={styles.filmQuestion}>
                  <span>Air asks</span>
                  <p>{study.clarifyingQuestion}</p>
                  <div>
                    {study.clarifyingAnswers.map((answer) => <span key={answer}>{answer}</span>)}
                  </div>
                </aside>
              </div>
            </div>

            <div className={styles.filmReview}>
              <div>
                <span>Storyboard ready</span>
                <h3 id="film-artifact-title">First visual reviewed before the next cut.</h3>
              </div>
              <p>Selected direction: {study.cueLabel} · {study.memory.mood} · {study.memory.pace}</p>
            </div>

            <figure className={styles.filmPlayback}>
              <video controls muted playsInline preload="metadata" poster={FEATURED_FILM.poster}>
                <source src={FEATURED_FILM.webm} type="video/webm" />
                <source src={FEATURED_FILM.mp4} type="video/mp4" />
              </video>
              <figcaption>
                {FEATURED_FILM.label} · 08 seconds · playback is user initiated · private-beta interface study
              </figcaption>
            </figure>
          </article>

          <div className={styles.filmNotes}>
            <p><span>01</span> Storyboard is the first deliverable.</p>
            <p><span>02</span> The featured cut is a curated product study.</p>
            <p><span>03</span> No live browser generation is represented here.</p>
          </div>
        </div>
      </section>

      <section
        className={`${styles.editorialCallout} ${styles.editorialCalloutCloud}`}
        data-air-scene="cloud"
        data-air-cloud-progress="0.68"
        data-air-cloud-rays="0.26"
        data-air-cloud-opacity="0.26"
        aria-labelledby="film-thread-title"
      >
        <div className="shell">
          <div>
            <p className="eyebrow">The next creative move</p>
            <h2 id="film-thread-title">The first cut comes back to the same thread.</h2>
          </div>
          <div className={styles.calloutAside}>
            <p>
              Text-to-film is a later proof point. The primary experience stays simple: direct the work in the
              conversation, then review the moments that matter.
            </p>
            <DetailArrowLink href="/how-it-works">See the review loop</DetailArrowLink>
          </div>
        </div>
      </section>
    </DetailPageShell>
  );
}
