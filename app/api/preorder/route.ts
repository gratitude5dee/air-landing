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
  company: z.string().max(0).optional(),
});

export async function POST(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "anonymous";

  if (!(await rateLimit(ip))) {
    return NextResponse.json(
      { ok: false, message: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message || "Check your details and try again." },
      { status: 400 },
    );
  }

  if (parsed.data.company) return NextResponse.json({ ok: true });

  try {
    await savePreorder({
      name: parsed.data.name,
      email: parsed.data.email.trim().toLowerCase(),
      imessage: parsed.data.imessage.trim(),
      consent: parsed.data.consent,
      createdAt: new Date().toISOString(),
      source: "air-landing",
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("preorder_persist_failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { ok: false, message: "Air could not save your preorder yet. Please try again." },
      { status: 503 },
    );
  }
}
