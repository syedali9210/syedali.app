"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Point at a project's name in the bio and a preview of it floats beside the pointer: it trails the pointer a little
 * and leans with its speed, then drops away when you leave. Any element with data-peek="<picture>" opts in. Only with
 * a fine pointer; on touch the names are plain links.
 */
export function Peek() {
  const card = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = card.current!;
    let x = 0, y = 0, cx = 0, cy = 0, frame = 0, on = false;
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      const t = (e.target as Element).closest<HTMLElement>("[data-peek]");
      if (t && !on) {
        on = true;
        [cx, cy] = [x, y];
        setSrc(`/_next/image?url=${encodeURIComponent(t.dataset.peek!)}&w=640&q=90`);
        el.classList.add("on");
      } else if (!t && on) {
        on = false;
        el.classList.remove("on");
      }
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const draw = () => {
      frame = 0;
      const dx = x - cx;
      // Under reduced motion it sits by the pointer: no trail, no swing.
      cx = still ? x : cx + dx * 0.18;
      cy = still ? y : cy + (y - cy) * 0.18;
      el.style.transform = `translate3d(${cx + 28}px, ${cy - 90}px, 0) rotate(${still ? 0 : Math.max(-8, Math.min(8, dx * 0.08))}deg)`;
      if (Math.abs(dx) > 0.3 || Math.abs(y - cy) > 0.3) frame = requestAnimationFrame(draw);
    };
    addEventListener("pointermove", move, { passive: true });
    return () => {
      removeEventListener("pointermove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={card} aria-hidden="true" className="peek">
      {/* eslint-disable-next-line @next/next/no-img-element -- a hover preview of a picture the page already loads */}
      {src && <img src={src} alt="" className="block size-full object-cover object-top" />}
    </div>
  );
}

/** Bengaluru's time, to the minute: the one live thing in the corner. */
export function Clock() {
  const [now, setNow] = useState("");
  useEffect(() => {
    const f = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const set = () => setNow(f.format(new Date()));
    set();
    const id = setInterval(set, 15000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{now || "--:--"}</span>;
}
