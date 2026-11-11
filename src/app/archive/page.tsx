import type { Metadata } from "next";
import { Archive } from "@/components/Archive";
import { RevealObserver } from "@/components/motion";
import { SmoothScroll } from "@/components/SmoothScroll";
import { sizeOf } from "@/content";
import { ARCHIVE_KINDS, archive } from "@/content/archive";
import { pageMeta } from "@/content/seo";

export const metadata: Metadata = pageMeta({
  title: "Archive",
  description: "Animations, films, sites and products by Syed Ali, each cut in its own stone.",
  path: "/archive",
});

export default function Page() {
  const nodes = archive.map((it) => {
    const { width, height } = sizeOf(it.picture);
    return { ...it, w: width, h: height };
  });
  return (
    <>
      <RevealObserver />
      <SmoothScroll />
      <Archive items={nodes} kinds={ARCHIVE_KINDS.filter((k) => nodes.some((n) => n.kind === k.kind))} />
    </>
  );
}
