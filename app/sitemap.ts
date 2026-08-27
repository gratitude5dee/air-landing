import type { MetadataRoute } from "next";

const baseUrl = "https://air.wzrd.tech";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/how-it-works`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/composable-computer`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/capabilities`, changeFrequency: "monthly", priority: 0.8 },
  ];
}
