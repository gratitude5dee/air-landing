import type { Metadata } from "next";

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
import { IMessageControlPlane } from "@/components/IMessageControlPlane";
import { MotionEnhancer } from "@/components/MotionEnhancer";
import { AIR_PRODUCT_DESCRIPTION, AIR_TAGLINE } from "@/lib/air-copy";

export const metadata: Metadata = {
  title: "How Air works | Air by WZRD",
  description: "See how Air turns one message into a persistent, reviewable workspace for your work.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How Air works — one request, one composable computer",
    description: AIR_PRODUCT_DESCRIPTION,
    url: "/how-it-works",
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Air",
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Ubuntu",
    url: "https://air.wzrd.tech/how-it-works",
    description: `A ${AIR_TAGLINE.toLowerCase()} ${AIR_PRODUCT_DESCRIPTION}`,
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

export default function HowItWorksPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
      />
      <Header />
      <GradualBlur target="page" position="top" height="3.5rem" strength={0.5} divCount={5} opacity={0.82} zIndex={60} />
      <GradualBlur target="page" position="bottom" height="3.75rem" strength={0.62} divCount={6} opacity={0.84} zIndex={60} />
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
