import type { ReactNode } from "react";

import { AirExperience } from "@/components/AirExperience";
import { IMessageComputerDemo } from "@/components/IMessageComputerDemo";
import { resolveAirFeatureFlags } from "@/lib/feature-flags";

export function Hero({ children }: { children?: ReactNode }) {
  const { cinematicEnabled, memoryEchoEnabled } = resolveAirFeatureFlags();

  return (
    <AirExperience
      cinematicEnabled={cinematicEnabled}
      memoryEchoEnabled={memoryEchoEnabled}
      phoneDemo={<IMessageComputerDemo />}
    >
      {children}
    </AirExperience>
  );
}
