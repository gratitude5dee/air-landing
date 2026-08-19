"use client";

import { createElement, type CSSProperties, useEffect, useRef } from "react";
import { LuCheck, LuPlay, LuSparkles } from "react-icons/lu";

const filmSteps = [
  {
    number: "01",
    label: "Text",
    detail: "“Quiet morning. Golden Gate. No rush.”",
  },
  {
    number: "02",
    label: "Shape",
    detail: "4-shot storyboard · tone locked",
  },
  {
    number: "03",
    label: "First cut",
    detail: "Ready for notes in the thread",
  },
] as const;

export function TextToFilm() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const clipStart = 5;
    const clipEnd = 18;
    let inView = false;

    const playFilm = () => {
      if (reduced.matches || !inView || video.readyState < HTMLMediaElement.HAVE_METADATA) return;
      if (video.currentTime < clipStart || video.currentTime >= clipEnd) video.currentTime = clipStart;
      void video.play().catch(() => undefined);
    };

    const onLoadedMetadata = () => {
      if (video.duration > clipStart) video.currentTime = clipStart;
      playFilm();
    };
    const onTimeUpdate = () => {
      if (video.currentTime >= clipEnd) video.currentTime = clipStart;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView) playFilm();
        else video.pause();
      },
      { threshold: 0.24 },
    );
    const onMotionPreferenceChange = () => {
      if (reduced.matches) video.pause();
      else playFilm();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);
    reduced.addEventListener("change", onMotionPreferenceChange);
    observer.observe(section);

    return () => {
      observer.disconnect();
      video.pause();
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
      reduced.removeEventListener("change", onMotionPreferenceChange);
    };
  }, []);

  return (
    <section ref={sectionRef} className="film-section section" aria-labelledby="film-title">
      {createElement("dk-gradient", {
        "aria-hidden": "true",
        className: "film-dither-field",
        from: "blue",
        direction: "radial",
        pixel: "4",
        bloom: "low",
        fade: "",
      })}
      <div className="shell">
        <div className="section-rail"><span>Text to film</span><span>one thread · one cut</span></div>
        <div className="film-grid">
          <div className="film-copy" data-reveal>
            <p className="eyebrow">A film can start as a text.</p>
            <h2 id="film-title">Text the feeling. Air builds the film.</h2>
            <p>
              Send a thought, reference, or voice note. Air turns the signal into a treatment,
              storyboard, shot plan, and first cut—then brings the choices back to iMessage.
            </p>
            <ol className="film-path" aria-label="Text-to-film process">
              {filmSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <div>
                    <small>{step.label}</small>
                    <p>{step.detail}</p>
                  </div>
                  {step.number === "03" ? <LuCheck aria-hidden /> : <LuSparkles aria-hidden />}
                </li>
              ))}
            </ol>
          </div>

          <figure className="film-figure" data-reveal style={{ "--delay": "110ms" } as CSSProperties}>
            <div className="film-preview">
              <video
                ref={videoRef}
                muted
                playsInline
                preload="metadata"
                poster="/media/intro-poster.jpg"
                aria-hidden="true"
                tabIndex={-1}
              >
                <source src="/media/air-intro-720.webm" type="video/webm" />
                <source src="/media/air-intro-1080.mp4" type="video/mp4" />
              </video>
              <div className="film-vignette" aria-hidden />
              <div className="film-hud film-hud-top" aria-hidden>
                <span><i /> AIR / FILM STUDY</span>
                <span>BLUE HOUR · 01</span>
              </div>
              <div className="film-hud film-hud-bottom" aria-hidden>
                <span><LuPlay /> FIRST CUT</span>
                <span>00:00:15 / 00:00:15</span>
              </div>
              <div className="film-timeline" aria-hidden>
                <span /><span /><span /><span />
                <i />
              </div>
            </div>
            <figcaption>
              Illustrative film sequence: Air helps turn an iMessage brief into a storyboard and
              short film.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
