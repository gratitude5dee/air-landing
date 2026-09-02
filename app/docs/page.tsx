import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/overview.mdx";

export const metadata: Metadata = {
  title: "Overview",
  description: "What Air is, what it is not, and how the pieces fit together.",
  alternates: { canonical: "https://air.wzrd.tech/docs" },
};

export default function Page() {
  return (
    <DocArticle href="/docs">
      <Content />
    </DocArticle>
  );
}
