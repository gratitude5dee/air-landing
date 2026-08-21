"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { LuVolume2, LuVolumeX, LuX } from "react-icons/lu";

import { LiveAnnouncer } from "@/components/LiveAnnouncer";
import { ShinyText } from "@/components/ShinyText";

const SESSION_KEY = "air-intro-seen-v1";
const INTRO_HANDOFF_MS = 820;

type FinishOptions = {
  immediate?: boolean;
};

export function IntroFilm() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishingRef = useRef(false);
  const exitTimerRef = useRef<number | null>(null);
  const audioFadeFrameRef = useRef<number | null>(null);
  const [eligible, setEligible] = useState(false);
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mediaState, setMediaState] = useState<"idle" | "playing" | "error">("idle");
  const [announcement, setAnnouncement] = useState("");

  const startFilmWithSound = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Try the intended sound-on experience first. If autoplay policy rejects
    // it, retry muted so the intro still begins without a click.
    video.muted = false;
    video.volume = 1;
    setMuted(false);

    try {
      await video.play();
      setMediaState("playing");
      return;
    } catch {
      video.muted = true;
      setMuted(true);
    }

    try {
      await video.play();
      setMediaState("playing");
    } catch {
      setMediaState("error");
    }
  }, []);

  const stopFilm = useCallback((immediate = false) => {
    const video = videoRef.current;
    if (!video) return;

    if (audioFadeFrameRef.current) {
      window.cancelAnimationFrame(audioFadeFrameRef.current);
      audioFadeFrameRef.current = null;
    }

    if (immediate || video.ended || video.muted || video.volume <= 0) {
      video.pause();
      return;
    }

    // A short audio release prevents the skip action from feeling like an
    // abrupt browser-level mute. The poster handoff below runs a little longer
    // than this fade, so the visual and audio exits land together.
    const initialVolume = video.volume;
    const startedAt = window.performance.now();
    const fadeDuration = 220;
    const fade = (now: number) => {
      const elapsed = Math.min(1, (now - startedAt) / fadeDuration);
      video.volume = initialVolume * (1 - elapsed);
      if (elapsed < 1) {
        audioFadeFrameRef.current = window.requestAnimationFrame(fade);
        return;
      }
      audioFadeFrameRef.current = null;
      video.pause();
      video.volume = initialVolume;
    };

    audioFadeFrameRef.current = window.requestAnimationFrame(fade);
  }, []);

  const complete = useCallback(() => {
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }

    const dialog = dialogRef.current;
    if (dialog?.open) dialog.close();
    document.body.classList.remove("intro-open");
    document.documentElement.dataset.airIntro = "complete";
    document.documentElement.dataset.airHydrated = "ready";
    window.dispatchEvent(new CustomEvent("air:intro-statechange", { detail: { state: "complete" } }));
    window.dispatchEvent(new CustomEvent("air:intro-complete"));
    setEligible(false);

    // The focus receiver deliberately keeps the cinematic timeline at its
    // opening state. Tabbing to a real hero control still resolves the full,
    // readable composition immediately.
    requestAnimationFrame(() => {
      const opening = document.getElementById("air-opening");
      opening?.focus({ preventScroll: true });
      setAnnouncement("Intro complete. Air experience ready.");
    });

    queueMicrotask(() => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // The intro remains dismissed for this mounted page.
      }
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const bootState = root.dataset.airIntro;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forcedColors = window.matchMedia("(forced-colors: active)").matches;

    // The beforeInteractive prepaint bootstrap is the only authority for
    // fresh/seen/reduced/Save-Data eligibility. If it is missing or fails,
    // fail open to the complete page instead of flashing or trapping an intro.
    if (bootState !== "eligible" || reducedMotion || forcedColors) {
      root.dataset.airIntro = "skip";
      root.dataset.airHydrated = "ready";
      window.dispatchEvent(new CustomEvent("air:intro-statechange", { detail: { state: "bypassed" } }));
      return;
    }

    setEligible(true);
  }, []);

  useEffect(() => {
    if (!eligible) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!dialog.open) dialog.showModal();
    document.body.classList.add("intro-open");
    document.documentElement.dataset.airIntro = "active";
    document.documentElement.dataset.airHydrated = "ready";
    window.dispatchEvent(new CustomEvent("air:intro-statechange", { detail: { state: "active" } }));
    skipRef.current?.focus({ preventScroll: true });

    void startFilmWithSound();

    return () => {
      document.body.classList.remove("intro-open");
      if (dialog.open) dialog.close();
    };
  }, [eligible, startFilmWithSound]);

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) window.clearTimeout(exitTimerRef.current);
      if (audioFadeFrameRef.current) {
        window.cancelAnimationFrame(audioFadeFrameRef.current);
      }
    };
  }, []);

  const finish = useCallback((options: FinishOptions = {}) => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const forcedColors = window.matchMedia("(forced-colors: active)").matches;
    const immediate = Boolean(options.immediate || reducedMotion || forcedColors);

    stopFilm(immediate);
    if (immediate) {
      complete();
      return;
    }

    // Keep the dialog modal until its final frame has become the opening
    // poster. That guarantees the underlying hero has time to paint and makes
    // both completion and skip feel like a single continuous sequence.
    setIsHandingOff(true);
    document.documentElement.dataset.airIntro = "handoff";
    window.dispatchEvent(new CustomEvent("air:intro-statechange", { detail: { state: "handoff" } }));
    exitTimerRef.current = window.setTimeout(complete, INTRO_HANDOFF_MS);
  }, [complete, stopFilm]);

  useEffect(() => {
    if (!eligible) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const honorMotionPreference = () => {
      if (!reducedMotion.matches && !forcedColors.matches) return;
      if (finishingRef.current) {
        complete();
        return;
      }
      finish({ immediate: true });
    };

    honorMotionPreference();
    reducedMotion.addEventListener("change", honorMotionPreference);
    forcedColors.addEventListener("change", honorMotionPreference);
    return () => {
      reducedMotion.removeEventListener("change", honorMotionPreference);
      forcedColors.removeEventListener("change", honorMotionPreference);
    };
  }, [complete, eligible, finish]);

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    void video.play().then(
      () => setMediaState("playing"),
      () => {
        // Keep the control in sync with the media element if a platform
        // pauses playback after a volume change.
        setMuted(video.muted);
        setMediaState("error");
      },
    );
  }

  return (
    <>
      {eligible && (
        <dialog
          ref={dialogRef}
          className="intro-film"
          aria-labelledby="air-intro-title"
          aria-busy={isHandingOff || undefined}
          data-state={isHandingOff ? "handoff" : "playing"}
          data-air-intro-dialog
          onCancel={(event) => {
            event.preventDefault();
            if (!isHandingOff) finish();
          }}
          style={{ width: "100vw", maxWidth: "none", height: "100svh", maxHeight: "none", margin: 0, padding: 0, border: 0 }}
        >
          <video
            ref={videoRef}
            className="intro-video"
            autoPlay
            muted={muted}
            playsInline
            preload="auto"
            poster="/media/intro-poster.jpg"
            onEnded={() => finish()}
            onError={() => setMediaState("error")}
            onPlay={() => setMediaState("playing")}
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              setProgress(video.duration ? video.currentTime / video.duration : 0);
            }}
          >
            <source src="/media/air-intro-720.webm" type="video/webm" />
            <source src="/media/air-intro-1080.mp4" type="video/mp4" />
          </video>
          <img
            className="intro-handoff-poster"
            src="/images/opening/v2026-08-19-a/finframe.webp"
            alt=""
            aria-hidden="true"
            width={1920}
            height={1080}
          />
          <div className="intro-vignette" aria-hidden />
          <div className="intro-brand">
            <span id="air-intro-title" className="intro-brand-title">WZRD.tech introduction</span>
            <span className="intro-logo" aria-hidden="true">
              <Image src="/images/wzrd-wordmark.png" alt="" width={1600} height={396} priority />
            </span>
          </div>
          <div className="intro-controls">
            <button type="button" onClick={toggleSound} disabled={mediaState === "error" || isHandingOff} aria-label={muted ? "Turn intro sound on" : "Mute intro"}>
              {muted ? <LuVolumeX aria-hidden /> : <LuVolume2 aria-hidden />}
              <ShinyText disabled={isHandingOff} color="#e8f5ff" shineColor="#ffffff" speed={4.2} spread={112}>
                {muted ? "sound on" : "mute"}
              </ShinyText>
            </button>
            <button ref={skipRef} type="button" autoFocus disabled={isHandingOff} onClick={() => finish()}>
              <ShinyText disabled={isHandingOff} color="#e8f5ff" shineColor="#ffffff" speed={4.2} delay={0.3} spread={112}>
                skip intro
              </ShinyText>
              <LuX aria-hidden />
            </button>
          </div>
          <span className="intro-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
        </dialog>
      )}
      <LiveAnnouncer message={announcement} />
    </>
  );
}
