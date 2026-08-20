import { proxyAirBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const proxy = (request: Request) => proxyAirBackend(request, "/healthz");

export const GET = proxy;
export const HEAD = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
