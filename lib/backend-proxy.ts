import "server-only";

const DEFAULT_BACKEND = "https://air-eight-delta.vercel.app";

const requestHeaderBlocklist = new Set([
  "connection",
  "content-length",
  "host",
  "transfer-encoding",
]);

const responseHeaderBlocklist = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "transfer-encoding",
]);

type ProxyOptions = {
  maxRequestBytes?: number;
};

async function readBoundedBody(request: Request, maxBytes?: number) {
  if (!request.body) return undefined;

  const declaredLength = Number(request.headers.get("content-length"));
  if (maxBytes && Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    return null;
  }

  if (!maxBytes) return new Uint8Array(await request.arrayBuffer());

  const reader = request.body.getReader();
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
  options: ProxyOptions = {},
) {
  const origin = (process.env.AIR_BACKEND_ORIGIN || DEFAULT_BACKEND).replace(/\/$/, "");
  const sourceUrl = new URL(request.url);
  const target = new URL(`${pathname}${sourceUrl.search}`, `${origin}/`);
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    if (!requestHeaderBlocklist.has(key.toLowerCase())) headers.set(key, value);
  });

  headers.set("x-air-landing-proxy", "1");
  headers.set("x-forwarded-host", sourceUrl.host);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const body = hasBody ? await readBoundedBody(request, options.maxRequestBytes) : undefined;
  if (body === null) {
    return Response.json({ ok: false, error: "payload_too_large" }, { status: 413 });
  }

  const response = await fetch(target, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers();
  response.headers.forEach((value, key) => {
    if (!responseHeaderBlocklist.has(key.toLowerCase())) responseHeaders.set(key, value);
  });
  responseHeaders.set("x-air-backend", "passthrough");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
