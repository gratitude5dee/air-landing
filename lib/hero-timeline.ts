export type HeroTimeline = Readonly<{
  progress: number;
  posterExitProgress: number;
  revealProgress: number;
  titleRevealProgress: number;
  titleExitProgress: number;
  titleProgress: number;
  handoffProgress: number;
  orbitProgress: number;
  headerRevealed: boolean;
}>;

function clamp(value: number) {
  return Math.min(1, Math.max(0, value));
}

function easeInOut(value: number) {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
}

function segment(progress: number, start: number, end: number) {
  return easeInOut((progress - start) / (end - start));
}

/**
 * The cinematic hero follows the opening's visual contract: the baked logo
 * leaves first, the promise surfaces through clouds, then the product UI lands.
 */
export function resolveHeroTimeline(rawProgress: number): HeroTimeline {
  const progress = clamp(rawProgress);
  const posterExitProgress = segment(progress, 0.12, 0.3);
  const revealProgress = segment(progress, 0.28, 0.74);
  const titleRevealProgress = segment(progress, 0.34, 0.56);
  const titleExitProgress = segment(progress, 0.68, 0.78);
  const handoffProgress = segment(progress, 0.8, 0.98);
  const orbitProgress = segment(progress, 0.82, 0.98);

  return {
    progress,
    posterExitProgress,
    revealProgress,
    titleRevealProgress,
    titleExitProgress,
    titleProgress: Math.min(titleRevealProgress, 1 - titleExitProgress),
    handoffProgress,
    orbitProgress,
    headerRevealed: handoffProgress >= 0.22,
  };
}
