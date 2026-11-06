import { still } from "./scroll";

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

/**
 * A list changing what it shows: what's going clears away, what's left slides to its new place, and what's coming back rises in.
 * `apply` makes the change (hides and shows the items). A long list slides a screen at most, so nothing streaks past.
 */
export async function sift(items: HTMLElement[], shows: (el: HTMLElement) => boolean, apply: () => void) {
  if (still() || !items[0]?.animate) return apply();
  await Promise.all(
    items.filter((el) => !el.hidden && !shows(el)).map((el) => el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.96)" }], { duration: 170, easing: "ease-out", fill: "forwards" }).finished),
  ).catch(() => {});
  const first = new Map(items.filter((el) => !el.hidden).map((el) => [el, el.getBoundingClientRect()]));
  apply();
  items.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
  const far = innerHeight;
  items
    .filter((el) => !el.hidden)
    .forEach((el, i) => {
      const was = first.get(el), r = el.getBoundingClientRect();
      if (was) el.animate([{ transform: `translate(${was.left - r.left}px, ${Math.max(-far, Math.min(far, was.top - r.top))}px)` }, { transform: "none" }], { duration: 560, easing: EASE });
      else el.animate([{ opacity: 0, transform: "translateY(18px) scale(.97)" }, { opacity: 1, transform: "none" }], { duration: 480, delay: i * 28, easing: EASE, fill: "backwards" });
    });
}
