import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/email.mdx";

export const metadata: Metadata = {
  title: "Email",
  description: "Air's own inbox: how mail becomes work in your thread, how drafting works, and why nothing sends without you.",
  alternates: { canonical: "https://air.wzrd.tech/docs/email" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/email">
      <Content />
    </DocArticle>
  );
}
