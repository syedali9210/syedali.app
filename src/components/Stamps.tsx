"use client";

import { type CSSProperties, type RefObject, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { landed, PageLink } from "./PageLink";
import { onScrollFrame, still } from "./scroll";
import { hammer } from "./Sound";
import { warmEffects } from "./warm";

export type StampItem = { slug: string; title: string; kind: string; year: string; summary: string; who?: string };

/**
 * Where each stamp lies, as Bill Guo's are scattered: a pile of three, one off the right edge, two low down.
 * x, y: its centre, % of the first screen. rot: its turn. z: which lies on which.
 * mx, my, mrot: on a phone, an arc up from the left, fanned about a point below it: its centre as fractions of the frame's width, from the field's top.
 * rx, rr: where it sits and how it's turned when they're lined up in a row.
 */
const LAY: Record<string, { x: number; y: number; rot: number; z: number; mx: number; my: number; mrot: number; mz: number; rx: number; rr: number }> = {
  "animation-engine": { x: 51.5, y: 57.3, rot: -16, z: 6, mx: 0.199, my: 0.326, mrot: -54, mz: 8, rx: 0.277, rr: 3 },
  trace: { x: 61.2, y: 52.6, rot: 14, z: 7, mx: 0.15, my: 0.413, mrot: -68, mz: 9, rx: 0.576, rr: 4.5 },
  kiprun: { x: 47.6, y: 70.6, rot: -38, z: 4, mx: 0.449, my: 0.169, mrot: -10, mz: 5, rx: 0.145, rr: -11.5 },
  "anime-sports-league": { x: 93.6, y: 52, rot: -24, z: 4, mx: 0.549, my: 0.164, mrot: 4, mz: 4, rx: 0.863, rr: -4.5 },
  kodex: { x: 72, y: 86, rot: -14, z: 6, mx: 0.268, my: 0.253, mrot: -39, mz: 7, rx: 0.709, rr: 14 },
  uniqkey: { x: 64.5, y: 92.5, rot: 6, z: 5, mx: 0.353, my: 0.2, mrot: -25, mz: 6, rx: 0.43, rr: -5 },
};

const LIFT = 1.3, STRAIGHTEN = 0.38;

/** The little pair of stamps at the top of the first screen: lines them all up in a row, and back. */
export function StampTrigger() {
  return (
    <button type="button" className="stamp-trigger" aria-label="Line up the stamps" data-sound="deal" onClick={() => dispatchEvent(new Event("stamps:row"))}>
      {/* eslint-disable-next-line @next/next/no-img-element -- two tiny stamps */}
      <img src="/stamps/trace-sm.webp" alt="" width={24} height={30} draggable={false} />
      {/* eslint-disable-next-line @next/next/no-img-element -- two tiny stamps */}
      <img src="/stamps/kiprun-sm.webp" alt="" width={24} height={30} draggable={false} />
    </button>
  );
}

export type Stones = { frozen: boolean; clear(): void; wake(li: HTMLElement): void; post(li: HTMLElement, m: object): void; rotOf(li: HTMLElement): number; smash(li: HTMLElement, x: number, y: number): void };

/** Two workers, because Chromium keeps only four WebGL contexts alive per thread and silently drops the oldest. */
const ROOM = 8;

/**
 * A stone's GL outlives its page. Building one means five maps to fetch and decode, a context and its shaders; doing that for every stone on every
 * return to a page was the stutter after a flight. So the workers stay, and a stone leaving the page is parked, small and drawing nothing, until
 * a page showing the same stone wants it back. The longest parked make room first.
 */
type Held = { id: number; on: number; canvas: HTMLCanvasElement };
const workers: Worker[] = [];
const load = [0, 0];
const parked = new Map<string, Held>(); // by stone, oldest first
let nextId = 1;
const drop = (h: Held) => {
  workers[h.on].postMessage({ type: "drop", id: h.id });
  load[h.on]--;
  h.canvas.remove();
};

/** On a slow or metered connection a stone's maps, a megabyte each, only load once it's pointed at. */
const thrifty = () => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !!c?.saveData || /2g|3g/.test(c?.effectiveType ?? "");
};

