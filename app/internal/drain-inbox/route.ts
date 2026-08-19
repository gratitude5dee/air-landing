import { proxyAirBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export const GET = (request: Request) => proxyAirBackend(request, "/internal/drain-inbox");
export const POST = (request: Request) => proxyAirBackend(request, "/internal/drain-inbox");
