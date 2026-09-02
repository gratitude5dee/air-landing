import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { adjacentDocPages, docPages, docSections, findDocPage } from "@/content/docs";

const appDir = fileURLToPath(new URL("../app", import.meta.url));
const contentDir = fileURLToPath(new URL("../content/docs", import.meta.url));

describe("public docs registry", () => {
  it("has a route and an MDX body for every registered entry", () => {
    for (const page of docPages) {
      const route = `${appDir}${page.href}/page.tsx`;
      const body = `${contentDir}/${page.file}.mdx`;
      expect(existsSync(route), route).toBe(true);
      expect(existsSync(body), body).toBe(true);
      const source = readFileSync(route, "utf8");
      expect(source).toContain(`<DocArticle href="${page.href}">`);
      expect(source).toContain(`from "@/content/docs/${page.file}.mdx"`);
    }
  });

  it("keeps hrefs unique, under /docs, and in a known section", () => {
    const hrefs = docPages.map((page) => page.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    const sectionIds = new Set(docSections.map((section) => section.id));
    for (const page of docPages) {
      expect(page.href.startsWith("/docs")).toBe(true);
      expect(page.href).toBe(page.slug ? `/docs/${page.slug}` : "/docs");
      expect(sectionIds.has(page.section)).toBe(true);
    }
  });

  it("covers the requested public topics", () => {
    const slugs = docPages.map((page) => page.slug);
    for (const slug of ["getting-started", "imessage", "email", "computer", "mini-apps", "faq"]) {
      expect(slugs).toContain(slug);
    }
  });

  it("resolves lookups and neighbours", () => {
    expect(findDocPage("/docs/")?.slug).toBe("");
    expect(findDocPage("/docs/faq")?.title).toBe("FAQ");
    expect(findDocPage("/docs/nope")).toBeUndefined();
    expect(adjacentDocPages("/docs").previous).toBeUndefined();
    expect(adjacentDocPages("/docs").next?.slug).toBe("getting-started");
    expect(adjacentDocPages("/docs/faq").next).toBeUndefined();
    expect(adjacentDocPages("/docs/nope")).toEqual({});
  });
});
