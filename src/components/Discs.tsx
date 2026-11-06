"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Disc } from "./disc-scene";

/**
 * The hero's records (disc-scene.ts): one WebGL canvas, and over each case its link, for the keyboard and screen
 * readers (focused, a case opens; Enter goes to the case study). The pointer is tested in 3D by the scene, which opens
 * the case under it and presses that case's link on a click; on touch the first tap opens a case and the second goes
 * in. The scene starts after the preloader, so the reveal never shares its frames with the GPU warming up.
 */
export function Discs({ discs }: { discs: Disc[] }) {
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const links = useRef<(HTMLAnchorElement | null)[]>([]);
  const scene = useRef<{ focus(i: number): void } | null>(null);

  useEffect(() => {
    let dead = false;
    let stop = () => {};
    const start = async () => {
      const { mount } = await import("./disc-scene");
      if (dead) return;
      try {
        const s = mount(canvas.current!, box.current!, discs, links.current);
        scene.current = s;
        stop = s.destroy;
      } catch {
        box.current?.setAttribute("data-off", ""); // no WebGL: the hero stands on the name alone
      }
    };
    if (document.documentElement.classList.contains("boot")) addEventListener("boot:done", start, { once: true });
    else start();
    return () => {
      dead = true;
      removeEventListener("boot:done", start);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mounted once
  }, []);

  return (
    <div ref={box} className="discs relative size-full">
      <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />
      {discs.map((d, i) => (
        <Link
          key={d.slug}
          ref={(el) => {
            links.current[i] = el;
          }}
          href={`/work/${d.slug}`}
          aria-label={`${d.title}, ${d.kind} ${d.year}: read the case study`}
          data-sound="case"
          className="disc-hit"
          onFocus={() => scene.current?.focus(i)}
          onBlur={() => scene.current?.focus(-1)}
        />
      ))}
    </div>
  );
}
