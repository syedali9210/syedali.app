import type { NextConfig } from "next";

const config: NextConfig = {
  // Another package-lock.json sits in the user folder; pin the root to this project.
  turbopack: { root: __dirname },
  // Screenshots are full of small UI text: serve them at quality 90, not the default 75, and up to 4K wide.
  // Optimised copies keep for a week: they only change when a picture is replaced.
  images: { qualities: [90], deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560, 3840], minimumCacheTTL: 604800 },
  // The old site's addresses, for the links to them already out there. Airtribe and Khaata aren't on this site, and their redirect is
  // permanent too: a temporary one tells search engines to keep the old page, which is how AI agents kept describing the old site.
  async redirects() {
    return [
      { source: "/projects/:slug(kodex|uniqkey)", destination: "/work/:slug", permanent: true },
      { source: "/projects/:slug", destination: "/#work", permanent: true },
      { source: "/animations/:path*", destination: "/archive", permanent: true },
    ];
  },
  // public/ is served with max-age=0 by default, so every stone, map and film was asked after again on every load and every return to a page.
  // Good for a day, and for a month after that the old copy shows at once while the new one is fetched behind it, so a re-baked stone still gets through.
  async headers() {
    return [
      {
        source: "/:dir(stamps|archive|animations|case-studies|illustrations|experience)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }],
      },
      // The figures are pages of their own only so the case studies and the archive can frame them: they shouldn't turn up in search alone.
      { source: "/:dir(illustrations|animations)/:file*.html", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
};

export default config;
