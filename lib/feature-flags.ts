// Next.js treats this marker as a build error if the module enters a Client graph.
import "server-only";

export type AirFeatureFlags = Readonly<{
  cinematicEnabled: boolean;
  memoryEchoEnabled: boolean;
}>;

function parseServerFlag(
  name: "AIR_CINEMATIC" | "AIR_MEMORY_ECHO",
  value: string | undefined,
): boolean {
  if (value === undefined || value === "") return false;
  if (value === "true") return true;
  if (value === "false") return false;

  throw new Error(
    `${name} must be unset, empty, "true", or "false"; received an invalid value.`,
  );
}

export function resolveAirFeatureFlags(): AirFeatureFlags {
  return Object.freeze({
    cinematicEnabled: parseServerFlag(
      "AIR_CINEMATIC",
      process.env.AIR_CINEMATIC,
    ),
    memoryEchoEnabled: parseServerFlag(
      "AIR_MEMORY_ECHO",
      process.env.AIR_MEMORY_ECHO,
    ),
  });
}
