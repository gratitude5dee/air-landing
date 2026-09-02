import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/mini-apps.mdx";

export const metadata: Metadata = {
  title: "Mini-apps",
  description: "Small, single-purpose apps Air opens from cards in Messages: boards, to-dos, calendar, inbox, wallet, shop, and more.",
  alternates: { canonical: "https://air.wzrd.tech/docs/mini-apps" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/mini-apps">
      <Content />
    </DocArticle>
  );
}
