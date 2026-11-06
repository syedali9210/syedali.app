"use client";

import { type KeyboardEvent, type MouseEvent, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PetBuddyTabHop from "./PetBuddyTabHop";
import { spring } from "./springs";

const TABS = ["Home", "Projects", "Archive"];
const SEMIBOLD = { fontWeight: 550 };

type Rect = { left: number; top: number; width: number; height: number };

/**
 * A row of tabs with the mascot perched on the selected one. A selected pill and a fainter hover pill slide between them; the hover pill
 * follows whichever tab is nearest the pointer, so it never drops out in the gaps. Switch tabs and the mascot leaps across (PetBuddyTabHop).
 */
export default function TabHop() {
  const [selected, setSelected] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [rects, setRects] = useState<Rect[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  // offset*, so a scale on anything above doesn't change them, and they're in the list's own space, as its absolute children are.
  useLayoutEffect(() => {
    const measure = () => setRects(tabs.current.map((t) => ({ left: t!.offsetLeft, top: t!.offsetTop, width: t!.offsetWidth, height: t!.offsetHeight })));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list.current!);
    document.fonts.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  const nearest = (e: MouseEvent) => {
    const middle = (t: HTMLElement) => t.getBoundingClientRect().left + t.getBoundingClientRect().width / 2;
    const off = tabs.current.map((t) => Math.abs(e.clientX - middle(t!)));
    setHovered(off.indexOf(Math.min(...off)));
  };

  // The arrow keys move and select at once, as a tab list should.
  const keys = (e: KeyboardEvent) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (selected + step + TABS.length) % TABS.length;
    setSelected(next);
    tabs.current[next]?.focus();
  };

  const on = rects[selected] as Rect | undefined, near = hovered === null ? undefined : rects[hovered];
  return (
    <div className="flex min-h-[220px] w-full items-center justify-center">
      <div ref={list} role="tablist" aria-label="Pages" onMouseMove={nearest} onMouseLeave={() => setHovered(null)} onKeyDown={keys} className="relative inline-flex items-center gap-0.5 rounded-3xl bg-card p-1 select-none">
        {on && (
          <motion.div
            className="pointer-events-none absolute rounded-[20px] bg-surface shadow-[var(--media-shadow)]"
            initial={false}
            animate={{ ...on, opacity: hovered !== null && hovered !== selected ? 0.85 : 1 }}
            transition={{ ...spring.moderate, opacity: { duration: 0.08 } }}
          />
        )}
        <AnimatePresence>
          {on && near && hovered !== selected && (
            <motion.div
              className="pointer-events-none absolute rounded-[20px] bg-surface"
              initial={{ ...on, opacity: 0 }}
              animate={{ ...near, opacity: 0.4 }}
              exit={{ opacity: 0, transition: spring.fast.exit }}
              transition={{ ...spring.fast, opacity: { duration: 0.08 } }}
            />
          )}
        </AnimatePresence>
        {on && <PetBuddyTabHop rect={on} />}
        {TABS.map((label, i) => (
          <button
            key={label}
            ref={(el) => void (tabs.current[i] = el)}
            type="button"
            role="tab"
            aria-selected={i === selected}
            tabIndex={i === selected ? 0 : -1}
            onClick={() => setSelected(i)}
            className="relative z-10 flex h-8 cursor-pointer items-center gap-2 rounded-[20px] px-3"
          >
            {/* A hidden copy in the selected weight, so a tab stays the same width whichever is picked. */}
            <span className="inline-grid text-[13px] whitespace-nowrap">
              <span className="invisible col-start-1 row-start-1" style={SEMIBOLD} aria-hidden="true">
                {label}
              </span>
              <span className={`col-start-1 row-start-1 transition-colors duration-100 ${i === selected || i === hovered ? "text-ink" : "text-label"}`} style={i === selected ? SEMIBOLD : undefined}>
                {label}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
