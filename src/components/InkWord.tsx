"use client";

import { useEffect, useRef } from "react";

// One word bleeds at a time; a newer hover finishes the older one at once.
let running: { finish: () => void } | null = null;

/**
 * A menu word that changes face through an ink bleed: under the pointer the letters smear (the #ink-swap filter's
 * displacement swells and settles over 320 ms) and, at the peak, roman turns italic; leaving runs it back (Bill Guo's
 * menu does this with an eroding variable font). Under reduced motion it just changes face.
 */
export function InkWord({ text }: { text: string }) {
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const word = el.current!;
    const host = (word.closest("a, button") as HTMLElement | null) ?? word;
    const map = document.getElementById("ink-swap-map");
    let raf = 0;

    const run = (italic: boolean) => {
      running?.finish();
      if (!map || matchMedia("(prefers-reduced-motion: reduce)").matches) return void word.classList.toggle("ink-on", italic);
      const t0 = performance.now();
      let swapped = false;
      const finish = () => {
        cancelAnimationFrame(raf);
        word.classList.toggle("ink-on", italic);
        word.style.filter = "";
        map.setAttribute("scale", "0");
        if (running === job) running = null;
      };
      const job = { finish };
      running = job;
      word.style.filter = "url(#ink-swap)";
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / 320);
        map.setAttribute("scale", (Math.sin(Math.PI * t) * 7).toFixed(2));
        if (!swapped && t >= 0.5) {
          swapped = true;
          word.classList.toggle("ink-on", italic);
        }
        if (t < 1) raf = requestAnimationFrame(tick);
        else finish();
      };
      raf = requestAnimationFrame(tick);
    };

    const over = () => run(true);
    const out = () => run(false);
    host.addEventListener("pointerenter", over);
    host.addEventListener("pointerleave", out);
    host.addEventListener("focusin", over);
    host.addEventListener("focusout", out);
    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointerenter", over);
      host.removeEventListener("pointerleave", out);
      host.removeEventListener("focusin", over);
      host.removeEventListener("focusout", out);
    };
  }, []);

  return (
    <span ref={el} className="ink-word">
      {text}
    </span>
  );
}
