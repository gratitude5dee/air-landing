"use client";

import Image from "next/image";
import {
  createElement,
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from "react";
import { LuCheck, LuExternalLink, LuSparkles } from "react-icons/lu";

import { useAirExperience } from "@/components/AirExperience";
import {
  FEATURED_FILM,
  type DirectionSpec,
} from "@/content/directions";

type StoryboardFrame = DirectionSpec["frames"][number];
type MediaState = "idle" | "loading" | "ready" | "error";

const storyboardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 13rem), 1fr))",
  gap: "1rem",
  marginTop: "1.5rem",
};

function StoryboardCard({
  frame,
  frameIndex,
  objectPosition,
}: {
  frame: StoryboardFrame;
  frameIndex: number;
  objectPosition: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <figure className="film-storyboard-frame" style={{ margin: 0 }}>
      <div className="film-preview" style={{ boxShadow: "none" }}>
        {failed ? (
          <div
            role="img"
            aria-label={`Frame ${frameIndex + 1} unavailable. ${frame.note}`}
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              padding: "1rem",
              color: "rgba(237, 248, 255, 0.78)",
              textAlign: "center",
            }}
          >
            Frame unavailable · {frame.shot}
          </div>
        ) : (
          <Image
            src={frame.src}
            alt={frame.alt}
            width={frame.width}
            height={frame.height}
            loading="eager"
            sizes="(max-width: 720px) 92vw, 28vw"
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              objectPosition,
            }}
            onError={() => setFailed(true)}
          />
        )}
      </div>
      <figcaption>
        Frame {frameIndex + 1} of 3<br />{frame.note}
      </figcaption>
    </figure>
  );
}

