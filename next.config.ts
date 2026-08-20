import type { NextConfig } from "next";

const contentSecurityPolicy = [
  "default-src 'self'",
  // Static App Router HTML includes inline Flight bootstrap records. External
  // chunks remain same-origin and SRI-pinned; allowing only inline bootstrap
  // keeps hydration functional without opening any third-party script origin.
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' blob: data:",
  "font-src 'self' data:",
  "media-src 'self'",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "frame-src https://cal.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
];

const immutableHeaders = [
  { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    sri: { algorithm: "sha256" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/media/air/v2026-08-19-a/:path*",
        headers: immutableHeaders,
      },
      {
        source: "/images/opening/v2026-08-19-a/:path*",
        headers: immutableHeaders,
      },
    ];
  },
};

export default nextConfig;
