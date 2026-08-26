import { Header, Footer } from "@/components/Chrome";
import { GradualBlur } from "@/components/GradualBlur";
import {
  AIR_FAQ_ITEMS,
  CommunicationLayer,
  ComposableCapabilities,
  ComposableClosing,
  ComposableDefinition,
  ComposableFaq,
  IMessageDrop,
  MiniAppStore,
  Pricing,
  PrivacyFirst,
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
      "Zero-data-retention privacy policy",
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
      <GradualBlur target="page" position="top" height="4.5rem" strength={0.72} divCount={5} zIndex={60} />
      <GradualBlur target="page" position="bottom" height="5.25rem" strength={1.05} divCount={6} zIndex={60} />
      <main id="main">
        <div id="top" />
        <Hero>
          <CommunicationLayer />
          <PrivacyFirst />
          <IMessageDrop />
          <IMessageControlPlane />
          <MiniAppStore />
          <ComposableDefinition />
          <ComposableCapabilities />
          <ProductSequence />
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
