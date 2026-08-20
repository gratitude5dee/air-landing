import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { rateLimit, savePreorder } from "@/lib/preorders";

export const runtime = "nodejs";

const schema = z.object({
  name: z.string().trim().min(2, "Add your name.").max(80, "Keep your name under 80 characters."),
  email: z.email("Add a valid email address."),
  imessage: z
    .string()
    .trim()
    .min(7, "Add the number connected to iMessage.")
    .max(32, "That iMessage number is too long.")
    .refine((value) => /^\+?[\d\s().-]{7,}$/.test(value), "Add a valid iMessage number.")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 7 && digits.length <= 15;
    }, "Add a valid iMessage number."),
  consent: z.literal(true, { error: "Confirm that we may contact you about Air." }),
  company: z.string().max(256).optional(),
});

type FailureCode = "invalid_request" | "rate_limited" | "storage_unavailable";
const MAX_PREORDER_BODY_BYTES = 8 * 1024;

async function readPayload(request: Request) {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();
  if (mediaType !== "application/json") return null;

  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > MAX_PREORDER_BODY_BYTES)) {
    return null;
  }
  if (!request.body) return null;

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_PREORDER_BODY_BYTES) {
      await reader.cancel("preorder body too large");
      return null;
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch {
    return null;
  }
}

function failure(
  code: FailureCode,
  status: 400 | 429 | 503,
  message: string,
  requestId: string,
) {
  return NextResponse.json(
    { ok: false, code, message, requestId },
    {
      status,
      headers: {
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

export async function POST(request: Request) {
  const requestId = randomUUID();
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anonymous";

  let allowed: boolean;
  try {
    allowed = await rateLimit(ip);
  } catch {
    console.error("air_preorder_failed", { code: "rate_limit_unavailable", requestId });
    return failure(
      "storage_unavailable",
      503,
      "Air could not save your preorder yet. Please try again.",
      requestId,
    );
  }
  if (!allowed) {
    return failure(
      "rate_limited",
      429,
      "Too many attempts. Try again in a few minutes.",
      requestId,
    );
  }

  const parsed = schema.safeParse(await readPayload(request));
  if (!parsed.success) {
    return failure(
      "invalid_request",
      400,
      parsed.error.issues[0]?.message || "Check your details and try again.",
      requestId,
    );
  }

  if (parsed.data.company?.trim()) {
    return NextResponse.json(
      { ok: true },
      {
        status: 202,
        headers: {
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  }

  try {
    const stored = await savePreorder({
      name: parsed.data.name,
      email: parsed.data.email.trim().toLowerCase(),
      imessage: parsed.data.imessage.trim(),
      consent: parsed.data.consent,
      createdAt: new Date().toISOString(),
      source: "air-landing",
    });
    return NextResponse.json(
      { ok: true, stored: true, receipt: stored.receipt },
      {
        headers: {
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  } catch {
    console.error("air_preorder_failed", { code: "persistence_unavailable", requestId });
    return failure(
      "storage_unavailable",
      503,
      "Air could not save your preorder yet. Please try again.",
      requestId,
    );
  }
}
