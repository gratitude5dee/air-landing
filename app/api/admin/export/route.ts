import { NextResponse } from "next/server";
import { exportAdminMembers, requireAdminSession } from "@/lib/admin";

export const runtime = "nodejs";

function csvCell(value: unknown) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export async function GET(request: Request) {
  if (!(await requireAdminSession(request).catch(() => false))) return NextResponse.json({ ok: false }, { status: 401 });
  const url = new URL(request.url);
  try {
    const members = await exportAdminMembers(url.searchParams.get("q")?.slice(0, 80) || "", url.searchParams.get("source") || "all");
    const lines = ["position,name,email,imessage,source,interest,referrals,paid,payment_status,created_at", ...members.map((member) => [member.position, member.name, member.email, member.imessage, member.source, member.interest, member.referralCount, member.paid, member.paymentStatus, member.createdAt].map(csvCell).join(","))];
    return new NextResponse(lines.join("\n"), { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename=air-waitlist.csv", "cache-control": "private, no-store" } });
  } catch { return NextResponse.json({ ok: false, message: "Could not export members." }, { status: 503 }); }
}
