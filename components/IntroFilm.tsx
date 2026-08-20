"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LuPlay, LuVolume2, LuVolumeX, LuX } from "react-icons/lu";

import { LiveAnnouncer } from "@/components/LiveAnnouncer";

const SESSION_KEY = "air-intro-seen-v1";

export function IntroFilm() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishingRef = useRef(false);
  const [eligible, setEligible] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [mediaState, setMediaState] = useState<"idle" | "playing" | "blocked" | "error">("idle");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const root = document.documentElement;
    const bootState = root.dataset.airIntro;

    // The beforeInteractive prepaint bootstrap is the only authority for
    // fresh/seen/reduced/Save-Data eligibility. If it is missing or fails,
    // fail open to the complete page instead of flashing or trapping an intro.
    if (bootState !== "eligible") {
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

    const video = videoRef.current;
    if (video) {
      void video.play().then(
        () => setMediaState("playing"),
        () => setMediaState("blocked"),
      );
    }

    return () => {
      document.body.classList.remove("intro-open");
      if (dialog.open) dialog.close();
    };
  }, [eligible]);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;

    const dialog = dialogRef.current;
    videoRef.current?.pause();
    if (dialog?.open) dialog.close();
    document.body.classList.remove("intro-open");
    document.documentElement.dataset.airIntro = "complete";
    window.dispatchEvent(new CustomEvent("air:intro-statechange", { detail: { state: "complete" } }));
    window.dispatchEvent(new CustomEvent("air:intro-complete"));
    setEligible(false);

    // Dismissal is complete before either focus movement or the best-effort
    // storage write. A storage exception can never keep the modal onscreen.
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

  function playFilm() {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(
      () => setMediaState("playing"),
      () => setMediaState("blocked"),
    );
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    playFilm();
  }

  return (
    <>
      {eligible && (
        <dialog
          ref={dialogRef}
          className="intro-film"
          aria-labelledby="air-intro-title"
          aria-describedby="air-intro-description"
          data-air-intro-dialog
          onCancel={(event) => {
            event.preventDefault();
            finish();
          }}
          style={{ width: "100vw", maxWidth: "none", height: "100svh", maxHeight: "none", margin: 0, padding: 0, border: 0 }}
        >
          <video
            ref={videoRef}
            className="intro-video"
            autoPlay
            muted={muted}
            playsInline
            preload="metadata"
            poster="/media/intro-poster.jpg"
            onEnded={finish}
            onError={() => setMediaState("error")}
            onPlay={() => setMediaState("playing")}
            onTimeUpdate={(event) => {
              const video = event.currentTarget;
              setProgress(video.duration ? video.currentTime / video.duration : 0);
            }}
          >
            <source src="/media/air-intro-720.webm" type="video/webm" />
            <source src="/media/air-intro-1080.mp4" type="video/mp4" />
          </video>
          <div className="intro-vignette" aria-hidden />
          <div className="intro-brand">
            <span id="air-intro-title">air by WZRD.tech</span>
            <small id="air-intro-description">
              {mediaState === "error"
                ? "intro unavailable — continue to Air"
                : "your personal creative assistant is arriving"}
            </small>
          </div>
          <div className="intro-controls">
            {mediaState === "blocked" || mediaState === "error" ? (
              <button type="button" onClick={playFilm} disabled={mediaState === "error"}>
                <LuPlay aria-hidden /> {mediaState === "error" ? "film unavailable" : "play film"}
              </button>
            ) : (
              <button type="button" onClick={toggleSound} aria-label={muted ? "Turn intro sound on" : "Mute intro"}>
                {muted ? <LuVolumeX aria-hidden /> : <LuVolume2 aria-hidden />}
                {muted ? "sound on" : "mute"}
              </button>
            )}
            <button ref={skipRef} type="button" autoFocus onClick={finish}>
              skip intro <LuX aria-hidden />
            </button>
          </div>
          <span className="intro-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
        </dialog>
      )}
      <LiveAnnouncer message={announcement} />
    </>
  );
}