/**
 * Every .stamp inside `host` comes alive: at rest a picture, pointed at it lifts off the page on its own canvas and is hammered
 * (stamp.worker.ts), and each blow plays the next note of its tune. The hover is tested here against where the lifted stone really is, so it never flickers
 * as it moves under the pointer. On a keyboard, focus lifts it. Under reduced motion, or without a worker's WebGL, they stay pictures.
 * ahead: how many to set up once the page has landed and is idle, one at a time so the GPU never takes them all at once (or a function saying how many then); the rest wake as they're pointed at, the oldest going back to sleep to make room.
 * twoTap: a finger's first tap lifts and the second goes in. hoverOnly: nothing to lift on a touch screen, so no GL there at all.
 * push: the others make room as one lifts, which only suits a few. rise: how far it lifts up, of its height, off what's under it.
 */
export function useStones(host: RefObject<HTMLElement | null>, { ahead = Infinity as number | (() => number), twoTap = true, hoverOnly = false, push = true, rise = 0 } = {}) {
  const api = useRef<Stones | null>(null);

  useEffect(() => {
    const root = host.current!;
    const lis = [...root.querySelectorAll<HTMLElement>(".stamp")];
    const canGL = !still() && "transferControlToOffscreen" in HTMLCanvasElement.prototype && (!hoverOnly || matchMedia("(hover: hover) and (pointer: fine)").matches);
    if (!canGL) root.dataset.flat = "";
    const live = new Map<HTMLElement, Held>();
    const byId = new Map<number, HTMLElement>();
    const order: HTMLElement[] = []; // awake, oldest first
    let current: HTMLElement | null = null;
    let touch = false, px = -1e4, py = -1e4;
    const post = (li: HTMLElement, m: object) => {
      const w = live.get(li);
      if (w) workers[w.on]?.postMessage({ ...m, id: w.id });
    };
    const sizeOf = (li: HTMLElement) => {
      const a = li.querySelector<HTMLElement>(".stamp-link")!;
      return { w: a.offsetWidth, h: a.offsetHeight };
    };
    const rotOf = (li: HTMLElement) => parseFloat(getComputedStyle(li).getPropertyValue("--rot-now")) || 0;
    const centre = (li: HTMLElement) => {
      const r = li.getBoundingClientRect();
      return { x: r.left, y: r.top };
    };

    const sleep = (li: HTMLElement) => {
      const w = live.get(li);
      if (!w) return;
      drop(w);
      byId.delete(w.id);
      live.delete(li);
      order.splice(order.indexOf(li), 1);
      delete li.dataset.gl;
    };
    // urgent: it's being pointed at, so its maps go ahead of anything else loading.
    const wake = (li: HTMLElement, urgent = true) => {
      if (!workers.length || live.has(li)) return;
      const slug = li.dataset.slug!, back = parked.get(slug);
      let held = back;
      if (back) {
        parked.delete(slug);
        li.append(back.canvas);
      } else {
        if (order.length + parked.size >= ROOM) {
          const longest = parked.keys().next().value;
          const old = order.find((o) => o !== current && !o.dataset.gl);
          if (longest !== undefined) {
            drop(parked.get(longest)!);
            parked.delete(longest);
          } else if (old) sleep(old);
          else return;
        }
        const canvas = document.createElement("canvas");
        canvas.className = "stamp-gl";
        canvas.setAttribute("aria-hidden", "true");
        li.append(canvas);
        const off = canvas.transferControlToOffscreen();
        const id = nextId++, on = load[0] <= load[1] ? 0 : 1;
        load[on]++;
        held = { id, on, canvas };
        const { w, h } = sizeOf(li);
        workers[on].postMessage({ type: "init", id, canvas: off, slug, base: "/stamps/", w, h, box: canvas.clientWidth, dpr: Math.min(2, devicePixelRatio), rot: rotOf(li), urgent }, [off]);
      }
      live.set(li, held!);
      byId.set(held!.id, li);
      order.push(li);
      if (back) {
        // It may hang at another size and turn here.
        const { w, h } = sizeOf(li);
        post(li, { type: "size", w, h, box: back.canvas.clientWidth, dpr: Math.min(2, devicePixelRatio) });
        post(li, { type: "rot", rot: rotOf(li) });
      }
    };

    // Set up ahead of the pointer, one at a time; a stone that's parked is simply there.
    let gone = false, building = 0, queue: HTMLElement[] = [];
    const next = () => {
      while (queue.length) {
        const li = queue.shift()!, fresh = !parked.has(li.dataset.slug!) && !live.has(li);
        wake(li, false);
        if (fresh && live.has(li)) return void (building = live.get(li)!.id);
      }
    };
    const hear = ({ data }: MessageEvent) => {
      if (data.id === building && (data.type === "ready" || data.type === "failed")) {
        building = 0;
        setTimeout(next, 80);
      }
      const li = byId.get(data.id);
      if (!li) {
        // A parked stone's context can be lost too, and then it isn't there to come back.
        if (data.type === "failed") for (const [slug, h] of parked) if (h.id === data.id) {
          parked.delete(slug);
          load[h.on]--;
        }
        return;
      }
      if (data.type === "on") li.dataset.gl = "";
      else if (data.type === "rest") delete li.dataset.gl;
      else if (data.type === "blow") hammer(li.dataset.slug!, data.n);
      else if (data.type === "failed") {
        // This one stays a picture.
        sleep(li);
        li.dataset.flat = "";
      }
    };
    workers.forEach((w) => (w.onmessage = hear));
    const start = () => {
      if (gone || !canGL) return;
      if (!workers.length)
        for (let i = 0; i < 2; i++) {
          const w = new Worker(new URL("./stamp.worker.ts", import.meta.url));
          w.onmessage = hear;
          workers.push(w);
        }
      queue = thrifty() ? [] : lis.slice(0, typeof ahead === "function" ? ahead() : ahead);
      next();
    };
    // Never under a flight: starting a context stalls the GPU for a moment, and the flight is the GPU's.
    if (document.documentElement.classList.contains("boot")) addEventListener("boot:done", start, { once: true });
    else landed().then(() => ("requestIdleCallback" in window ? requestIdleCallback(start, { timeout: 1200 }) : setTimeout(start, 300)));

    const resize = () => {
      lis.forEach((li) => {
        const canvas = li.querySelector<HTMLCanvasElement>(".stamp-gl");
        if (!canvas) return;
        const { w, h } = sizeOf(li);
        post(li, { type: "size", w, h, box: canvas.clientWidth, dpr: Math.min(2, devicePixelRatio) });
      });
    };
    const ro = new ResizeObserver(resize);
    ro.observe(root);

    // Is the pointer on this stone, wherever it's lifted to? Its place at rest counts too, so it can't slide out from under.
    const onStamp = (li: HTMLElement, x: number, y: number) => {
      const { x: cx, y: cy } = centre(li);
      const { w, h } = sizeOf(li);
      const nx = parseFloat(li.style.getPropertyValue("--nx")) || 0, ny = parseFloat(li.style.getPropertyValue("--ny")) || 0;
      const test = (ox: number, oy: number, deg: number, hw: number, hh: number) => {
        const a = (-deg * Math.PI) / 180, dx = x - ox, dy = y - oy;
        return Math.abs(dx * Math.cos(a) - dy * Math.sin(a)) < hw && Math.abs(dx * Math.sin(a) + dy * Math.cos(a)) < hh;
      };
      const rot = rotOf(li);
      return test(cx + nx, cy + ny, rot * STRAIGHTEN, (w * LIFT) / 2 + 8, (h * LIFT) / 2 + 8) || test(cx, cy, rot, w / 2, h / 2);
    };

    const clear = () => {
      if (!current) return;
      delete current.dataset.lift;
      post(current, { type: "over", on: false, x: 0, y: 0, nx: 0, ny: 0 });
      current = null;
      delete root.dataset.focus;
      for (const li of lis) {
        li.style.removeProperty("--px");
        li.style.removeProperty("--py");
      }
    };
    const lift = (li: HTMLElement, x: number, y: number) => {
      if (current === li) return;
      clear();
      current = li;
      wake(li);
      const c = centre(li);
      const { w, h } = sizeOf(li);
      // Brought fully onto the screen if it was hanging off an edge.
      const vw = document.documentElement.clientWidth, vh = innerHeight, m = 14;
      const rad = (rotOf(li) * STRAIGHTEN * Math.PI) / 180;
      const hw = ((w * Math.abs(Math.cos(rad)) + h * Math.abs(Math.sin(rad))) * LIFT) / 2, hh = ((w * Math.abs(Math.sin(rad)) + h * Math.abs(Math.cos(rad))) * LIFT) / 2;
      const nx = Math.min(0, vw - m - (c.x + hw)) + Math.max(0, m - (c.x - hw));
      const up = rise * h;
      // Rising, it may go right up to the screen's top edge: its box is bigger than the rock in it.
      const ny = Math.min(0, vh - m - (c.y - up + hh)) + Math.max(0, (rise ? 0 : m) - (c.y - up - hh)) - up;
      li.style.setProperty("--nx", `${nx.toFixed(1)}px`);
      li.style.setProperty("--ny", `${ny.toFixed(1)}px`);
      li.style.setProperty("--tag-y", `${(-hh - 16).toFixed(1)}px`);
      li.dataset.lift = "";
      root.dataset.focus = "";
      // The others make room: pushed away from it, less the further off they are.
      if (push) for (const o of lis) {
        if (o === li) continue;
        const p = centre(o), dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy) || 1;
        const push = 40 * Math.exp(-d / 420);
        o.style.setProperty("--px", `${((dx / d) * push).toFixed(1)}px`);
        o.style.setProperty("--py", `${((dy / d) * push).toFixed(1)}px`);
      }
      post(li, { type: "over", on: true, x: x - c.x, y: y - c.y, nx, ny });
    };

    const stones: Stones = {
      frozen: false,
      clear,
      wake,
      post,
      rotOf,
      smash: (li, x, y) => {
        const c = centre(li);
        post(li, { type: "smash", x: x - c.x, y: y - c.y });
      },
    };
    api.current = stones;

    const onMove = (e: PointerEvent) => {
      touch = e.pointerType === "touch";
      if (touch) return;
      px = e.clientX;
      py = e.clientY;
      if (stones.frozen) return;
      if (current) {
        if (onStamp(current, px, py)) {
          const c = centre(current);
          post(current, { type: "move", x: px - c.x, y: py - c.y });
          return;
        }
        clear();
      }
      const li = (e.target as Element | null)?.closest?.(".stamp-link")?.parentElement ?? undefined;
      if (li && root.contains(li)) lift(li, px, py);
    };
    // A finger "leaves" every time it lifts, before its tap's click lands; only a mouse leaving the page lets go.
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType !== "touch") clear();
    };
    const onDown = (e: PointerEvent) => {
      touch = e.pointerType === "touch";
      if (touch && current && !(e.target as Element).closest?.(".stamp-link")) clear();
    };
    // A finger's first tap lifts it, the second goes in.
    const onClick = (e: MouseEvent) => {
      const li = (e.target as Element).closest?.(".stamp-link")?.parentElement ?? undefined;
      if (!li || stones.frozen || !twoTap || !touch || current === li || !canGL) return;
      e.preventDefault();
      const c = centre(li);
      lift(li, c.x, c.y);
    };
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement;
      if (stones.frozen || !t.matches?.(":focus-visible")) return;
      const li = t.closest<HTMLElement>(".stamp");
      if (li) {
        const c = centre(li);
        lift(li, c.x, c.y);
      }
    };
    const onFocusOut = () => clear();

    // A scroll moves them under a still pointer.
    const offScroll = onScrollFrame(() => {
      if (current && !touch && !onStamp(current, px, py) && document.activeElement?.closest(".stamp") !== current) clear();
    });

    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("pointerdown", onDown, { passive: true, capture: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    root.addEventListener("click", onClick, true);
    root.addEventListener("focusin", onFocusIn);
    root.addEventListener("focusout", onFocusOut);
    return () => {
      gone = true;
      queue = [];
      removeEventListener("boot:done", start);
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown, { capture: true });
      document.documentElement.removeEventListener("pointerleave", onLeave);
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("focusin", onFocusIn);
      root.removeEventListener("focusout", onFocusOut);
      ro.disconnect();
      offScroll();
      for (const li of order) {
        const w = live.get(li)!, slug = li.dataset.slug!, twin = parked.get(slug);
        workers[w.on].postMessage({ type: "park", id: w.id });
        w.canvas.remove();
        if (twin) drop(twin);
        parked.delete(slug);
        parked.set(slug, w);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set up once
  }, []);

  return api;
}

