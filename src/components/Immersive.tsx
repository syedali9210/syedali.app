"use client";

import { useEffect, useRef } from "react";
import { clamp01, onScrollFrame, setImmersive, still } from "./scroll";

/**
 * A film or picture that leaves the column. On a landscape screen it grows from the column's width to the whole screen as the page
 * scrolls, holds there, then scrolls away at that size (it never shrinks back while pinned: Syed found the switch back weird; the page
 * returns to the column with the next section). Each frame only reads the page and writes one transform (plus the radius while it moves);
 * the stage's size is set on resize.
 *
 * On a portrait screen a 16:9 film can't fill the screen, so pinning it only left it sliding down an empty stage against the finger. There
 * it stays in the page's flow, edge to edge, and grows out to the edges as it comes up (.film-flow in globals.css): a scroll-driven
 * animation, so it runs on the compositor and keeps up with the finger. Under reduced motion it stays a card.
 */
export function Immersive({ children, aspect }: { children: React.ReactNode; aspect: number }) {
  const runway = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (still()) return;
    const root = document.documentElement;
    const wide = matchMedia("(orientation: landscape)");
    const me = {};
    let vw = 0, vh = 0, W = 0, H = 0, radius = -1, left = 0, width = 0, top = 0, bottom = 0, p = 0;
    let target = 0, cur = -1, raf = 0, then = 0;
    const soft = (t: number) => 0.5 - Math.cos(Math.PI * t) / 2;

    // Writes one transform from the eased amount (cur) and the latest geometry; the radius only while it moves.
    const paint = () => {
      const e = cur;
      const s = width / W + (1 - width / W) * e;
      const tx = (left + width / 2 - vw / 2) * (1 - e);
      // As a card it keeps to the flow: against the top of the stage while it grows.
      const ty = (-(vh - H * s) / 2) * (1 - e);
      media.current!.style.transform = `translate3d(${tx.toFixed(2)}px,${ty.toFixed(2)}px,0) scale(${s.toFixed(4)})`;
      const rad = Math.round(((16 * Math.min(1, (1 - e) * 2.5)) / s) * 2) / 2;
      if (rad !== radius) media.current!.style.borderRadius = `${(radius = rad)}px`;
      setImmersive(me, top < vh * 0.5 && bottom > vh * 0.5 && e > 0.04);
    };
    // The scroll sets the target; the film follows it over time (1 − e^(−7·dt)), so it glides and settles softly.
    const glide = (now: number) => {
      const dt = Math.min(0.05, (now - then) / 1000);
      then = now;
      cur += (target - cur) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - cur) < 0.0008) cur = target;
      paint();
      raf = cur === target ? 0 : requestAnimationFrame(glide);
    };
    // Turned to portrait: nothing of the pinned film stays behind.
    const letGo = () => {
      cancelAnimationFrame(raf);
      raf = vw = vh = 0;
      cur = radius = -1;
      setImmersive(me, false);
      stage.current!.removeAttribute("style");
      media.current!.style.cssText = `aspect-ratio: ${aspect}`;
    };

    const off = onScrollFrame(() => {
      if (!wide.matches) {
        if (vw) letGo();
        return;
      }
      const r = runway.current!.getBoundingClientRect();
      if (root.clientWidth !== vw || innerHeight !== vh) {
        vw = root.clientWidth;
        vh = innerHeight;
        W = vw;
        H = vw / vh >= aspect * 0.75 ? vh : Math.round(vw / aspect);
        stage.current!.style.marginLeft = `${-r.left}px`;
        stage.current!.style.width = `${vw}px`;
        media.current!.style.width = `${W}px`;
        media.current!.style.height = `${H}px`;
      }
      ({ left, width, top, bottom } = r);
      p = clamp01(-r.top / (r.height - vh));
      // Grows over the first 60% of the runway, then holds until the stage scrolls away.
      target = p < 0.6 ? soft(p / 0.6) : 1;
      if (cur < 0) {
        cur = target;
        paint();
      } else if (!raf) {
        then = performance.now();
        raf = requestAnimationFrame(glide);
      }
    });
    return () => {
      off();
      cancelAnimationFrame(raf);
      setImmersive(me, false);
    };
  }, [aspect]);

  return (
    <div ref={runway} data-runway className="film-flow relative motion-safe:landscape:h-[190svh]">
      <div ref={stage} className="motion-safe:landscape:sticky motion-safe:landscape:top-0 motion-safe:landscape:flex motion-safe:landscape:h-svh motion-safe:landscape:items-center motion-safe:landscape:justify-center motion-safe:landscape:overflow-hidden">
        <div
          ref={media}
          style={{ aspectRatio: aspect }}
          className="film-media w-full shrink-0 overflow-hidden bg-black motion-safe:landscape:origin-center motion-safe:landscape:rounded-[var(--radius-sheet)] motion-safe:landscape:will-change-transform"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
