import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/computer.mdx";

export const metadata: Metadata = docMetadata(
  "/docs/computer",
  "The private machine behind your Air: what lives on it, how to see it, and how it keeps your work and connections separate from everyone else's.",
);

export default function Page() {
  return (
    <DocArticle href="/docs/computer">
      <Content />
    </DocArticle>
  );
}
