"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { onScrollFrame } from "./scroll";

/** Marks every [data-reveal] with data-in the first time it scrolls into view. The CSS in globals.css does the moving. */
export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.setAttribute("data-in", ""));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-in", "");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

/** The id of the last of `ids` whose top has passed 35% of the viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join(" ");
  useEffect(() => {
    const els = key
      .split(" ")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => !!el)
      .sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    return onScrollFrame(() => {
      const line = window.innerHeight * 0.35;
      let current = els[0]?.id;
      // A section the quick overview hides has no box, so it never counts as passed.
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.height && r.top <= line) current = el.id;
      }
      // At the foot of the page the last sections can't reach the line: the last one on screen wins.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2)
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.height && r.top < window.innerHeight) current = el.id;
        }
      setActive(current);
    });
  }, [key]);
  return active;
}
