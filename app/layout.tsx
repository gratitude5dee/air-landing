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
  title: "Air by WZRD — Your personal creative assistant in your iMessages",
  description:
    "Text a thought, a reference, or a rough brief. Air helps shape the next creative move and brings it back to your thread—without another dashboard.",
  applicationName: "Air by WZRD.tech",
  keywords: ["creative assistant", "iMessage assistant", "AI agent", "WZRD.tech"],
  openGraph: {
    type: "website",
    siteName: "Air by WZRD.tech",
    title: "Your personal creative assistant in your iMessages.",
    description: "Text a thought, a reference, or a rough brief. Air brings the next creative move back to the thread.",
    url: "https://air.wzrd.tech",
  },
  twitter: {
    card: "summary_large_image",
    title: "Air by WZRD — Your personal creative assistant in your iMessages",
    description: "Text a thought. Air brings the next creative move back to the thread.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#c5e6f8",
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
