import type { Metadata } from "next";
import { About } from "@/components/About";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ld, pageMeta, profileLd } from "@/content/seo";

export const metadata: Metadata = pageMeta({
  title: "About",
  description: "Syed Ali designs products and builds them too: the motion, the states, the last pixel.",
  path: "/about",
});

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld(profileLd) }} />
      <SmoothScroll />
      <About />
    </>
  );
}
