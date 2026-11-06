"use client";

import { useEffect, useRef } from "react";

/**
 * A work card's film (Rachel Chen's cards move): a short silent loop that loads and plays only while the card is on
 * screen, and pauses when it leaves. Under reduced motion it stays on its first frame.
 */
export function Loop({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const el = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = el.current!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Not while the preloader runs: a film decoding under the reveal cost frames.
    let booting = document.documentElement.classList.contains("boot");
    const ready = () => {
      booting = false;
      io.takeRecords();
      io.unobserve(v);
      io.observe(v);
    };
    addEventListener("boot:done", ready, { once: true });
    const io = new IntersectionObserver(
      ([e]) => {
        if (booting) return;
        if (e.isIntersecting) {
          if (!v.src) v.src = src;
          v.play().catch(() => {});
        } else v.pause();
      },
      { threshold: 0.35 },
    );
    io.observe(v);
    return () => {
      io.disconnect();
      removeEventListener("boot:done", ready);
    };
  }, [src]);

  return <video ref={el} poster={poster} muted loop playsInline preload="none" aria-hidden="true" className={className} />;
}
