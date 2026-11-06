"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ComponentProps, type MouseEvent, useEffect, useRef, useTransition } from "react";
import { still } from "./scroll";

/**
 * A page change, after the film Syed gave (the ::view-transition rules in globals.css): the old page fades out under the thing you
 * pressed, which flies to where it lives on the new page over the blank sheet, and the new page comes up around it in reading order.
 *
 * What flies is marked, not named by the link:
 *   data-fly="stone|screen"  on this page, inside the pressed link or its [data-fly-scope];
 *   data-land-from="/path"   a place that belongs to that page: it flies from here, and lands here coming back;
 *   data-land="stone|screen" where it lands on a page, and, going back from that page, what flies.
 * Nothing on the screen to fly: the pages simply fade. No view transitions in the browser, or reduced motion: a plain link.
 */
const painted = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth && getComputedStyle(el).visibility !== "hidden";
};
const onScreen = (selector: string) => [...document.querySelectorAll<HTMLElement>(selector)].filter(painted);
const area = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width * r.height;
};
const pictureOf = (el: Element) => (el.matches("img") ? (el as HTMLImageElement) : el.querySelector<HTMLImageElement>("img:not(.stamp-shadow)"));
const stoneOf = (el: Element) => pictureOf(el)?.currentSrc.split("/").pop()?.replace(/(-icon|-sm)?\.webp.*$/, "");

// A resting stone may be asleep under its live canvas: for the flight its picture takes over, in the same pose. A snapshot is taken at
// an element's own size, so a stone scaled up (lifted, or on stage) would fly blurred: for the flight it's really that big.
const take = (el: Element) => {
  const li = el.closest<HTMLElement>(".stamp");
  if (!li) return;
  li.setAttribute("data-flying", "");
  const k = "stage" in li.dataset ? parseFloat(li.style.getPropertyValue("--k")) : "lift" in li.dataset ? 1.3 : 1;
  if (k !== 1) li.style.setProperty("--sw", `${(el as HTMLElement).offsetWidth * k}px`);
};
const release = (li: Element) => {
  li.removeAttribute("data-flying");
  (li as HTMLElement).style.removeProperty("--sw");
};

function whatFlies(link: Element | null | undefined, href: string) {
  const scope = link?.closest("[data-fly-scope]") ?? link;
  const inScope = scope ? [...scope.querySelectorAll<HTMLElement>("[data-fly]")] : [];
  const elsewhere = [...document.querySelectorAll<HTMLElement>(`[data-land-from~="${href}"]`)];
  const options = inScope.length ? inScope : elsewhere;
  options.forEach(take);
  const shown = options.filter(painted);
  document.querySelectorAll(".stamp[data-flying]").forEach((s) => {
    if (!shown.some((el) => s.contains(el))) release(s);
  });
  return shown.length ? shown : onScreen('[data-land="stone"]').slice(0, 1);
}

// How the two pictures share the flight: the bigger one is the sharp one, so it shows the whole way; two different stones cross-fade.
// What flies is measured before it goes: by the time it lands, its page has gone.
const look = (from: { size: number; stone?: string }, to: Element) => {
  if (from.stone !== stoneOf(to)) return "swap";
  return from.size < area(to) ? "grow" : "shrink";
};

let settle: (() => void) | null = null;
const settled = () => {
  const run = settle;
  settle = null;
  run?.();
};

/** Done when the page change under way has landed: heavy work that isn't urgent waits for this, so it never runs under a flight. */
let flight: Promise<unknown> = Promise.resolve();
export const landed = () => flight;

export function usePageNav() {
  const router = useRouter();
  const [pending, start] = useTransition();
  // The new page is in: when the navigation settles, or when it takes this link off the screen.
  useEffect(() => {
    if (!pending) settled();
  }, [pending]);
  useEffect(() => settled, []);

  return (href: string, link?: Element | null) => {
    if (!document.startViewTransition || still()) return router.push(href);
    const html = document.documentElement;
    const was = location.pathname;
    const from = whatFlies(link, href);
    const named: HTMLElement[] = [];
    const name = (el: HTMLElement, key: string) => {
      el.style.setProperty("view-transition-name", `fly-${key}`);
      named.push(el);
    };
    const keys = new Map<string, { size: number; stone?: string }>();
    for (const el of from) {
      const key = el.dataset.fly ?? el.dataset.land ?? "stone";
      if (keys.has(key)) continue;
      keys.set(key, { size: area(el), stone: stoneOf(el) });
      name(el, key);
    }
    html.dataset.flown = ""; // from now on a page's entrance waits for the flight
    html.toggleAttribute("data-nav-home", href === "/");
    const vt = document.startViewTransition(
      () =>
        new Promise<void>((resolve) => {
          settle = () => {
            // At the top of the new page before looking for where to land: the router only gets there a moment later.
            scrollTo({ top: 0, behavior: "instant" });
            const landing: Promise<unknown>[] = [];
            for (const [key, from] of keys) {
              const to = (key === "stone" && onScreen(`[data-land-from~="${was}"]`)[0]) || onScreen(`[data-land="${key}"]`)[0];
              if (!to) continue;
              name(to, key);
              if (key === "stone") html.dataset.flyStone = look(from, to);
              const picture = pictureOf(to);
              if (picture) landing.push(picture.decode().catch(() => {}));
            }
            // The stone has to be there to fly, but it never holds the page up for long.
            Promise.race([Promise.all(landing), new Promise((r) => setTimeout(r, 260))]).then(() => resolve());
          };
          setTimeout(settled, 1600); // never hold the old page up for long
          start(() => router.push(href));
        }),
    );
    flight = vt.finished
      .finally(() => {
        named.forEach((el) => el.style.removeProperty("view-transition-name"));
        document.querySelectorAll(".stamp[data-flying]").forEach(release);
        delete html.dataset.flyStone;
      })
      .catch(() => {});
  };
}

/**
 * The browser's own back and forward. Next swaps the page there and then, inside the event, and the browser puts the reader's scroll back, so
 * nothing flies; but the new page comes up out of the sheet instead of cutting in. A phone's swipe back has already animated, so it's left alone.
 * The page's smooth scrolling is off for that moment: with it, the reader's place came back as a long scroll down from the top.
 */
export function BackFade() {
  const path = usePathname();
  const was = useRef(path);
  useEffect(() => {
    was.current = path;
  }, [path]);
  useEffect(() => {
    const pop = (e: PopStateEvent) => {
      if (location.pathname === was.current) return;
      const html = document.documentElement;
      html.style.scrollBehavior = "auto";
      setTimeout(() => html.style.removeProperty("scroll-behavior"), 100);
      if (!still() && !e.hasUAVisualTransition) document.body.animate({ opacity: [0, 1] }, { duration: 260, easing: "ease-out" });
    };
    addEventListener("popstate", pop);
    return () => removeEventListener("popstate", pop);
  }, []);
  return null;
}

export function PageLink({ href, onClick, preload, ...rest }: ComponentProps<typeof Link> & { href: string; preload?: string }) {
  const nav = usePageNav();
  const fetched = useRef(false);
  const ahead = () => {
    if (!preload || fetched.current) return;
    fetched.current = true;
    new Image().src = preload;
  };
  const go = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !document.startViewTransition || still()) return;
    e.preventDefault();
    nav(href, e.currentTarget);
  };
  return <Link href={href} onClick={go} onPointerEnter={ahead} onFocus={ahead} onTouchStart={ahead} {...rest} />;
}
