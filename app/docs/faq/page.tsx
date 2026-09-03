import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/faq.mdx";

export const metadata: Metadata = docMetadata(
  "/docs/faq",
  "Common questions about Air: who can talk to it, how approvals work, what it can spend, and what happens to your data.",
);

export default function Page() {
  return (
    <DocArticle href="/docs/faq">
      <Content />
    </DocArticle>
  );
}
