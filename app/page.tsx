import { Header, Footer } from "@/components/Chrome";
import { Hero } from "@/components/Hero";
import { IntroFilm } from "@/components/IntroFilm";
import { MotionEnhancer } from "@/components/MotionEnhancer";
import { AgentFeatures, ClosingCta, ThreadProof, WorkflowSignals } from "@/components/Sections";

export default function Home() {
  return (
    <>
      <IntroFilm />
      <Header />
      <main id="main">
        <div id="top" />
        <Hero />
        <AgentFeatures />
        <WorkflowSignals />
        <ThreadProof />
        <ClosingCta />
      </main>
      <Footer />
      <MotionEnhancer />
    </>
  );
}
