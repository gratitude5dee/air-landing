export const AIR_AGENT_MARKS = [
  {
    id: "openclaw",
    name: "OpenClaw",
    mark: "OC",
    src: "/images/agents/v2026-08-25-a/openclaw-pixel-lobster.svg",
    shape: "square",
  },
  {
    id: "hermes",
    name: "Hermes",
    mark: "H",
    src: "/images/agents/v2026-08-25-b/hermes.jpeg",
    shape: "portrait",
  },
  {
    id: "pi",
    name: "Pi",
    mark: "π",
    src: "/images/agents/v2026-08-25-b/pi.svg",
    shape: "square",
  },
  {
    id: "codex",
    name: "Codex",
    mark: "CX",
    src: "/images/agents/v2026-08-25-b/codex.png",
    shape: "square",
  },
  {
    id: "claude-code",
    name: "Claude Code",
    mark: "CC",
    src: "/images/agents/v2026-08-25-b/claude-code.png",
    shape: "square",
  },
  {
    id: "prime-intellect",
    name: "Prime Intellect",
    mark: "PI",
    src: "/images/agents/v2026-08-25-b/prime-intellect.png",
    shape: "wide",
  },
  {
    id: "headlong",
    name: "Headlong",
    mark: "HL",
    src: "/images/agents/v2026-08-25-b/headlong.png",
    shape: "wide",
  },
] as const;

export type AirAgentId = (typeof AIR_AGENT_MARKS)[number]["id"];
