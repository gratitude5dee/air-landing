import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/imessage.mdx";

export const metadata: Metadata = {
  title: "iMessage",
  description: "How to work with Air in Messages: texting, photos and files, slash commands, cards, and approvals in the thread.",
  alternates: { canonical: "https://air.wzrd.tech/docs/imessage" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/imessage">
      <Content />
    </DocArticle>
  );
}
