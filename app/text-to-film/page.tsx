import type { Metadata } from "next";
import Image from "next/image";

import { DetailArrowLink, DetailPageShell } from "@/components/DetailPageShell";
import styles from "@/components/DetailPageShell.module.css";
import { DIRECTIONS, FEATURED_FILM } from "@/content/directions";

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

export default function TextToFilmPage() {
  return (
    <DetailPageShell
      current="text-to-film"
      eyebrow="TEXT TO FILM · LATER PRIVATE-BETA PROOF"
      title="Turn one text into a storyboard and first cut."
      description="A later creative proof in Air. The examples below are curated interface previews—they show a possible direction, not live browser generation."
    >
      <section className={styles.chapter} data-air-scene="ink" data-variant="night" aria-labelledby="first-frame-title">
        <div className="shell">
          <div className={styles.rail}><span>A direction, made visible</span><span>Interface preview</span></div>
          <div className={styles.leadGrid}>
            <h2 id="first-frame-title">Give the thought a first frame.</h2>
            <p>
              Text a prompt, choose a direction, and inspect a three-frame storyboard before the idea moves further.
            </p>
          </div>

          <div className={styles.storyboardGrid}>
            {DIRECTIONS.map((direction) => (
              <article className={styles.storyboardCard} key={direction.id}>
                <header>
                  <span>Air / storyboard</span>
                  <span>{direction.firstCutMode === "matched" ? "First cut study" : "Storyboard only"}</span>
                </header>
                <div style={{ padding: "1rem 0.9rem 0" }}>
                  <h3>{direction.cueLabel}</h3>
                </div>
                <p>{direction.request}</p>
                <div className={styles.frameGrid}>
                  {direction.frames.map((frame, index) => (
                    <figure className={styles.frame} key={frame.src}>
                      <Image
                        src={frame.src}
                        alt={frame.alt}
                        width={frame.width}
                        height={frame.height}
                        sizes="(max-width: 900px) 92vw, 31vw"
                        style={{ objectPosition: direction.objectPosition }}
                      />
                      <span>{`${String(index + 1).padStart(2, "0")} · ${frame.note}`}</span>
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <article className={styles.featuredFilm} aria-labelledby="featured-film-title">
            <p className="eyebrow">Featured film study · Quiet morning</p>
            <h2 id="featured-film-title">A curated eight-second first cut.</h2>
            <p>
              This study belongs to the Golden Gate direction. Playback is always user initiated; it is product evidence,
              not live browser generation.
            </p>
            <figure>
              <video controls muted playsInline preload="metadata" poster={FEATURED_FILM.poster}>
                <source src={FEATURED_FILM.webm} type="video/webm" />
                <source src={FEATURED_FILM.mp4} type="video/mp4" />
              </video>
              <figcaption>{FEATURED_FILM.label} · 08 seconds · private-beta interface study</figcaption>
            </figure>
            <DetailArrowLink href="/how-it-works">See the thread behind the preview</DetailArrowLink>
          </article>
        </div>
      </section>
    </DetailPageShell>
  );
}
