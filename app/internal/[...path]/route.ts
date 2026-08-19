import { proxyAirBackend } from "@/lib/backend-proxy";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxy(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const pathname = `/internal/${path.map(encodeURIComponent).join("/")}`;
  return proxyAirBackend(request, pathname);
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
