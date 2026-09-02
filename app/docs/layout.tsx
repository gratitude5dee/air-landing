import type { Metadata } from "next";
import type { ReactNode } from "react";

import { DocsShell } from "@/components/DocsShell";

export const metadata: Metadata = {
  title: {
    template: "%s — Air docs",
    default: "Air docs",
  },
  description:
    "How to use Air: getting started, texting your agent over iMessage, its email inbox and computer, mini-apps, and answers to common questions.",
};

export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