export function TextToFilm() {
  const { state, selectedDirection } = useAirExperience();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaAttached, setMediaAttached] = useState(false);
  const [mediaState, setMediaState] = useState<MediaState>("idle");
  const [playbackMode, setPlaybackMode] = useState<"static" | "native">("static");

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    const update = () => setPlaybackMode(reduced.matches || coarse.matches ? "static" : "native");
    update();
    reduced.addEventListener("change", update);
    coarse.addEventListener("change", update);
    return () => {
      reduced.removeEventListener("change", update);
      coarse.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || mediaAttached) return;
    if (!("IntersectionObserver" in window)) {
      setMediaAttached(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setMediaAttached(true);
        observer.disconnect();
      },
      { rootMargin: "500px 0px", threshold: 0.01 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [mediaAttached]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    if (video.currentTime) video.currentTime = 0;
    setMediaState(mediaAttached ? "loading" : "idle");
    if (mediaAttached) video.load();
  }, [mediaAttached, selectedDirection.id]);

  const storyboardOnly = selectedDirection.firstCutMode === "storyboard-only";
  const filmSteps = [
    {
      number: "01",
      label: "Text",
      detail: `“${selectedDirection.request}”`,
    },
    {
      number: "02",
      label: "Storyboard",
      detail: `${selectedDirection.cueLabel} · three directed frames`,
    },
    {
      number: "03",
      label: storyboardOnly ? "Featured study" : "First cut",
      detail: storyboardOnly
        ? "Selected board complete · separate Golden Gate study follows"
        : "Matching eight-second first cut · ready for notes",
    },
  ] as const;

  return (
    <section
      ref={sectionRef}
      className="film-section section"
      data-air-scene="ink"
      data-air-cloud-progress="0.8"
      data-air-cloud-rays="0.1"
      data-air-cloud-opacity="0.15"
      aria-labelledby="film-title"
      data-film-direction={selectedDirection.id}
      data-film-mode={playbackMode}
      data-media-state={mediaState}
    >
      {createElement("dk-gradient", {
        "aria-hidden": "true",
        className: "film-dither-field",
        from: "blue",
        direction: "radial",
        variant: "dotted",
        pixel: "4",
        bloom: "low",
        fade: "",
      })}
      <div className="shell">
        <div className="section-rail">
          <span>Text to film</span>
          <span>Private beta preview</span>
        </div>

        <div className="film-grid">
          <div className="film-copy" data-reveal>
            <p className="eyebrow">Text to film · later private-beta proof</p>
            <h2 id="film-title">Turn one text into a storyboard and first cut.</h2>
            <p>
              Start with the feeling, the reference, or the rough brief. Air turns it into a first
              frame and a board you can direct. This is a curated interface preview, not live
              browser generation.
            </p>
            <ol className="film-path" aria-label="Text-to-film preview path">
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

          <div className="film-storyboard" data-reveal style={{ "--delay": "110ms" } as CSSProperties}>
            <p className="eyebrow">Storyboard · Private beta preview</p>
            <h3>{selectedDirection.cueLabel}</h3>
            <p>Selected direction · {selectedDirection.request}</p>
            {state.clarifierAnswer && (
              <p className="soon-badge">Direction note applied · {state.clarifierAnswer}</p>
            )}
            <div style={storyboardGridStyle} aria-label={`${selectedDirection.cueLabel} storyboard, three frames`}>
              {selectedDirection.frames.map((frame, index) => (
                <StoryboardCard
                  key={frame.src}
                  frame={frame}
                  frameIndex={index}
                  objectPosition={selectedDirection.objectPosition}
                />
              ))}
            </div>
          </div>
        </div>

        <figure
          className="film-figure film-featured-study"
          data-reveal
          style={{ marginTop: "clamp(3rem, 8vw, 7rem)" }}
          aria-labelledby="featured-film-title"
        >
          <div className="section-rail">
            <span id="featured-film-title">{FEATURED_FILM.label}</span>
            <span>First cut · Private beta preview</span>
          </div>
          <p>
            {storyboardOnly
              ? `${selectedDirection.cueLabel} stops truthfully at storyboard. The film below is a separate Golden Gate case study.`
              : "The selected Golden Gate storyboard continues into its matching first cut below."}
          </p>
          <div className="film-preview" aria-busy={mediaState === "loading"}>
            {mediaState === "error" ? (
              <div
                role="status"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  placeItems: "center",
                  padding: "2rem",
                  color: "rgba(237, 248, 255, 0.78)",
                  textAlign: "center",
                }}
              >
                First cut unavailable here. The storyboard and open-film link remain ready.
              </div>
            ) : (
              <video
                ref={videoRef}
                controls
                muted
                playsInline
                preload={mediaAttached ? "metadata" : "none"}
                poster={FEATURED_FILM.poster}
                aria-label="Play the eight-second Golden Gate featured film study"
                style={{ transform: "none", filter: "none" }}
                onLoadStart={() => setMediaState("loading")}
                onLoadedMetadata={() => setMediaState("ready")}
                onCanPlay={() => setMediaState("ready")}
                onError={() => setMediaState("error")}
              >
                {mediaAttached && (
                  <>
                    <source src={FEATURED_FILM.webm} type="video/webm" />
                    <source src={FEATURED_FILM.mp4} type="video/mp4" />
                  </>
                )}
              </video>
            )}
            <div className="film-vignette" aria-hidden />
            <div className="film-hud film-hud-top" aria-hidden style={{ pointerEvents: "none" }}>
              <span><i /> AIR / FEATURED FILM STUDY</span>
              <span>QUIET MORNING · 08 SEC</span>
            </div>
          </div>
          <figcaption>
            {FEATURED_FILM.label}. Curated product evidence; playback is always user initiated.
          </figcaption>
          <a
            className="calendar-fallback film-open-link"
            href={FEATURED_FILM.mp4}
            target="_blank"
            rel="noreferrer"
          >
            <LuExternalLink aria-hidden /> Open film in a new tab
          </a>
          {mediaState === "loading" && <p role="status">Loading first-cut media…</p>}
        </figure>
      </div>
    </section>
  );
}
