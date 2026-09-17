import type { ReactNode } from "react";

import { AirExperience } from "@/components/AirExperience";
import { IMessageComputerDemo } from "@/components/IMessageComputerDemo";
import { resolveAirFeatureFlags } from "@/lib/feature-flags";

export function Hero({ children }: { children?: ReactNode }) {
  const { memoryEchoEnabled } = resolveAirFeatureFlags();

  return (
    <AirExperience
      cinematicEnabled={false}
      memoryEchoEnabled={memoryEchoEnabled}
      phoneDemo={<IMessageComputerDemo />}
    >
      {children}
    </AirExperience>
  );
}
