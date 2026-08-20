import "server-only";

import {
  getParityBackendOrigin,
  getParityRoutePolicy,
} from "@/lib/route-policy";

type BoundedBody = Uint8Array | undefined | null;

function proxyResponse(code: string, status: number) {
  return Response.json(
    { ok: false, code },
    {
      status,
      headers: {
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function notFoundResponse() {
  return new Response(null, {
    status: 404,
    headers: { "cache-control": "private, no-store" },
  });
}

function asArrayBuffer(bytes: Uint8Array | undefined) {
  if (!bytes) return undefined;
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function parseDeclaredLength(value: string | null) {
  if (value === null) return undefined;
  if (!/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

async function readBoundedBody(
  stream: ReadableStream<Uint8Array> | null,
  declaredLength: string | null,
  maxBytes: number,
): Promise<BoundedBody> {
  const declared = parseDeclaredLength(declaredLength);
  if (declared === null || (declared !== undefined && declared > maxBytes)) return null;
  if (!stream) return undefined;

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel("request body too large");
      return null;
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function proxyAirBackend(
  request: Request,
  pathname: string,
) {
  const origin = getParityBackendOrigin();
  if (!origin) return notFoundResponse();

  const policy = getParityRoutePolicy(pathname);
  if (!policy) return notFoundResponse();
  if (request.method !== policy.method) {
    const response = proxyResponse("method_not_allowed", 405);
    response.headers.set("allow", policy.method);
    return response;
  }

  const sourceUrl = new URL(request.url);
  if (sourceUrl.search) {
    return proxyResponse("query_not_allowed", 400);
  }
  const contentEncoding = request.headers.get("content-encoding")?.toLowerCase();
  if (contentEncoding && contentEncoding !== "identity") {
    return proxyResponse("content_encoding_not_allowed", 415);
  }

  const target = new URL(policy.pathname, `${origin}/`);
  const headers = new Headers();

  for (const name of policy.requestHeaders) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set("x-air-landing-proxy", "parity-preview");

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody
    ? await readBoundedBody(
        request.body,
        request.headers.get("content-length"),
        policy.maxRequestBytes,
      )
    : undefined;
  if (body === null) {
    return proxyResponse("payload_too_large", 413);
  }

  try {
    const response = await fetch(target, {
      method: policy.method,
      headers,
      body: asArrayBuffer(body),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(policy.timeoutMs),
    });

    if (response.status >= 300 && response.status < 400) {
      return proxyResponse("upstream_redirect_rejected", 502);
    }

    const responseBody = await readBoundedBody(
      response.body,
      response.headers.get("content-length"),
      policy.maxResponseBytes,
    );
    if (responseBody === null) {
      return proxyResponse("upstream_payload_too_large", 502);
    }

    const responseHeaders = new Headers();
    for (const name of policy.responseHeaders) {
      const value = response.headers.get(name);
      if (value !== null) responseHeaders.set(name, value);
    }
    responseHeaders.set("cache-control", "private, no-store");
    responseHeaders.set("x-air-backend", "parity-preview");
    responseHeaders.set("x-content-type-options", "nosniff");

    return new Response(asArrayBuffer(responseBody), {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error("air_parity_proxy_failed", {
      route: policy.id,
      outcome: timedOut ? "timeout" : "unavailable",
    });
    return proxyResponse(
      timedOut ? "upstream_timeout" : "upstream_unavailable",
      timedOut ? 504 : 502,
    );
  }
}
