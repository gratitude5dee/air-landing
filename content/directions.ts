import { z } from "zod";

import manifestJson from "./directions.json";

export type DirectionId = "golden-gate" | "chrome-launch" | "blue-hour";

export type FrameBase = {
  src: string;
  alt: string;
  shot: `0${1 | 2 | 3}`;
  note: string;
};

export type FirstFrame = FrameBase & { width: 960; height: 540 };
export type ContinuationFrame = FrameBase & { width: 720; height: 405 };

export type DirectionSpec = {
  id: DirectionId;
  cueLabel: string;
  request: string;
  frames: readonly [FirstFrame, ContinuationFrame, ContinuationFrame];
  clarifyingQuestion: string;
  clarifyingAnswers: readonly [string, string];
  memory: {
    mood: string;
    palette: string;
    pace: string;
    reference: string;
  };
  firstCutMode: "matched" | "storyboard-only";
  objectPosition: string;
};

export type FeaturedFilm = {
  label: string;
  poster: string;
  webm: string;
  mp4: string;
  duration: 8;
};

const copy = (max: number) => z.string().trim().min(1).max(max);
const versionedAssetPath = z
  .string()
  .min(1)
  .max(240)
  .regex(/^\/media\/air\/v2026-08-19-a\/[a-z0-9/_-]+\.(?:webp|webm|mp4)$/);

const frameBaseSchema = z
  .object({
    src: versionedAssetPath,
    alt: copy(180),
    shot: z.enum(["01", "02", "03"]),
    note: copy(140),
  })
  .strict();

const firstFrameSchema = frameBaseSchema
  .extend({ width: z.literal(960), height: z.literal(540) })
  .strict();
const continuationFrameSchema = frameBaseSchema
  .extend({ width: z.literal(720), height: z.literal(405) })
  .strict();

const directionSchema = z
  .object({
    id: z.enum(["golden-gate", "chrome-launch", "blue-hour"]),
    cueLabel: copy(40),
    request: copy(160),
    frames: z.tuple([
      firstFrameSchema,
      continuationFrameSchema,
      continuationFrameSchema,
    ]),
    clarifyingQuestion: copy(120),
    clarifyingAnswers: z.tuple([copy(40), copy(40)]),
    memory: z
      .object({
        mood: copy(40),
        palette: copy(80),
        pace: copy(60),
        reference: copy(80),
      })
      .strict(),
    firstCutMode: z.enum(["matched", "storyboard-only"]),
    objectPosition: copy(32),
  })
  .strict();

const manifestSchema = z
  .object({
    firstVisualResponse: z.literal(
      "First visual ready. Want me to build the storyboard?",
    ),
    featuredFilm: z
      .object({
        label: z.literal("Featured film study · Quiet morning"),
        poster: versionedAssetPath,
        webm: versionedAssetPath,
        mp4: versionedAssetPath,
        duration: z.literal(8),
      })
      .strict(),
    directions: z.tuple([directionSchema, directionSchema, directionSchema]),
  })
  .strict()
  .superRefine((manifest, context) => {
    const expectedIds: readonly DirectionId[] = [
      "golden-gate",
      "chrome-launch",
      "blue-hour",
    ];

    manifest.directions.forEach((direction, index) => {
      if (direction.id !== expectedIds[index]) {
        context.addIssue({
          code: "custom",
          path: ["directions", index, "id"],
          message: `Expected direction ${expectedIds[index]} at index ${index}.`,
        });
      }

      direction.frames.forEach((frame, frameIndex) => {
        const expectedShot = `0${frameIndex + 1}`;
        if (frame.shot !== expectedShot) {
          context.addIssue({
            code: "custom",
            path: ["directions", index, "frames", frameIndex, "shot"],
            message: `Expected shot ${expectedShot}.`,
          });
        }
      });
    });
  });

const manifest = manifestSchema.parse(manifestJson);

export const FIRST_VISUAL_RESPONSE = manifest.firstVisualResponse;
export const FEATURED_FILM: Readonly<FeaturedFilm> = Object.freeze(
  manifest.featuredFilm,
);
export const DIRECTIONS: readonly DirectionSpec[] = Object.freeze(
  manifest.directions.map((direction) =>
    Object.freeze({
      ...direction,
      frames: Object.freeze(
        direction.frames.map((frame) => Object.freeze(frame)),
      ),
      clarifyingAnswers: Object.freeze([...direction.clarifyingAnswers]),
      memory: Object.freeze(direction.memory),
    }),
  ),
) as readonly DirectionSpec[];

export const DIRECTION_IDS = DIRECTIONS.map(
  (direction) => direction.id,
) as readonly DirectionId[];

export const DIRECTIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    DIRECTIONS.map((direction) => [direction.id, direction]),
  ) as Record<DirectionId, DirectionSpec>,
);

export function getDirection(directionId: DirectionId): DirectionSpec {
  return DIRECTIONS_BY_ID[directionId];
}
