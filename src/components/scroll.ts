"use client";

/**
 * One rAF-throttled scroll/resize loop for every scroll-linked module (the film, the full-frame sections,
 * the active section, the panels), so they read the page once per frame and never fight over layout.
 */
type Fn = () => void;
const fns = new Set<Fn>();
let frame = 0;
let bound = false;

const run = () => {
  frame = 0;
  fns.forEach((f) => f());
};
export const requestDraw = () => {
  if (!frame) frame = requestAnimationFrame(run);
};

export function onScrollFrame(fn: Fn) {
  if (!bound) {
    bound = true;
    addEventListener("scroll", requestDraw, { passive: true });
    addEventListener("resize", requestDraw);
  }
  fns.add(fn);
  requestDraw();
  return () => void fns.delete(fn);
}

/** The floating panels step aside while anything fills the screen; several things can hold that at once. */
const holders = new Set<object>();
export function setImmersive(who: object, on: boolean) {
  const had = holders.size > 0;
  if (on) holders.add(who);
  else holders.delete(who);
  if (had === holders.size > 0) return;
  const root = document.documentElement;
  if (holders.size) root.setAttribute("data-immersive", "");
  else root.removeAttribute("data-immersive");
}

export const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
