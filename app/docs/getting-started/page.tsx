import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/getting-started.mdx";

export const metadata: Metadata = {
  title: "Getting started",
  description: "Set up Air in a few minutes: verify your number, save the contact, send your first text.",
  alternates: { canonical: "https://air.wzrd.tech/docs/getting-started" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/getting-started">
      <Content />
    </DocArticle>
  );
}
