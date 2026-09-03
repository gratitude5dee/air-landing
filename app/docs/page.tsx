import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/overview.mdx";

export const metadata: Metadata = docMetadata(
  "/docs",
  "What Air is, what it is not, and how the pieces fit together.",
);

export default function Page() {
  return (
    <DocArticle href="/docs">
      <Content />
    </DocArticle>
  );
}
