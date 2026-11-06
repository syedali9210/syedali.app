"use client";

import { useEffect, useRef } from "react";

/**
 * The pointer drawn in the page's accent (as on Shahriyar's and Rachel's sites): a text caret over words, a small
 * square over anything you can press, and a square with a label over anything that names itself (data-cursor).
 * It sits exactly on the pointer, no lag. Fine pointers only, on the front page and the archive; leaving the window, or
 * entering a frame, hides it.
 */
export function Cursor() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const html = document.documentElement;
    const c = el.current!;
    const label = c.querySelector<HTMLElement>(".cur-label")!;
    html.classList.add("own-cursor");
    let x = 0, y = 0, raf = 0;

    const isWords = (t: Element) => [...t.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim().length > 0);
    const read = (t: Element) => {
      const named = t.closest<HTMLElement>("[data-cursor]");
      const live = t.closest("a, button, label, summary, [role='button'], video");
      if (t.closest("iframe")) c.dataset.mode = "hidden";
      else if (named) {
        c.dataset.mode = "label";
        label.textContent = named.dataset.cursor!;
      } else c.dataset.mode = live ? "press" : isWords(t) ? "text" : "press";
    };
    const move = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      read(e.target as Element);
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
    };
    const hide = (e: PointerEvent) => {
      if (!e.relatedTarget) c.dataset.mode = "hidden";
    };
    // A press can open or move something under a pointer that hasn't moved: don't leave the old label on it.
    const pressed = () => {
      requestAnimationFrame(() => {
        const t = document.elementFromPoint(x, y);
        if (t) read(t);
      });
    };
    addEventListener("pointermove", move, { passive: true });
    addEventListener("click", pressed, { passive: true });
    document.addEventListener("pointerout", hide);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", move);
      removeEventListener("click", pressed);
      document.removeEventListener("pointerout", hide);
      html.classList.remove("own-cursor");
    };
  }, []);

  return (
    <div ref={el} className="cursor" data-mode="hidden" aria-hidden="true">
      <span className="cur-mark" />
      <span className="cur-label" />
    </div>
  );
}
