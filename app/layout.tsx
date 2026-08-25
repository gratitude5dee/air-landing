import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AmbientCursor } from "@/components/AmbientCursor";
import { PageAtmosphere } from "@/components/PageAtmosphere";
import { PreorderProvider } from "@/components/Preorder";
import { resolveAirFeatureFlags } from "@/lib/feature-flags";
import "@fontsource-variable/azeret-mono";
import "@fontsource-variable/inter";
import "./globals.css";
import "./cloudborne.css";
import "./typography.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://air.wzrd.tech"),
  title: "Air by WZRD | Personal Composable AI Computer",
  description:
    "Air is a personal composable computer: one persistent AI agent with private compute, memory, Mini Apps, app connections, and approval controls.",
  applicationName: "Air by WZRD.tech",
  keywords: [
    "personal AI computer",
    "AI agent with its own computer",
    "iMessage AI assistant",
    "persistent AI memory",
    "composable AI agent",
    "AI Mini App Store",
    "WZRD.tech",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Air by WZRD.tech",
    title: "Air — Your personal, creative, composable computer",
    description: "One persistent AI agent with its own computer, memory, tools, connections, and Mini Apps.",
    url: "https://air.wzrd.tech",
  },
  twitter: {
    card: "summary_large_image",
    title: "Air by WZRD | Personal Composable AI Computer",
    description: "One persistent AI agent with its own computer, memory, tools, connections, and Mini Apps.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#d9edf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { cinematicEnabled } = resolveAirFeatureFlags();

  return (
    <html lang="en" data-air-hero-header="covered">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AmbientCursor />
        <PageAtmosphere enabled={cinematicEnabled} />
        <noscript>
          <style>{`
            html[data-air-hero-header="covered"] .site-header{z-index:80;opacity:1;pointer-events:auto;filter:none;transform:none}
            .hero-scroll{height:auto!important}.hero-sticky{position:relative!important}.hero-opening,.hero-shader,.cloud-curtain{display:none!important}.hero-content{opacity:1!important;transform:none!important}
          `}</style>
        </noscript>
        <PreorderProvider>{children}</PreorderProvider>
        <Analytics />
        <SpeedInsights />
        <Script
          src="/vendor/air-prepaint-v2026-08-20-b.js"
          strategy="beforeInteractive"
        />
        <Script src="/vendor/dither-kit.js" strategy="afterInteractive" />
        {cinematicEnabled && (
          <Script src="/vendor/wz-atmosphere.js" strategy="afterInteractive" />
        )}
      </body>
    </html>
  );
}
