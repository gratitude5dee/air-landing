import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawn } from "node:child_process";

import ffprobeStatic from "ffprobe-static";
import sharp from "sharp";

const SCRIPT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(SCRIPT_DIRECTORY, "..");
const PUBLIC_ROOT = resolve(PROJECT_ROOT, "public");
const MANIFEST_PATH = resolve(PROJECT_ROOT, "content/directions.json");
const VERSION_PREFIX = "/media/air/v2026-08-19-a/";
const FIRST_FRAME_BUDGET = 120 * 1024;
const CONTINUATION_FRAME_BUDGET = 90 * 1024;
const POSTER_BUDGET = 180 * 1024;
const FILM_PACKAGE_BUDGET = 2.5 * 1024 * 1024;
const FILM_DURATION_TOLERANCE_SECONDS = 0.05;
const MAX_KEYFRAME_GAP_SECONDS = 0.5;
const KEYFRAME_EPSILON_SECONDS = 0.002;
const FFPROBE_TIMEOUT_MS = 15_000;

function fail(message) {
  throw new Error(message);
}

function isContainedPath(parent, candidate) {
  const pathFromParent = relative(parent, candidate);
  return (
    pathFromParent !== "" &&
    pathFromParent !== ".." &&
    !pathFromParent.startsWith(`..${sep}`) &&
    !pathFromParent.includes(":")
  );
}

export function validateAssetUrlPath(assetPath) {
  if (typeof assetPath !== "string" || !assetPath.startsWith(VERSION_PREFIX)) {
    fail(`Asset path must begin with ${VERSION_PREFIX}: ${String(assetPath)}`);
  }
  if (
    assetPath.includes("\\") ||
    assetPath.includes("?") ||
    assetPath.includes("#") ||
    assetPath.includes("%") ||
    assetPath.includes("//") ||
    assetPath.split("/").some((segment) => segment === "." || segment === "..")
  ) {
    fail(`Asset path contains a forbidden path segment or URL escape: ${assetPath}`);
  }
  if (!/^\/media\/air\/v2026-08-19-a\/[a-z0-9][a-z0-9/_-]*\.(?:webp|webm|mp4)$/.test(assetPath)) {
    fail(`Asset path does not match the versioned media contract: ${assetPath}`);
  }
  return assetPath;
}

export function resolvePublicAsset(assetPath) {
  validateAssetUrlPath(assetPath);
  const absolutePath = resolve(PUBLIC_ROOT, `.${assetPath}`);
  if (!isContainedPath(PUBLIC_ROOT, absolutePath)) {
    fail(`Asset path escapes the public directory: ${assetPath}`);
  }
  return absolutePath;
}

async function runFfprobe(args, label) {
  const ffprobePath = ffprobeStatic?.path;
  if (!ffprobePath) fail("ffprobe-static did not provide a binary path.");

  return await new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(ffprobePath, args, {
      cwd: PROJECT_ROOT,
      env: { PATH: process.env.PATH ?? "" },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      child.kill("SIGKILL");
      settled = true;
      rejectPromise(new Error(`ffprobe timed out after ${FFPROBE_TIMEOUT_MS}ms for ${label}.`));
    }, FFPROBE_TIMEOUT_MS);

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      if (stdout.length > 5 * 1024 * 1024) child.kill("SIGKILL");
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      if (stderr.length > 256 * 1024) child.kill("SIGKILL");
    });
    child.on("error", (error) => {
      if (settled) return;
      clearTimeout(timeout);
      settled = true;
      rejectPromise(new Error(`ffprobe could not inspect ${label}: ${error.message}`));
    });
    child.on("close", (code, signal) => {
      if (settled) return;
      clearTimeout(timeout);
      settled = true;
      if (code !== 0) {
        rejectPromise(
          new Error(
            `ffprobe failed for ${label} (code ${String(code)}, signal ${String(signal)}): ${stderr.trim() || "no diagnostic"}`,
          ),
        );
        return;
      }
      try {
        resolvePromise(JSON.parse(stdout));
      } catch {
        rejectPromise(new Error(`ffprobe returned invalid JSON for ${label}.`));
      }
    });
  });
}

