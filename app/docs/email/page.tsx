import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/email.mdx";

export const metadata: Metadata = docMetadata(
  "/docs/email",
  "Air's own inbox: how mail becomes work in your thread, how drafting works, and why nothing sends without you.",
);

export default function Page() {
  return (
    <DocArticle href="/docs/email">
      <Content />
    </DocArticle>
  );
}
