export type HeroTimeline = Readonly<{
  progress: number;
  revealProgress: number;
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
 * The cinematic hero is deliberately split into three independent tracks:
 * cloud reveal, poster-to-product handoff, and the app-orbit arrival.
 */
export function resolveHeroTimeline(rawProgress: number): HeroTimeline {
  const progress = clamp(rawProgress);
  const revealProgress = segment(progress, 0.1, 0.52);
  const handoffProgress = segment(progress, 0.64, 0.94);
  const orbitProgress = segment(progress, 0.6, 0.94);

  return {
    progress,
    revealProgress,
    handoffProgress,
    orbitProgress,
    headerRevealed: handoffProgress >= 0.22,
  };
}
