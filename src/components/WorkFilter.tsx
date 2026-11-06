"use client";

import { type ReactNode, useRef, useState } from "react";
import { sift } from "./sift";

/** The work section's head and its list: All, Product or Web, each with its count. Choosing one clears the others away and slides what's left up. */
export function WorkFilter({ title, kinds, children }: { title: ReactNode; kinds: { kind: string; label: string; count: number }[]; children: ReactNode }) {
  const [kind, setKind] = useState(kinds[0].kind);
  const list = useRef<HTMLUListElement>(null);
  const choose = (next: string) => {
    if (next === kind) return;
    setKind(next);
    const rows = [...list.current!.children] as HTMLElement[];
    const shows = (el: HTMLElement) => next === kinds[0].kind || el.dataset.kind === next;
    sift(rows, shows, () => rows.forEach((el) => (el.hidden = !shows(el))));
  };
  return (
    <>
      <header data-reveal className="wk-head">
        {title}
        <div className="wk-filter" role="group" aria-label="Show projects of one kind">
          {kinds.map((k) => (
            <button key={k.kind} type="button" aria-pressed={kind === k.kind} data-sound="switch" onClick={() => choose(k.kind)}>
              {k.label}
              <span>{k.count}</span>
            </button>
          ))}
        </div>
      </header>
      <ul ref={list} className="wk">
        {children}
      </ul>
    </>
  );
}
