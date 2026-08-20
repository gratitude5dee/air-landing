import "server-only";

import { timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

export type ParityRoutePolicy = {
  id: "health" | "imessage-webhook" | "drain-inbox";
  pathname: "/healthz" | "/webhooks/imessage" | "/internal/drain-inbox";
  method: "GET" | "POST";
  requestHeaders: readonly string[];
  responseHeaders: readonly string[];
  maxRequestBytes: number;
  maxResponseBytes: number;
  timeoutMs: number;
};

const policies = [
  {
    id: "health",
    pathname: "/healthz",
    method: "GET",
    requestHeaders: [],
    responseHeaders: ["content-type", "cache-control", "retry-after", "x-request-id"],
    maxRequestBytes: 0,
    maxResponseBytes: 16 * 1024,
    timeoutMs: 5_000,
  },
  {
    id: "imessage-webhook",
    pathname: "/webhooks/imessage",
    method: "POST",
    requestHeaders: [
      "content-type",
      "x-spectrum-signature",
      "x-spectrum-timestamp",
      "x-spectrum-webhook-id",
      "x-spectrum-event",
    ],
    responseHeaders: ["content-type", "cache-control", "retry-after", "x-request-id"],
    maxRequestBytes: 64 * 1024,
    maxResponseBytes: 16 * 1024,
    timeoutMs: 8_000,
  },
  {
    id: "drain-inbox",
    pathname: "/internal/drain-inbox",
    method: "POST",
    requestHeaders: ["authorization"],
    responseHeaders: ["content-type", "cache-control", "retry-after", "x-request-id"],
    maxRequestBytes: 0,
    maxResponseBytes: 64 * 1024,
    timeoutMs: 30_000,
  },
] as const satisfies readonly ParityRoutePolicy[];

const productionBackendHosts = new Set([
  "air-eight-delta.vercel.app",
  "air.wzrd.tech",
]);

function isPrivateHostname(hostname: string) {
  const normalized = hostname
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.+$/, "");
  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized.endsWith(".local") ||
    normalized.endsWith(".internal")
  ) {
    return true;
  }

  const ipVersion = isIP(normalized);
  if (ipVersion === 4) {
    const [first = 0, second = 0, third = 0] = normalized.split(".").map(Number);
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 0 && (third === 0 || third === 2)) ||
      (first === 192 && second === 168) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113) ||
      first >= 224
    );
  }
  if (ipVersion === 6) {
    return (
      normalized === "::" ||
      normalized === "::1" ||
      normalized.startsWith("::ffff:") ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe8") ||
      normalized.startsWith("fe9") ||
      normalized.startsWith("fea") ||
      normalized.startsWith("feb") ||
      normalized.startsWith("2001:db8:")
    );
  }
  return false;
}

export function getParityBackendOrigin() {
  if (
    process.env.VERCEL_ENV !== "preview" ||
    process.env.AIR_PARITY_PROXY_ENABLED !== "true" ||
    (process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim().length ?? 0) < 16
  ) {
    return null;
  }

  const configured = process.env.AIR_PARITY_BACKEND_ORIGIN?.trim();
  if (!configured) return null;

  try {
    const url = new URL(configured);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      (url.pathname !== "/" && url.pathname !== "") ||
      productionBackendHosts.has(
        url.hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.+$/, ""),
      ) ||
      isPrivateHostname(url.hostname)
    ) {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

export function getParityRoutePolicy(pathname: string) {
  return policies.find((policy) => policy.pathname === pathname) ?? null;
}

export function bearerSecretMatches(header: string | null, secret: string | undefined) {
  const normalizedSecret = secret?.trim();
  if (
    !normalizedSecret ||
    normalizedSecret.length < 32 ||
    normalizedSecret.startsWith("replace-") ||
    !header?.startsWith("Bearer ")
  ) {
    return false;
  }

  const supplied = Buffer.from(header.slice("Bearer ".length), "utf8");
  const expected = Buffer.from(normalizedSecret, "utf8");
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
