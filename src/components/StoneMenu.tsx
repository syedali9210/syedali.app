"use client";

import { useEffect, useRef, useState } from "react";
import { PLACES } from "@/content/places";
import { Contact } from "./Contact";
import { PageLink } from "./PageLink";
import { onScrollFrame } from "./scroll";
import { SoundToggle } from "./Sound";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The menu on a phone: a small rock in the bottom right corner, in reach of the thumb, that stays there down the page (the desktop has
 * its words instead). Pressed, it knocks and a soft blur opens from the corner, up to a line from the left edge to the top right, behind the
 * places to go and the ways to reach Syed, with the switches along the foot, beside the stone; the page above that line stays sharp. A press anywhere else, or Esc, shuts it. While you read down the page it rolls most of the way off the edge, off the words,
 * still there to press, and it rolls back as you scroll up and at the foot of the page.
 */
export function StoneMenu() {
  const [open, setOpen] = useState(false);
  const stone = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let y = scrollY;
    return onScrollFrame(() => {
      const d = scrollY - y;
      if (Math.abs(d) < 6) return;
      y = scrollY;
      const foot = y + innerHeight > document.documentElement.scrollHeight - 120;
      root.current?.toggleAttribute("data-tuck", d > 0 && y > 80 && !foot);
    });
  }, []);

  // Nothing moves under the blur, so it only has to be worked out while it's arriving.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-hold", open);
    return () => document.documentElement.removeAttribute("data-hold");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      stone.current?.focus({ preventScroll: true });
    };
    addEventListener("keydown", key);
    return () => removeEventListener("keydown", key);
  }, [open]);

  const shut = () => setOpen(false);
  return (
    <div ref={root} className="smenu" data-open={open || undefined}>
      <div className="smenu-blur" aria-hidden="true" />
      <div className="smenu-veil" onClick={shut} aria-hidden="true" />
      <button ref={stone} type="button" data-boot="" className="smenu-stone" aria-label="Menu" aria-expanded={open} aria-controls="smenu-panel" data-stone="piece-menu" onClick={() => setOpen(!open)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- baked with its outline in alpha, shown small */}
        <span className="smenu-bob">
          <img data-land="stone" src="/stamps/piece-menu.webp" alt="" width={216} height={271} decoding="async" draggable={false} />
        </span>
      </button>
      <div id="smenu-panel" className="smenu-panel" inert={!open}>
        <nav aria-label="Main" className="smenu-nav font-serif">
          <a href="#work" onClick={shut}>
            Work
          </a>
          {PLACES.map((p) => (
            <PageLink key={p.href} href={p.href} onClick={shut} preload={`/stamps/${p.stone}.webp`} data-stone={p.stone}>
              {/* eslint-disable-next-line @next/next/no-img-element -- pressed, this flies to its page */}
              <img data-fly="stone" src={`/stamps/${p.stone}-icon.webp`} alt="" width={216} height={271} loading="lazy" decoding="async" draggable={false} />
              {p.word}
            </PageLink>
          ))}
        </nav>
        <Contact className="smenu-contact" linkClass="smenu-out" />
        <div className="smenu-foot">
          <SoundToggle className="hero-toggle" />
          <ThemeToggle plain className="hero-toggle" />
        </div>
      </div>
    </div>
  );
}
