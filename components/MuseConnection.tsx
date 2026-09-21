import Image from "next/image";

import { VaultReveal } from "@/components/VaultReveal";
import { AIR_AGENT_MARKS } from "@/lib/agent-marks";

import styles from "./MuseConnection.module.css";

const codex = AIR_AGENT_MARKS.find((agent) => agent.id === "codex");
const claude = AIR_AGENT_MARKS.find((agent) => agent.id === "claude-code");

if (!codex || !claude) {
  throw new Error("The Muse connection showcase requires Codex and Claude agent marks.");
}

const agents = [
  { id: "codex", label: "Codex", src: codex.src, className: styles.codex },
  { id: "claude", label: "Claude", src: claude.src, className: styles.claude },
] as const;

export function MuseConnection() {
  return (
    <section className={styles.section} id="muse-connect" aria-labelledby="muse-connect-title">
      <div className={styles.backdrop} aria-hidden="true" />
      <div className={styles.shell}>
        <VaultReveal className={styles.intro}>
          <p className={styles.eyebrow}>AIR / CONNECTIONS</p>
          <h2 id="muse-connect-title">Connect your Air to Muse.</h2>
          <p className={styles.lede}>
            Keep the creative conversation close while the tools you trust move in the same orbit.
          </p>
        </VaultReveal>

        <VaultReveal className={styles.orbitReveal} delay={120}>
          <div
            className={styles.orbit}
            role="img"
            aria-label="Muse connected with Codex, Claude, and Grok Bot"
          >
            <div className={styles.orbitRing} aria-hidden="true" />
            <span className={`${styles.connector} ${styles.connectorCodex}`} aria-hidden="true" />
            <span className={`${styles.connector} ${styles.connectorClaude}`} aria-hidden="true" />
            <span className={`${styles.connector} ${styles.connectorGrok}`} aria-hidden="true" />

            {agents.map((agent) => (
              <span
                className={`${styles.agent} ${agent.className}`}
                data-agent={agent.id}
                key={agent.id}
                role="img"
                aria-label={agent.label}
              >
                <span className={styles.agentMark}>
                  <Image src={agent.src} alt="" width={80} height={80} aria-hidden="true" />
                </span>
                <strong>{agent.label}</strong>
              </span>
            ))}

            <span className={`${styles.agent} ${styles.grok}`} role="img" aria-label="Grok Bot">
              <span className={styles.grokMark} aria-hidden="true">G</span>
              <strong>Grok Bot</strong>
            </span>

            <figure className={styles.museNode}>
              <span className={styles.museImage}>
                <Image
                  src="/images/integrations/muse.png"
                  alt="Muse logo"
                  width={438}
                  height={438}
                />
              </span>
              <figcaption>Muse</figcaption>
            </figure>
          </div>
        </VaultReveal>
      </div>
    </section>
  );
}
