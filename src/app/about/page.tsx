import type { Metadata } from "next";
import { About } from "@/components/About";
import { SmoothScroll } from "@/components/SmoothScroll";

export const metadata: Metadata = {
  title: "About",
  description: "Syed Ali designs products and builds them too: the motion, the states, the last pixel.",
};

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <About />
    </>
  );
}
