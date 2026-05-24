import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { LEGAL_PAGES } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];

  const legalPages: MetadataRoute.Sitemap = LEGAL_PAGES.map((p) => ({
    url: `${SITE_URL}/legal/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.3,
  }));

  return [...staticPages, ...legalPages];
}
