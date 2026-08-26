"use client";

import { useDrag } from "@use-gesture/react";
import { Fragment, type CSSProperties, type KeyboardEvent, useRef, useState } from "react";
import { LuBot, LuRefreshCcw, LuSend, LuSparkles } from "react-icons/lu";
import { SiHermes, SiOpencode } from "react-icons/si";

import { ShinyText } from "@/components/ShinyText";

import styles from "./IMessageControlPlane.module.css";

type AgentId = "openclaw" | "hermes" | "pi" | "opencode";
type Point = { x: number; y: number };

const agents = [
  { id: "openclaw", name: "OpenClaw", mark: "OC", Icon: LuBot, description: "Research and browser work", x: "6%", y: "15%", tone: "sky" },
  { id: "hermes", name: "Hermes", mark: "H", Icon: SiHermes, description: "Routing and handoffs", x: "59%", y: "11%", tone: "seafoam" },
  { id: "pi", name: "Pi", mark: "π", Icon: LuSparkles, description: "Long-running context", x: "15%", y: "62%", tone: "blue" },
  { id: "opencode", name: "OpenCode", mark: "</>", Icon: SiOpencode, description: "Code and execution", x: "65%", y: "62%", tone: "ice" },
] as const;

const initialActiveAgent = agents[0];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function IMessageControlPlane() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [activeAgentId, setActiveAgentId] = useState<AgentId>(initialActiveAgent.id);
  const [positions, setPositions] = useState<Partial<Record<AgentId, Point>>>({});

  const resetLayout = () => {
    setPositions({});
    setActiveAgentId(initialActiveAgent.id);
  };

  const nudgeAgent = (id: AgentId, deltaX: number, deltaY: number) => {
    const stage = stageRef.current;
    const agent = stage?.querySelector<HTMLElement>(`[data-agent-id="${id}"]`);
    if (!stage || !agent) return;

    const current = positions[id] ?? { x: agent.offsetLeft, y: agent.offsetTop };
    setPositions((currentPositions) => ({
      ...currentPositions,
      [id]: {
        x: clamp(current.x + deltaX, 0, Math.max(0, stage.clientWidth - agent.offsetWidth)),
        y: clamp(current.y + deltaY, 0, Math.max(0, stage.clientHeight - agent.offsetHeight)),
      },
    }));
  };

  const bindAgentDrag = useDrag(
    ({ args: [id], first, memo, movement: [movementX, movementY] }) => {
      const stage = stageRef.current;
      const agentId = id as AgentId;
      const agent = stage?.querySelector<HTMLElement>(`[data-agent-id="${agentId}"]`);
      if (!stage || !agent) return memo;

      const initial = first || !memo
        ? {
            x: agent.offsetLeft,
            y: agent.offsetTop,
            maxX: Math.max(0, stage.clientWidth - agent.offsetWidth),
            maxY: Math.max(0, stage.clientHeight - agent.offsetHeight),
          }
        : memo;

      setActiveAgentId(agentId);
      setPositions((currentPositions) => ({
        ...currentPositions,
        [agentId]: {
          x: clamp(initial.x + movementX, 0, initial.maxX),
          y: clamp(initial.y + movementY, 0, initial.maxY),
        },
      }));

      return initial;
    },
    { filterTaps: true, threshold: 5, pointer: { keys: false } },
  );

  const onAgentKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: AgentId) => {
    const step = event.shiftKey ? 36 : 16;
    const direction = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    }[event.key];

    if (!direction) return;
    event.preventDefault();
    setActiveAgentId(id);
    nudgeAgent(id, direction[0], direction[1]);
  };

  const activeAgent = agents.find((agent) => agent.id === activeAgentId) ?? initialActiveAgent;

  return (
    <section
      className={`section ${styles.controlSection}`}
      id="agent-control-plane"
      data-air-scene="ink"
      data-air-cloud-progress="0.78"
      data-air-cloud-rays="0.12"
      data-air-cloud-opacity="0.16"
      aria-labelledby="control-plane-title"
    >
      <div className="shell">
        <div className="section-rail">
          <span>Agent orchestration</span>
          <span>iMessage / control plane</span>
        </div>

        <div className={styles.heading} data-reveal>
          <div>
            <p className="eyebrow">One message, a coordinated system</p>
            <h2 id="control-plane-title">
              <ShinyText color="#f7fbfd" shineColor="#bceeff" speed={6.2} spread={114} pauseOnHover>
                a remote control for your managed agent mesh network
              </ShinyText>
            </h2>
          </div>
          <p>
            Give Air a job in the conversation you already use. It can organize the agents and tools
            around it, then bring the work and approval moments back to one thread.
          </p>
        </div>

        <div className={styles.controlGrid} data-reveal>
          <div className={styles.controlSurface}>
            <div className={styles.surfaceChrome} aria-hidden="true">
              <span><i /> iMessage / air control plane</span>
              <span>Drag to arrange</span>
            </div>
            <div className={styles.stage} ref={stageRef} aria-describedby="control-plane-instructions">
              <span className={`${styles.message} ${styles.messageIncoming}`} aria-hidden="true">
                hey air, let&apos;s run a WZRD workflow
              </span>
              <span className={`${styles.message} ${styles.messageOutgoing}`} aria-hidden="true">
                routing the right agents now
              </span>
              <span className={styles.routeLine} aria-hidden="true" />
              <span className={styles.routeLineTwo} aria-hidden="true" />
              <div className={styles.airNode} aria-hidden="true">
                <span><LuSparkles /></span>
                <small>Air</small>
                <strong>approval-aware</strong>
              </div>

              {agents.map(({ id, name, mark, Icon, description, x, y, tone }) => {
                const position = positions[id];
                const toneClass = styles[`tone${tone[0].toUpperCase()}${tone.slice(1)}`];
                return (
                  <Fragment key={id}>
                  <button
                    {...bindAgentDrag(id)}
                    type="button"
                    className={`${styles.agentCard} ${toneClass}`}
                    data-agent-id={id}
                    style={{ "--agent-x": position ? `${position.x}px` : x, "--agent-y": position ? `${position.y}px` : y } as CSSProperties}
                    aria-pressed={activeAgentId === id}
                    aria-label={`${name}: ${description}. Drag to arrange, or use arrow keys to reposition.`}
                    onClick={() => setActiveAgentId(id)}
                    onKeyDown={(event) => onAgentKeyDown(event, id)}
                  >
                    <span className={styles.agentMark} aria-hidden="true">{mark}</span>
                    <span>
                      <strong>{name}</strong>
                      <small>{description}</small>
                    </span>
                    <Icon aria-hidden="true" />
                  </button>
                  </Fragment>
                );
              })}

              <span className={styles.returnedState} aria-hidden="true">
                <LuSend /> Plan ready for your review
              </span>
            </div>
          </div>

          <aside className={styles.controlNotes} aria-label="Control plane details">
            <p className="eyebrow">Orchestrate what you run</p>
            <h3>OpenClaw, Hermes, Pi, OpenCode, and your own agents.</h3>
            <p>
              Arrange the cards to sketch a working team. Each local mark represents an agent you can
              bring into the flow; actual connections and execution vary by environment.
            </p>
            <div className={styles.activeRoute} aria-live="polite">
              <span><i /> Active route</span>
              <strong>{activeAgent.name}</strong>
              <small>{activeAgent.description}</small>
            </div>
            <button className={styles.resetButton} type="button" onClick={resetLayout}>
              <LuRefreshCcw aria-hidden="true" /> Reset layout
            </button>
            <p className={styles.instructions} id="control-plane-instructions">
              Drag any agent card to reposition it. With a card focused, use the arrow keys; hold Shift
              to move farther. This is an illustrative control plane, not a connection status screen.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
