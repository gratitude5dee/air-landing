import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { PreorderProvider } from "@/components/Preorder";
import "@fontsource-variable/azeret-mono";
import "@fontsource-variable/newsreader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://air.wzrd.tech"),
  title: "Air by WZRD — Your creative assistant in iMessage",
  description:
    "Text Air what you need. It researches, creates, coordinates your apps, and brings the work back to iMessage.",
  applicationName: "Air by WZRD.tech",
  keywords: ["creative assistant", "iMessage assistant", "AI agent", "WZRD.tech"],
  openGraph: {
    type: "website",
    siteName: "Air by WZRD.tech",
    title: "Your creative assistant, inside iMessage.",
    description: "One text in. Your creative work, apps, and follow-through orchestrated by Air.",
    url: "https://air.wzrd.tech",
  },
  twitter: {
    card: "summary_large_image",
    title: "Air by WZRD — inside iMessage",
    description: "Your creative assistant, one text away.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  themeColor: "#071124",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-air-hero-header="covered">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <noscript>
          <style>{`html[data-air-hero-header="covered"] .site-header{z-index:80;opacity:1;pointer-events:auto;filter:none;transform:none}`}</style>
        </noscript>
        <PreorderProvider>{children}</PreorderProvider>
        <Analytics />
        <SpeedInsights />
        <Script src="/vendor/dither-kit.js" strategy="afterInteractive" />
        <Script src="/vendor/wz-atmosphere.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
