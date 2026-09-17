"use client";

import { useEffect, useRef, useState } from "react";
import { LuPause, LuPlay } from "react-icons/lu";

import styles from "./SectionAutoplayVideo.module.css";

type SectionAutoplayVideoProps = {
  desktopSrc: string;
  mobileSrc: string;
  poster: string;
  kicker: string;
  title: string;
  description: string;
  className?: string;
};

export function SectionAutoplayVideo({
  desktopSrc,
  mobileSrc,
  poster,
  kicker,
  title,
  description,
  className,
}: SectionAutoplayVideoProps) {
  const frameRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const manuallyPausedRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const play = () => {
      if (reducedMotion || manuallyPausedRef.current) return;
      video.preload = "auto";
      if (video.readyState === 0) video.load();
      void video.play().catch(() => setIsPlaying(false));
    };

    if (!("IntersectionObserver" in window)) {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) play();
        else video.pause();
      },
      { rootMargin: "120px 0px", threshold: 0.32 },
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      manuallyPausedRef.current = false;
      video.preload = "auto";
      if (video.readyState === 0) video.load();
      void video.play().catch(() => setIsPlaying(false));
    } else {
      manuallyPausedRef.current = true;
      video.pause();
    }
  };

  return (
    <figure ref={frameRef} className={`${styles.frame}${className ? ` ${className}` : ""}`}>
      <video
        ref={videoRef}
        className={styles.video}
        poster={poster}
        preload="none"
        muted
        playsInline
        loop
        aria-label={`${title}. ${description}`}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source media="(max-width: 640px)" src={mobileSrc} type="video/mp4" />
        <source src={desktopSrc} type="video/mp4" />
      </video>

      <div className={styles.veil} aria-hidden="true" />
      <figcaption className={styles.caption}>
        <span>{kicker}</span>
        <strong>{title}</strong>
        <p>{description}</p>
      </figcaption>
      <button
        className={styles.control}
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
      >
        {isPlaying ? <LuPause aria-hidden /> : <LuPlay aria-hidden />}
        <span>{isPlaying ? "Pause" : "Play film"}</span>
      </button>
    </figure>
  );
}
