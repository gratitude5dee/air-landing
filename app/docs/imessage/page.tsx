import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/imessage.mdx";

export const metadata: Metadata = docMetadata(
  "/docs/imessage",
  "How to work with Air in Messages: texting, photos and files, slash commands, cards, and approvals in the thread.",
);

export default function Page() {
  return (
    <DocArticle href="/docs/imessage">
      <Content />
    </DocArticle>
  );
}
