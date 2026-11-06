import { still } from "./scroll";

let done = false;

/**
 * The first time the GPU meets a blur or a mask it builds their shaders, and everything on screen waits: the menu's first opening froze
 * for 80 ms, and it's more on a phone. So on a phone it meets them once while nothing's happening, in a corner too small and faint to see.
 * Runs once per visit, after the first screen has finished arriving.
 */
export function warmEffects() {
  if (done || still() || !matchMedia("(max-width: 1023px)").matches) return;
  done = true;
  const go = () => {
    const boxes = [1, 2, 3].map((n) => {
      const box = document.createElement("div");
      box.className = `warm warm-${n}`;
      box.setAttribute("aria-hidden", "true");
      document.body.append(box);
      return box;
    });
    let frames = 0;
    const tick = () => {
      if (++frames < 4) requestAnimationFrame(tick);
      else boxes.forEach((b) => b.remove());
    };
    requestAnimationFrame(tick);
  };
  const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(go, { timeout: 2000 }) : setTimeout(go, 800));
  // The stones' fan is still opening as the first screen finishes arriving (FAN_WAIT and FAN_TIME in Stamps.tsx), and this mustn't stall it.
  if (document.documentElement.classList.contains("boot")) addEventListener("boot:done", () => setTimeout(idle, 700), { once: true });
  else idle();
}
