import type { Metadata } from "next";

import { Footer, Header } from "@/components/Chrome";
import { ConnectionBanner } from "@/components/ConnectionBanner";
import { LandingExperience } from "@/components/LandingExperience";
import { LaunchFilm } from "@/components/LaunchFilm";
import { MuseConnection } from "@/components/MuseConnection";
import { AIR_HERO_TITLE, AIR_PRODUCT_DESCRIPTION } from "@/lib/air-copy";

export const metadata: Metadata = {
  title: `Air by WZRD | ${AIR_HERO_TITLE}`,
  description: AIR_PRODUCT_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: `Air — ${AIR_HERO_TITLE}`,
    description: AIR_PRODUCT_DESCRIPTION,
    url: "/",
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Air by WZRD",
    url: "https://air.wzrd.tech",
    description: `Air is ${AIR_HERO_TITLE.toLowerCase()}`,
    publisher: { "@id": "https://air.wzrd.tech/#organization" },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://air.wzrd.tech/#organization",
    name: "WZRD.tech",
    url: "https://wzrd.tech",
  },
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Air",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Ubuntu",
    url: "https://air.wzrd.tech",
    description: `${AIR_HERO_TITLE}. ${AIR_PRODUCT_DESCRIPTION}`,
    featureList: [
      "Persistent managed Ubuntu workspace",
      "Context continuity across iMessage and web",
      "Persistent memory",
      "Mini Apps",
      "Human approval controls",
    ],
    releaseNotes: "Private beta. Omarchy and macOS environments are coming soon.",
  },
];

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Header />
      <ConnectionBanner />
      <LandingExperience />
      <MuseConnection />
      <LaunchFilm />
      <Footer />
    </>
  );
}