async function verifyImage({ assetPath, width, height, maxBytes, label }) {
  const absolutePath = resolvePublicAsset(assetPath);
  const fileStats = await stat(absolutePath).catch(() => null);
  if (!fileStats?.isFile()) fail(`${label} is missing: ${assetPath}`);
  if (fileStats.size > maxBytes) {
    fail(`${label} exceeds ${maxBytes} bytes (${fileStats.size}): ${assetPath}`);
  }

  let metadata;
  try {
    metadata = await sharp(absolutePath, { failOn: "error" }).metadata();
  } catch (error) {
    fail(`${label} is not a readable image (${assetPath}): ${error instanceof Error ? error.message : String(error)}`);
  }
  if (metadata.format !== "webp") fail(`${label} must be WebP: ${assetPath}`);
  if (metadata.width !== width || metadata.height !== height) {
    fail(`${label} must be ${width}x${height}, received ${String(metadata.width)}x${String(metadata.height)}: ${assetPath}`);
  }
  if (metadata.pages && metadata.pages !== 1) fail(`${label} must be a single-frame image: ${assetPath}`);

  return { absolutePath, bytes: fileStats.size };
}

function finiteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) fail(`${label} is not finite.`);
  return number;
}

async function verifyFilm({ assetPath, duration, codecName, formatName }) {
  const absolutePath = resolvePublicAsset(assetPath);
  const fileStats = await stat(absolutePath).catch(() => null);
  if (!fileStats?.isFile()) fail(`Film source is missing: ${assetPath}`);

  const metadata = await runFfprobe(
    [
      "-v", "error",
      "-show_entries", "format=format_name,duration:stream=index,codec_type,codec_name,width,height",
      "-of", "json",
      absolutePath,
    ],
    assetPath,
  );
  const streams = Array.isArray(metadata.streams) ? metadata.streams : [];
  const videoStreams = streams.filter((stream) => stream.codec_type === "video");
  const audioStreams = streams.filter((stream) => stream.codec_type === "audio");
  if (videoStreams.length !== 1) fail(`${assetPath} must contain exactly one video stream.`);
  if (audioStreams.length !== 0) fail(`${assetPath} must not contain an audio stream.`);
  if (streams.some((stream) => stream.codec_type !== "video")) {
    fail(`${assetPath} contains a non-video stream.`);
  }
  const [video] = videoStreams;
  if (video.codec_name !== codecName) fail(`${assetPath} must use ${codecName}; received ${String(video.codec_name)}.`);
  if (video.width !== 1280 || video.height !== 720) {
    fail(`${assetPath} must be 1280x720; received ${String(video.width)}x${String(video.height)}.`);
  }
  const detectedFormat = String(metadata.format?.format_name ?? "");
  if (!detectedFormat.split(",").includes(formatName)) {
    fail(`${assetPath} must use the ${formatName} container; received ${detectedFormat || "unknown"}.`);
  }
  const detectedDuration = finiteNumber(metadata.format?.duration, `${assetPath} duration`);
  if (Math.abs(detectedDuration - duration) > FILM_DURATION_TOLERANCE_SECONDS) {
    fail(`${assetPath} must be ${duration}s ±${FILM_DURATION_TOLERANCE_SECONDS}s; received ${detectedDuration}s.`);
  }

  const frameData = await runFfprobe(
    [
      "-v", "error",
      "-select_streams", "v:0",
      "-skip_frame", "nokey",
      "-show_frames",
      "-show_entries", "frame=best_effort_timestamp_time,pkt_dts_time",
      "-of", "json",
      absolutePath,
    ],
    `${assetPath} keyframes`,
  );
  const frames = Array.isArray(frameData.frames) ? frameData.frames : [];
  const keyframes = frames
    .map((frame) => frame.best_effort_timestamp_time ?? frame.pkt_dts_time)
    .filter((timestamp) => timestamp !== undefined)
    .map((timestamp) => finiteNumber(timestamp, `${assetPath} keyframe timestamp`))
    .sort((left, right) => left - right);
  if (keyframes.length < 2) fail(`${assetPath} does not contain enough keyframes to verify seeking.`);

  const timeline = [0, ...keyframes.filter((timestamp) => timestamp > KEYFRAME_EPSILON_SECONDS), detectedDuration];
  const maximumGap = timeline.slice(1).reduce((largest, timestamp, index) => {
    return Math.max(largest, timestamp - timeline[index]);
  }, 0);
  if (maximumGap > MAX_KEYFRAME_GAP_SECONDS + KEYFRAME_EPSILON_SECONDS) {
    fail(`${assetPath} keyframe gap is ${maximumGap.toFixed(3)}s; maximum is ${MAX_KEYFRAME_GAP_SECONDS}s.`);
  }

  return { absolutePath, bytes: fileStats.size };
}

