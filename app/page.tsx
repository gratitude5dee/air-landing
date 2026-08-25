import { Header, Footer } from "@/components/Chrome";
import {
  AIR_FAQ_ITEMS,
  ComposableCapabilities,
  ComposableClosing,
  ComposableDefinition,
  ComposableFaq,
  IMessageDrop,
  MiniAppStore,
  Pricing,
  ProductSequence,
  Roadmap,
} from "@/components/ComposableSections";
import { Hero } from "@/components/Hero";
import { IntroFilm } from "@/components/IntroFilm";
import { IMessageControlPlane } from "@/components/IMessageControlPlane";
import { MotionEnhancer } from "@/components/MotionEnhancer";
import { AIR_PRODUCT_DESCRIPTION, AIR_TAGLINE } from "@/lib/air-copy";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Air by WZRD",
    url: "https://air.wzrd.tech",
    description: `Air is ${AIR_TAGLINE.toLowerCase()}`,
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
    description:
      `A ${AIR_TAGLINE.toLowerCase()} ${AIR_PRODUCT_DESCRIPTION}`,
    featureList: [
      "Persistent managed Ubuntu workspace",
      "Context continuity across iMessage and web",
      "Persistent memory",
      "Mini Apps",
      "Supported app-toolkit catalog",
      "Human approval controls",
    ],
    releaseNotes: "Private beta. Omarchy and macOS environments are coming soon.",
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: AIR_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  },
];

export default function Home() {
  return (
    <>
      <IntroFilm />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Header />
      <main id="main">
        <div id="top" />
        <Hero>
          <IMessageDrop />
          <IMessageControlPlane />
          <ComposableDefinition />
          <ComposableCapabilities />
          <ProductSequence />
          <MiniAppStore />
          <Roadmap />
          <Pricing />
          <ComposableFaq />
          <ComposableClosing />
        </Hero>
      </main>
      <Footer />
      <MotionEnhancer />
    </>
  );
}
