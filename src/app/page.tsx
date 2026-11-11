import type { Metadata } from "next";
import { Home as Front } from "@/components/Home";
import { RevealObserver } from "@/components/motion";
import { SmoothScroll } from "@/components/SmoothScroll";
import { pageMeta } from "@/content/seo";

export const metadata: Metadata = pageMeta({
  description: "Syed Ali designs products and builds them in code. Case studies: Trace, Animation Engine, KIPRUN, Kodex, Uniqkey and Anime Sports League.",
  path: "/",
});

export default function Home() {
  return (
    <>
      <RevealObserver />
      <SmoothScroll />
      <Front />
    </>
  );
}
