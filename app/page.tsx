import { Header, Footer } from "@/components/Chrome";
import { Hero } from "@/components/Hero";
import { IntroFilm } from "@/components/IntroFilm";
import { MotionEnhancer } from "@/components/MotionEnhancer";
import { AgentFeatures, AirFaq, ClosingCta, ThreadProof, WorkflowSignals } from "@/components/Sections";
import { TextToFilm } from "@/components/TextToFilm";

export default function Home() {
  return (
    <>
      <IntroFilm />
      <Header />
      <main id="main">
        <div id="top" />
        <Hero>
          <AgentFeatures />
          <TextToFilm />
          <WorkflowSignals />
          <ThreadProof />
          <AirFaq />
          <ClosingCta />
        </Hero>
      </main>
      <Footer />
      <MotionEnhancer />
    </>
  );
}
