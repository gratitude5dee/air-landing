import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/create.mdx";

export const metadata: Metadata = {
  title: "Air Create",
  description:
    "Build your own Air mini-apps — from a prompt, a file drop, or a GitHub repo — preview them, and publish them to the store.",
  alternates: { canonical: "https://air.wzrd.tech/docs/create" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/create">
      <Content />
    </DocArticle>
  );
}
