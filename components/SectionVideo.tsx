"use client";

import { useRef, useState } from "react";
import { LuPlay } from "react-icons/lu";

import styles from "./SectionVideo.module.css";

type SectionVideoProps = {
  desktopSrc: string;
  mobileSrc: string;
  poster: string;
  kicker: string;
  title: string;
  description: string;
  className?: string;
};

export function SectionVideo({
  desktopSrc,
  mobileSrc,
  poster,
  kicker,
  title,
  description,
  className,
}: SectionVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const startPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    video.preload = "auto";
    void video.play().then(() => setHasStarted(true)).catch(() => setHasStarted(false));
  };

  return (
    <figure
      className={`${styles.frame}${className ? ` ${className}` : ""}`}
      data-playing={hasStarted}
    >
      <div className={styles.stage}>
        <video
          ref={videoRef}
          className={styles.video}
          poster={poster}
          preload="none"
          playsInline
          controls={hasStarted}
          aria-label={`${title}. ${description}`}
          onPlay={() => setHasStarted(true)}
        >
          <source media="(max-width: 640px)" src={mobileSrc} type="video/mp4" />
          <source src={desktopSrc} type="video/mp4" />
        </video>

        {!hasStarted && (
          <>
            <div className={styles.veil} aria-hidden="true" />
            <button
              className={styles.control}
              type="button"
              onClick={startPlayback}
              aria-label={`Play ${title}`}
            >
              <LuPlay aria-hidden />
              <span>Play film</span>
            </button>
          </>
        )}
      </div>

      {!hasStarted && (
        <figcaption className={styles.caption}>
          <span>{kicker}</span>
          <strong>{title}</strong>
          <p>{description}</p>
        </figcaption>
      )}
    </figure>
  );
}
