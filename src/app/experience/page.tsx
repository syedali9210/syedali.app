import type { Metadata } from "next";
import { Experience } from "@/components/Experience";
import { SmoothScroll } from "@/components/SmoothScroll";
import { pageMeta } from "@/content/seo";

export const metadata: Metadata = pageMeta({
  title: "Experience",
  description: "Syed Ali's work so far: a product design internship at Basenine, and two campaign sites for Decathlon India.",
  path: "/experience",
});

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Experience />
    </>
  );
}
