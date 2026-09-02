import type { Metadata } from "next";

import { DocArticle } from "@/components/DocArticle";
import Content from "@/content/docs/computer.mdx";

export const metadata: Metadata = {
  title: "Computer",
  description: "The private machine behind your Air: what lives on it, how to see it, and how it keeps your work and connections separate from everyone else's.",
  alternates: { canonical: "https://air.wzrd.tech/docs/computer" },
};

export default function Page() {
  return (
    <DocArticle href="/docs/computer">
      <Content />
    </DocArticle>
  );
}
