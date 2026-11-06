import type { Metadata } from "next";
import { Experience } from "@/components/Experience";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Experience",
  description: "Syed Ali's work so far: a product design internship at Basenine, and two campaign sites for Decathlon India.",
};

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <Experience />
    </>
  );
}
