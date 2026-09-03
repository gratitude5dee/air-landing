import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import { docMetadata } from "@/content/docs";
import Content from "@/content/docs/mini-apps.mdx";

export const metadata: Metadata = docMetadata(
  "/docs/mini-apps",
  "Small, single-purpose apps Air opens from cards in Messages: boards, to-dos, calendar, inbox, wallet, shop, and more.",
);

export default function Page() {
  return (
    <DocArticle href="/docs/mini-apps">
      <Content />
    </DocArticle>
  );
}
