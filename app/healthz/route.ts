import { proxyAirBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const GET = (request: Request) => proxyAirBackend(request, "/healthz");
