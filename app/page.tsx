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
import { MotionEnhancer } from "@/components/MotionEnhancer";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Air by WZRD",
    url: "https://air.wzrd.tech",
    description: "Air is a personal, creative, composable AI computer.",
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
      "A personal composable computer with one persistent AI agent, durable workspace, memory, Mini Apps, supported models, and approved app connections.",
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
          <ComposableDefinition />
          <ComposableCapabilities />
          <ProductSequence />
          <MiniAppStore />
          <IMessageDrop />
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
