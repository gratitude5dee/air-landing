import styles from "./LaunchFilm.module.css";

export function LaunchFilm() {
  return (
    <section className={styles.section} aria-labelledby="launch-film-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>AIR / LAUNCH FILM</p>
            <h2 id="launch-film-title">Meet Air in motion.</h2>
          </div>
          <p>A closer look at your personal creative assistant.</p>
        </div>
        <figure className={styles.frame}>
          <video
            className={styles.video}
            controls
            playsInline
            preload="none"
            poster="/media/air/v2026-09-25-launch/air-launch-v3-poster.jpg"
            aria-label="Air by WZRD launch film"
          >
            <source src="/media/air/v2026-09-25-launch/air-launch-v3.mp4" type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        </figure>
      </div>
    </section>
  );
}