async function sha256(filePath) {
  const bytes = await readFile(filePath);
  return createHash("sha256").update(bytes).digest("hex");
}

export async function verifyAssets() {
  const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(manifest.directions) || manifest.directions.length !== 3) {
    fail("content/directions.json must contain exactly three directions.");
  }
  if (!manifest.featuredFilm || manifest.featuredFilm.duration !== 8) {
    fail("content/directions.json must declare the eight-second featured film.");
  }

  const verified = [];
  for (const direction of manifest.directions) {
    if (!Array.isArray(direction.frames) || direction.frames.length !== 3) {
      fail(`Direction ${String(direction.id)} must contain exactly three frames.`);
    }
    for (const [index, frame] of direction.frames.entries()) {
      const first = index === 0;
      verified.push(
        await verifyImage({
          assetPath: frame.src,
          width: first ? 960 : 720,
          height: first ? 540 : 405,
          maxBytes: first ? FIRST_FRAME_BUDGET : CONTINUATION_FRAME_BUDGET,
          label: `${String(direction.id)} frame ${index + 1}`,
        }),
      );
    }
  }

  verified.push(
    await verifyImage({
      assetPath: manifest.featuredFilm.poster,
      width: 1280,
      height: 720,
      maxBytes: POSTER_BUDGET,
      label: "Featured-film poster",
    }),
  );
  const webm = await verifyFilm({
    assetPath: manifest.featuredFilm.webm,
    duration: manifest.featuredFilm.duration,
    codecName: "vp9",
    formatName: "webm",
  });
  const mp4 = await verifyFilm({
    assetPath: manifest.featuredFilm.mp4,
    duration: manifest.featuredFilm.duration,
    codecName: "h264",
    formatName: "mp4",
  });
  verified.push(webm, mp4);
  if (webm.bytes + mp4.bytes > FILM_PACKAGE_BUDGET) {
    fail(`Featured-film WebM + MP4 exceed ${FILM_PACKAGE_BUDGET} bytes (${webm.bytes + mp4.bytes}).`);
  }

  const seenPaths = new Set();
  const hashOwners = new Map();
  for (const asset of verified) {
    const normalizedPath = relative(PUBLIC_ROOT, asset.absolutePath);
    if (seenPaths.has(normalizedPath)) fail(`Asset path is referenced more than once: /${normalizedPath}`);
    seenPaths.add(normalizedPath);
    const digest = await sha256(asset.absolutePath);
    const prior = hashOwners.get(digest);
    if (prior && prior !== normalizedPath) {
      fail(`Duplicate asset bytes appear at conflicting paths: /${prior} and /${normalizedPath}`);
    }
    hashOwners.set(digest, normalizedPath);
  }

  return {
    assets: verified.length,
    imageAssets: verified.length - 2,
    filmSources: 2,
    filmPackageBytes: webm.bytes + mp4.bytes,
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  verifyAssets()
    .then((result) => {
      console.log(
        `Verified ${result.assets} versioned assets (${result.imageAssets} images, ${result.filmSources} silent film sources; ${result.filmPackageBytes} film bytes).`,
      );
    })
    .catch((error) => {
      console.error(`Asset verification failed: ${error instanceof Error ? error.message : String(error)}`);
      process.exitCode = 1;
    });
}