/** The phone's layout, in step with the CSS. */
const NARROW = "(max-width: 1023px)";
/** When a stone on stage comes alive, ms after the tap: it has landed (0.62 s, in the CSS) and its words have settled, so starting its GL holds nothing up. */
const LANDED = 850;
/** The arc on a phone is a fan: each stone's place (mx, my) lies this far, of the frame's width, from one rivet, turned as far as its mrot. */
const REACH = 0.4;
/** The fan opening: ms after the first screen starts to focus, so the one stone has been seen, and how long it takes. */
const FAN_WAIT = 800, FAN_TIME = 1000;

/**
 * The arc shut, as on a folding fan: all the stones on the first one's place, the rest hidden under it, held there paused. Played, the
 * outermost sweeps out clockwise round the rivet and pulls each of the others out from under as it reaches them, so they all land
 * together. Each stone's turn round the rivet is a path for the li and a turn for its picture, which leaves its float running throughout.
 */
function shutFan(lis: HTMLElement[]) {
  const turn = (li: HTMLElement) => LAY[li.dataset.slug!].mrot;
  const angles = lis.map(turn), first = Math.min(...angles), last = Math.max(...angles);
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const timing = { duration: FAN_TIME, easing: getComputedStyle(document.documentElement).getPropertyValue("--ease-glide").trim() || "ease-out" };
  return lis
    .filter((li) => turn(li) !== first)
    .flatMap((li) => {
      const end = turn(li), starts = (last - end) / (last - first); // how far through the sweep this one is reached
      const at = (deg: number) => `calc(var(--fw) * ${(REACH * (Math.sin(rad(deg)) - Math.sin(rad(end)))).toFixed(4)}) calc(var(--fw) * ${(REACH * (Math.cos(rad(end)) - Math.cos(rad(deg)))).toFixed(4)})`;
      const steps = Math.ceil((end - first) / 6);
      const path = Array.from({ length: steps + 1 }, (_, k) => ({ translate: at(first + ((end - first) * k) / steps), offset: starts + ((1 - starts) * k) / steps }));
      const shut = `${first - end}deg`;
      return [
        li.animate([{ translate: at(first), offset: 0 }, ...path], timing),
        li.querySelector(".stamp-rest")!.animate(
          [
            { rotate: shut, opacity: 0, offset: 0 },
            { rotate: shut, opacity: 0, offset: starts },
            { opacity: 1, offset: starts + 0.04 },
            { rotate: "0deg", opacity: 1, offset: 1 },
          ],
          timing,
        ),
      ];
    })
    .map((a) => (a.pause(), a));
}

