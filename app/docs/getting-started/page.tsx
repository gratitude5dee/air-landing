import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/getting-started.mdx";

export const metadata: Metadata = docMetadata(
  "/docs/getting-started",
  "Set up Air in a few minutes: verify your number, save the contact, send your first text.",
);

export default function Page() {
  return (
    <DocArticle href="/docs/getting-started">
      <Content />
    </DocArticle>
  );
}
