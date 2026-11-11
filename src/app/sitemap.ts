import type { MetadataRoute } from "next";
import { caseStudies } from "@/content";
import { SITE } from "@/content/seo";

/**
 * /sitemap.xml: every page, so search engines find the new ones without waiting to stumble on them. A case study lists its cover too.
 * ponytail: lastModified is the build's time, so every deploy says every page changed; give pages their own dates if search engines
 * start ignoring it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const at = new Date();
  const page = (path: string, priority: number, images?: string[]) => ({ url: `${SITE}${path}`, lastModified: at, changeFrequency: "monthly" as const, priority, ...(images && { images }) });
  return [
    page("/", 1),
    ...caseStudies.map((c) => page(`/work/${c.slug}`, 0.8, [`${SITE}${c.cover.src}`])),
    page("/experience", 0.6),
    page("/about", 0.6),
    page("/archive", 0.5),
  ];
}