/**
 * The first screen's stamps: one per project, each a whole piece of rock with the project carved into it and a link to its case
 * study, alive through useStones. Pointed at, the others lose focus and make room, and a black tag names it.
 *
 * On a phone they lie in an arc, which opens from one stone like a folding fan when the page first loads (shutFan). A tap puts one on stage: it eases to the middle, upright and big, over the blurred page, with what
 * it is and a way into its case study under it. A press anywhere else, or Esc, eases it back to its place. The flight is only its picture
 * moving, so nothing can hold it up; once it's landed its canvas comes up and it's hammered. Its maps only load then, as they're a
 * megabyte each and starting a GL context stalls the GPU for a moment.
 */
export function Stamps({ items }: { items: StampItem[] }) {
  const host = useRef<HTMLUListElement>(null);
  const stones = useStones(host, { ahead: () => (matchMedia(NARROW).matches ? 0 : Infinity) });
  const sheet = useRef<HTMLDivElement>(null);
  const staged = useRef<HTMLElement | null>(null);
  const hide = useRef(() => {});
  const landing = useRef(0);
  const [words, setWords] = useState<StampItem | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = host.current!;
    const s = stones.current!;
    const narrow = matchMedia(NARROW);
    const links = [...root.querySelectorAll<HTMLElement>(".stamp-link")];
    // Only on a full load of the page, on a phone: it opens once its first stone is on the screen, which on a small one may take a scroll.
    let fan: Animation[] = [];
    let fanWait = 0, fanView: IntersectionObserver | undefined;
    const openFan = () => {
      fanWait = window.setTimeout(() => {
        fanView = new IntersectionObserver(
          ([e]) => {
            if (!e.isIntersecting) return;
            fanView!.disconnect();
            fan.forEach((a) => a.play());
          },
          { threshold: 0.5 },
        );
        fanView.observe(links[0]);
      }, FAN_WAIT);
    };
    const endFan = (how: "finish" | "cancel") => {
      removeEventListener("boot:in", openFan);
      clearTimeout(fanWait);
      fanView?.disconnect();
      fan.forEach((a) => a[how]());
      fan = [];
    };
    if (narrow.matches && document.documentElement.classList.contains("boot")) {
      fan = shutFan([...root.querySelectorAll<HTMLElement>(".stamp")]);
      addEventListener("boot:in", openFan, { once: true });
    }
    // On a phone nothing lifts under a pointer or on focus, and a stone opens this dialog before it goes anywhere.
    const fit = () => {
      s.frozen = narrow.matches;
      links.forEach((a) => (narrow.matches ? a.setAttribute("aria-haspopup", "dialog") : a.removeAttribute("aria-haspopup")));
      if (!narrow.matches) {
        hide.current();
        endFan("cancel");
      }
    };

    const show = (li: HTMLElement) => {
      endFan("finish");
      const item = items.find((i) => i.slug === li.dataset.slug)!;
      const box = sheet.current!;
      const vw = document.documentElement.clientWidth, vh = innerHeight;
      // A phone on its side: the stone beside the words, not over them. Otherwise the two together are centred on the screen.
      const side = vw > vh * 1.15;
      box.toggleAttribute("data-side", side);
      flushSync(() => setWords(item));
      const link = li.querySelector<HTMLElement>(".stamp-link")!;
      const w = link.offsetWidth, h = link.offsetHeight, tall = box.offsetHeight, gap = 18;
      const big = side ? Math.min(vh * 0.82, vw * 0.5) : Math.max(h, Math.min(vw * 0.8, 460, vh - tall - gap - 64));
      const top = side ? (vh - big) / 2 : Math.max(20, (vh - big - gap - tall) / 2);
      const r = li.getBoundingClientRect(), k = big / h;
      box.style.top = `${side ? Math.max(16, (vh - tall) / 2) : top + big + gap}px`;
      li.style.setProperty("--dx", `${((side ? vw * 0.27 : vw / 2) - r.left).toFixed(1)}px`);
      li.style.setProperty("--dy", `${(top + big / 2 - r.top).toFixed(1)}px`);
      li.style.setProperty("--k", k.toFixed(3));
      li.dataset.stage = "";
      staged.current = li;
      document.documentElement.setAttribute("data-hold", "");
      landing.current = window.setTimeout(() => {
        s.wake(li);
        s.post(li, { type: "over", on: true, x: w * 0.16, y: h * 0.1, nx: 0, ny: 0, k, straight: 1, stage: true });
      }, LANDED);
      flushSync(() => setOpen(true));
      box.querySelector("a")?.focus({ preventScroll: true });
    };
    hide.current = () => {
      const li = staged.current;
      if (!li) return;
      staged.current = null;
      clearTimeout(landing.current);
      document.documentElement.removeAttribute("data-hold");
      setOpen(false);
      delete li.dataset.stage;
      delete li.dataset.gl;
      li.style.removeProperty("--dx");
      li.style.removeProperty("--dy");
      s.post(li, { type: "over", on: false, x: 0, y: 0, nx: 0, ny: 0, stage: true });
      li.querySelector<HTMLElement>(".stamp-link")?.focus({ preventScroll: true });
    };
    const onTap = (e: MouseEvent) => {
      if (!narrow.matches || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const li = (e.target as Element).closest?.(".stamp-link")?.parentElement;
      if (!li) return;
      e.preventDefault();
      // On stage, a press is one more blow.
      if (staged.current === li) s.smash(li, e.clientX, e.clientY);
      else if (!document.documentElement.classList.contains("boot")) show(li);
    };

    warmEffects();
    // They only float while they're on the screen.
    const away = new IntersectionObserver(([e]) => root.toggleAttribute("data-away", !e.isIntersecting));
    away.observe(root);
    fit();
    narrow.addEventListener("change", fit);
    root.addEventListener("click", onTap, true);
    return () => {
      endFan("cancel");
      clearTimeout(landing.current);
      document.documentElement.removeAttribute("data-hold");
      away.disconnect();
      narrow.removeEventListener("change", fit);
      root.removeEventListener("click", onTap, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set up once
  }, []);

  // On stage, the dialog keeps the keys, the page stays where it is, and a finger or a pointer moves the light and tilts the stone.
  useEffect(() => {
    if (!open) return;
    const hold = (e: Event) => e.preventDefault();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") return hide.current();
      if (e.key !== "Tab") return;
      const all = [...sheet.current!.parentElement!.querySelectorAll<HTMLElement>("a[href], button")];
      const at = all.indexOf(document.activeElement as HTMLElement);
      e.preventDefault();
      all[at < 0 ? 0 : (at + (e.shiftKey ? -1 : 1) + all.length) % all.length].focus();
    };
    const tilt = (e: PointerEvent) => {
      const li = staged.current;
      if (!li) return;
      const r = li.getBoundingClientRect();
      stones.current!.post(li, { type: "move", x: e.clientX - r.left, y: e.clientY - r.top });
    };
    addEventListener("keydown", key);
    addEventListener("wheel", hold, { passive: false });
    addEventListener("touchmove", hold, { passive: false });
    addEventListener("pointermove", tilt, { passive: true });
    return () => {
      removeEventListener("keydown", key);
      removeEventListener("wheel", hold);
      removeEventListener("touchmove", hold);
      removeEventListener("pointermove", tilt);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stones and hide are refs
  }, [open]);

  // The row: everything else steps back, and they deal into a line across the middle of the screen.
  useEffect(() => {
    const lis = [...host.current!.querySelectorAll<HTMLElement>(".stamp")];
    let row = false;
    const setRow = (on: boolean) => {
      if (row === on) return;
      row = on;
      const s = stones.current!;
      s.clear();
      s.frozen = on;
      document.documentElement.toggleAttribute("data-stamps-row", on);
      const vw = document.documentElement.clientWidth, vh = innerHeight;
      for (const li of lis) {
        if (!on) {
          li.style.removeProperty("--dx");
          li.style.removeProperty("--dy");
          li.style.removeProperty("--rot-now");
        } else {
          const r = li.getBoundingClientRect();
          li.style.setProperty("--dx", `${(parseFloat(li.dataset.rx!) * vw - r.left).toFixed(1)}px`);
          li.style.setProperty("--dy", `${(vh * 0.47 - r.top).toFixed(1)}px`);
          li.style.setProperty("--rot-now", li.dataset.rr!);
        }
        s.post(li, { type: "rot", rot: s.rotOf(li) });
      }
    };
    const toggle = () => setRow(!row);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && row) setRow(false);
    };
    const onWheel = () => setRow(false);
    addEventListener("stamps:row", toggle);
    addEventListener("keydown", onKey);
    addEventListener("wheel", onWheel, { passive: true });
    return () => {
      removeEventListener("stamps:row", toggle);
      removeEventListener("keydown", onKey);
      removeEventListener("wheel", onWheel);
      document.documentElement.removeAttribute("data-stamps-row");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- set up once
  }, []);

  return (
    <>
      <ul ref={host} className="stamps">
        {items.map((s) => {
          const l = LAY[s.slug];
          const style = { "--x": l.x, "--y": l.y, "--rot": l.rot, "--z": l.z, "--mx": l.mx, "--my": l.my, "--mrot": l.mrot, "--mz": l.mz } as CSSProperties;
          return (
            <li key={s.slug} className="stamp" style={style} data-slug={s.slug} data-rx={l.rx} data-rr={l.rr} data-fly-scope>
              <span className="stamp-rest" data-fly="stone" data-land-from={`/work/${s.slug}`} aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element -- its shadow, baked, so moving it costs nothing (scripts/stamps/soft.py) */}
                <img className="stamp-shadow" src={`/stamps/${s.slug}-shadow.webp`} alt="" width={240} height={300} decoding="async" draggable={false} />
                {/* eslint-disable-next-line @next/next/no-img-element -- baked with its perforated edge in alpha, 512 px */}
                <img src={`/stamps/${s.slug}-sm.webp`} alt="" width={512} height={641} decoding="async" draggable={false} />
              </span>
              <PageLink href={`/work/${s.slug}`} className="stamp-link" aria-label={`${s.title}, ${s.kind} ${s.year}: read the case study`} draggable={false} />
              <span className="stamp-tag" aria-hidden="true">
                {s.title}
              </span>
            </li>
          );
        })}
      </ul>
      <button type="button" className="stamps-back" onClick={() => dispatchEvent(new Event("stamps:row"))} data-sound="gather">
        <span aria-hidden="true">←</span> Go back <span className="text-label">[Esc]</span>
      </button>
      <div className="stamp-blur" data-open={open || undefined} aria-hidden="true" />
      <div className="stamp-veil" data-open={open || undefined} onClick={() => hide.current()} aria-hidden="true" />
      <div className="stamp-stage" data-open={open || undefined} role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-label={open ? words?.title : undefined} inert={!open}>
        <button type="button" className="stamp-close" aria-label="Put it back" onClick={() => hide.current()}>
          ×
        </button>
        <div ref={sheet} className="stamp-sheet">
          <h2 className="stamp-sheet-name font-serif">{words?.title}</h2>
          <p className="stamp-sheet-kind">
            {words?.kind} · {words?.year}
            {words?.who ? ` · ${words.who}` : ""}
          </p>
          <p className="stamp-sheet-text">{words?.summary}</p>
          <PageLink href={words ? `/work/${words.slug}` : "/"} className="stamp-go" tabIndex={words ? undefined : -1} data-stone={words?.slug}>
            Read the case study <span aria-hidden="true">→</span>
          </PageLink>
        </div>
      </div>
    </>
  );
}
