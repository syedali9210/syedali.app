"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __smoothTo?: (y: number) => void;
  }
}

/**
 * Smooth scrolling for every page: the wheel, the keys (arrows, Page Up/Down, Space, Home, End) and links to a place on
 * the page all set a target, and the window's own scroll eases to it (1 − e^(−7·dt), the glide Lenis uses), so sticky,
 * anchors and find-in-page keep working. Touch keeps the phone's own physics; the scrollbar isn't touched (the loop lets
 * go the moment something else moves the page). Typing, tab lists and dialogs keep their keys. Off under reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let target = scrollY, current = scrollY, ours = scrollY, raf = 0, last = 0;
    const max = () => document.documentElement.scrollHeight - innerHeight;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      target = current = ours = scrollY;
    };
    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      // Something else moved the page (the scrollbar, a jump made in code): follow it and let go.
      if (Math.abs(scrollY - ours) > 2) return stop();
      current += (target - current) * (1 - Math.exp(-dt * 7));
      if (Math.abs(target - current) < 0.4) current = target;
      window.scrollTo({ top: current, behavior: "instant" });
      ours = scrollY;
      raf = current === target ? 0 : requestAnimationFrame(tick);
    };
    const go = (to: number) => {
      if (!raf) {
        target = current = ours = scrollY;
        last = performance.now();
      }
      target = Math.max(0, Math.min(max(), to));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const scrollsInside = (el: Element | null) => {
      for (; el && el !== document.body; el = el.parentElement) {
        if (el.scrollHeight <= el.clientHeight + 1) continue;
        if (/(auto|scroll)/.test(getComputedStyle(el).overflowY)) return true;
      }
      return false;
    };
    const busy = () => reduce.matches || !!document.querySelector("dialog[open], [role='dialog']");

    const onWheel = (e: WheelEvent) => {
      if (busy() || e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (scrollsInside(e.target as Element)) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 40 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      go((raf ? target : scrollY) + d);
    };

    const onKey = (e: KeyboardEvent) => {
      if (busy() || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
      const el = e.target as HTMLElement;
      if (el.closest("input, textarea, select, [contenteditable], [role='tablist'], [role='slider'], [role='listbox'], [role='menu']")) return;
      // Space on a button or a link presses it, as it should.
      if (e.key === " " && el.closest("button, a, summary")) return;
      const page = innerHeight * 0.88, from = raf ? target : scrollY;
      const to =
        e.key === "ArrowDown" ? from + 90 : e.key === "ArrowUp" ? from - 90
        : e.key === "PageDown" || (e.key === " " && !e.shiftKey) ? from + page
        : e.key === "PageUp" || (e.key === " " && e.shiftKey) ? from - page
        : e.key === "Home" ? 0 : e.key === "End" ? max() : null;
      if (to === null) return;
      e.preventDefault();
      go(to);
    };

    // A link to a place on this page glides there, landing where the browser would (its scroll padding and margin).
    const onClick = (e: MouseEvent) => {
      if (busy() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href*='#']");
      if (!a || a.origin !== location.origin || a.pathname !== location.pathname || !a.hash) return;
      const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
      if (!el) return;
      e.preventDefault();
      const pad = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
      go(el.getBoundingClientRect().top + scrollY - pad - margin);
      history.pushState(history.state, "", a.hash);
    };

    addEventListener("wheel", onWheel, { passive: false });
    addEventListener("keydown", onKey);
    addEventListener("click", onClick);
    window.__smoothTo = (y) => (busy() ? scrollTo({ top: y, behavior: "instant" }) : go(y));
    return () => {
      removeEventListener("wheel", onWheel);
      removeEventListener("keydown", onKey);
      removeEventListener("click", onClick);
      stop();
      delete window.__smoothTo;
    };
  }, []);
  return null;
}
