"use client";

import { type CSSProperties, useEffect, useState } from "react";

type Box = { x: number; y: number; w: number; h: number };

/** How long the scaffold waits for the fonts: it's measured where the words land, but a slow font doesn't hold the page up. */
const FONTS = 600;

/**
 * The preloader, after Shahriyar M's: before anything shows, the first screen is drawn as its own scaffold. Dashed
 * hairlines run the full width at the top and foot of every block and the full height at their edges, and each block
 * is outlined; then the content comes into focus out of a blur, top to bottom, and the scaffold fades away. Under
 * two seconds, the content starting to show by half a second. layout.tsx sets html.boot before the first paint on the first
 * full load of the home page in a visit (never under reduced motion); after that the page is simply there. The blocks are the
 * [data-boot] elements on the first screen.
 */
export function Preloader() {
  const [boxes, setBoxes] = useState<Box[] | null>(null);
  const [phase, setPhase] = useState<"draw" | "focus" | "out">("draw");

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("boot")) return;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => timers.push(window.setTimeout(fn, ms));
    const done = () => {
      html.classList.remove("boot", "boot-in");
      setBoxes(null);
      dispatchEvent(new Event("boot:done"));
    };
    let live = true;
    // Measured once the fonts are in, so the scaffold is drawn where the words will land.
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, FONTS))]).then(() => {
      if (!live) return;
      const found: Box[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("[data-boot]")) {
        const r = el.getBoundingClientRect();
        if (r.height > 0 && r.top < innerHeight) found.push({ x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height });
      }
      setBoxes(found);
      later(() => {
        setPhase("focus");
        html.classList.add("boot-in");
        dispatchEvent(new Event("boot:in"));
      }, 480);
      later(() => setPhase("out"), 1200);
      later(done, 1700);
    });
    return () => {
      live = false;
      timers.forEach(clearTimeout);
      done();
    };
  }, []);

  if (!boxes) return null;
  const near = (list: number[], v: number) => list.some((x) => Math.abs(x - v) < 4);
  const across: number[] = [];
  const down: number[] = [];
  for (const b of boxes) {
    for (const y of [b.y, b.y + b.h]) if (!near(across, y)) across.push(y);
    for (const x of [b.x, b.x + b.w]) if (!near(down, x)) down.push(x);
  }
  across.sort((a, b) => a - b);
  down.sort((a, b) => a - b);
  return (
    <div aria-hidden="true" className={`scaffold scaffold-${phase}`}>
      {across.map((y, k) => (
        <span key={`a${k}`} className="scaffold-across" style={{ top: y, "--g": k } as CSSProperties} />
      ))}
      {down.map((x, k) => (
        <span key={`d${k}`} className="scaffold-down" style={{ left: x, "--g": k } as CSSProperties} />
      ))}
      {boxes.map((b, k) => (
        <span key={`b${k}`} className="scaffold-box" style={{ left: b.x, top: b.y, width: b.w, height: b.h, "--g": k } as CSSProperties} />
      ))}
    </div>
  );
}
