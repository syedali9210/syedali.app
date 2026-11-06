import type { NextConfig } from "next";

const config: NextConfig = {
  // Another package-lock.json sits in the user folder; pin the root to this project.
  turbopack: { root: __dirname },
  // Screenshots are full of small UI text: serve them at quality 90, not the default 75, and up to 4K wide.
  // Optimised copies keep for a week: they only change when a picture is replaced.
  images: { qualities: [90], deviceSizes: [640, 828, 1080, 1280, 1600, 1920, 2560, 3840], minimumCacheTTL: 604800 },
  // public/ is served with max-age=0 by default, so every stone, map and film was asked after again on every load and every return to a page.
  // Good for a day, and for a month after that the old copy shows at once while the new one is fetched behind it, so a re-baked stone still gets through.
  async headers() {
    return [
      {
        source: "/:dir(stamps|archive|animations|case-studies|illustrations|experience)/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=2592000" }],
      },
    ];
  },
};

export default config;
