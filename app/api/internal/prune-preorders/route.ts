import { NextResponse } from "next/server";

import { pruneExpiredPreorderData } from "@/lib/preorders";
import { bearerSecretMatches } from "@/lib/route-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: Request) {
  if (!bearerSecretMatches(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return new Response(null, {
      status: 404,
      headers: { "cache-control": "private, no-store" },
    });
  }

  try {
    const result = await pruneExpiredPreorderData();
    return NextResponse.json(
      { ok: true, code: "pruned", ...result },
      {
        headers: {
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  } catch {
    console.error("air_preorder_prune_failed", { code: "storage_unavailable" });
    return NextResponse.json(
      { ok: false, code: "storage_unavailable" },
      {
        status: 503,
        headers: {
          "cache-control": "private, no-store",
          "x-content-type-options": "nosniff",
        },
      },
    );
  }
}
