"use client";

import { useEffect, useRef } from "react";
import { clamp01, onScrollFrame, still } from "./scroll";

/**
 * The colour passage into the work, after Abhijit Rout's "to-black transition": a bell of colour (lavender, pink, coral, orange, then white
 * at its core; on the dark theme his ember and ink). The bell is one small baked picture (scripts/stamps/soft.py), so showing it costs
 * nothing. `after` is the same bell upside down, leading back out to the page, and only scrolls.
 *
 * It unrolls down from its top edge as you scroll. His is an image turned with rotateX from edge-on (89°) to flat with no perspective,
 * which is a vertical scale by cos θ; measured on his page the bell is 0.48, 0.68 and 0.94 of its height after 0.5, 0.75 and 1.3 screens,
 * so the scale eases out the same way. That's a scroll-driven animation (`.dome` in globals.css): on the compositor, so on a phone it stays
 * with the finger. Where a browser hasn't got those, the script below does it from 1024 px; a phone there simply sees the bell.
 */
export function Dome({ after = false }: { after?: boolean }) {
  const band = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const foot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (after || still() || CSS.supports("animation-timeline: view()")) return;
    const narrow = matchMedia("(max-width: 1023px)");
    let last = -1;
    return onScrollFrame(() => {
      if (narrow.matches) return;
      const r = band.current!.getBoundingClientRect();
      const vh = innerHeight;
      if (r.top > vh || r.bottom < -vh) return;
      const p = clamp01((vh - r.top - 0.2 * vh) / (1.4 * vh));
      const s = Math.max(0.012, 1 - (1 - p) ** 2.2);
      const k = Math.round(s * 1000) / 1000;
      if (k === last) return;
      last = k;
      body.current!.style.transform = k >= 1 ? "none" : `scaleY(${k})`;
      body.current!.style.visibility = k <= 0.012 ? "hidden" : ""; // not yet unrolling: edge-on it would only be a thin line sitting on the page
      // Its foot fades into the page while it's still unrolling. By 70% it's over the band's own colour and has no edge.
      foot.current!.style.transform = `translate3d(0, ${(k * r.height).toFixed(1)}px, 0)`;
      foot.current!.style.visibility = k > 0.012 && k < 0.7 ? "visible" : "hidden";
    });
  }, [after]);

  return (
    <div ref={band} aria-hidden="true" className={`dome ${after ? "dome-after" : ""}`}>
      <div ref={body} className="dome-body" />
      {!after && <div ref={foot} className="dome-foot" />}
    </div>
  );
}
