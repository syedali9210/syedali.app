"use client";

import { useRef, useState } from "react";

/**
 * Pictures shown one at a time under a pill switch (the case-template film's "Publish from anywhere / Build full-stack
 * apps"). The pictures are stacked in one cell and cross-fade; the lit pill is the page's highlighter colour.
 * Arrow keys move between tabs, as a tab list should.
 */
export function Tabs({ labels, children, contain }: { labels: string[]; children: React.ReactNode[]; contain?: boolean }) {
  const [on, setOn] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    const k = (n + labels.length) % labels.length;
    setOn(k);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[k]?.focus();
  };
  return (
    <div className="flex flex-col items-center gap-text">
      <div className="plate relative aspect-[16/10] w-full overflow-hidden">
        {children.map((child, n) => (
          <div
            key={n}
            role="tabpanel"
            aria-hidden={n !== on}
            className={`tab-pane absolute inset-0 ${contain ? "flex items-center justify-center p-text sm:p-group" : ""}`}
            data-on={n === on || undefined}
          >
            {child}
          </div>
        ))}
      </div>
      <div ref={list} role="tablist" aria-label="Pictures" className="flex max-w-full flex-wrap justify-center gap-label rounded-full bg-surface p-label shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_6px_16px_-10px_rgb(0_0_0/0.3)]">
        {labels.map((label, n) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={n === on}
            tabIndex={n === on ? 0 : -1}
            onClick={() => setOn(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(on + 1);
              if (e.key === "ArrowLeft") go(on - 1);
            }}
            className="tab-pill h-9 rounded-full px-4 text-small text-label transition-[background-color,color] duration-200 hover:text-fg aria-selected:bg-ink aria-selected:text-sheet"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
