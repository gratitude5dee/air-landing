import { proxyAirBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const POST = (request: Request) =>
  proxyAirBackend(request, "/webhooks/imessage", { maxRequestBytes: 64 * 1024 });
export const GET = (request: Request) => proxyAirBackend(request, "/webhooks/imessage");
