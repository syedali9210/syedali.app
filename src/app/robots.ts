import type { MetadataRoute } from "next";
import { SITE } from "@/content/seo";

/** /robots.txt: every crawler is welcome, search engines and AI agents alike, since the portfolio is there to be read. The sitemap lists every page. */
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE}/sitemap.xml` };
}
