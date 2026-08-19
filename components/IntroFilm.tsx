"use client";

import { useEffect, useRef, useState } from "react";
import { LuVolume2, LuVolumeX, LuX } from "react-icons/lu";

const SESSION_KEY = "air-intro-seen-v1";

export function IntroFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(true);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || window.sessionStorage.getItem(SESSION_KEY)) setVisible(false);
  }, []);

  useEffect(() => {
    if (!visible) return;
    document.body.classList.add("intro-open");
    videoRef.current?.play().catch(() => undefined);
    return () => document.body.classList.remove("intro-open");
  }, [visible]);

  function finish() {
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setVisible(false);
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    video.play().catch(() => undefined);
  }

  if (!visible) return null;

  return (
    <div className="intro-film" role="dialog" aria-modal="true" aria-label="Air by WZRD intro film">
      <video
        ref={videoRef}
        className="intro-video"
        autoPlay
        muted={muted}
        playsInline
        preload="metadata"
        poster="/media/intro-poster.jpg"
        onEnded={finish}
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
        <span>air by WZRD.tech</span>
        <small>your creative assistant is arriving</small>
      </div>
      <div className="intro-controls">
        <button type="button" onClick={toggleSound} aria-label={muted ? "Turn intro sound on" : "Mute intro"}>
          {muted ? <LuVolumeX aria-hidden /> : <LuVolume2 aria-hidden />}
          {muted ? "sound on" : "mute"}
        </button>
        <button type="button" onClick={finish}>
          skip intro <LuX aria-hidden />
        </button>
      </div>
      <span className="intro-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden />
    </div>
  );
}
