import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/faq.mdx";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Common questions about Air: who can talk to it, how approvals work, what it can spend, and what happens to your data.",
  alternates: { canonical: "https://air.wzrd.tech/docs/faq" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/faq">
      <Content />
    </DocArticle>
  );
}
