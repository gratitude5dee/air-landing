import type { MetadataRoute } from "next";

import { docPages } from "@/content/docs";

const origin = "https://air.wzrd.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  const marketing = ["/", "/how-it-works", "/text-to-film", "/capabilities"].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: "monthly" as const,
    priority: path === "/" ? 1 : 0.8,
  }));

  const docs = docPages.map((page) => ({
    url: `${origin}${page.href}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...marketing, ...docs];
}
