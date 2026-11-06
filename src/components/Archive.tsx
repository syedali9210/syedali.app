"use client";

import Image from "next/image";
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from "react";
import { flushSync, createPortal } from "react-dom";
import type { ArchiveItem, ArchiveKind } from "@/content/archive";
import { Cursor } from "./Cursor";
import { landed, PageLink } from "./PageLink";
import { Paper } from "./Paper";
import { sift } from "./sift";
import { SoundToggle, sound } from "./Sound";
import { useStones } from "./Stamps";
import { ThemeToggle } from "./ThemeToggle";

export type Node = ArchiveItem & { w: number; h: number };
type Open = { item: Node; button: HTMLButtonElement; picture: HTMLImageElement };
type Source = HTMLImageElement | HTMLVideoElement;

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ── Dust ────────────────────────────────────────────────────────────────
   A picture as a few thousand grains of its own colours. In: the grains leave the card and settle into the stage,
   the side nearest the card first, and hold there as a dotted picture until they're stopped; the last one landing
   calls `done`, and the stage brings the real thing up under them. Out: the picture (a film's current frame) erodes
   from the far side and the grains drift home to the card. Returns a stop. */
function grains(src: Source, w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  const [nw, nh] = src instanceof HTMLVideoElement ? [src.videoWidth, src.videoHeight] : [src.naturalWidth, src.naturalHeight];
  const s = Math.max(w / nw, h / nh);
  g.drawImage(src, (w - nw * s) / 2, 0, nw * s, nh * s);
  return g.getImageData(0, 0, w, h).data;
}

/* The dust on the GPU, in a worker (dust.worker.ts) on one canvas laid over the page and handed over once the page is
   idle: an opening never waits on a GL context, a shader or a pixel read, and the grains keep their pace while the page
   loads the film or figure under them. Each grain is a point whose path is uploaded once, so a frame is one number and
   one draw. The 2D version below repaints a full-screen bitmap every frame on the page; it's kept for browsers without
   OffscreenCanvas or WebGL2. */
type Layer = { worker: Worker; canvas: HTMLCanvasElement; ready: boolean };
let layer: Layer | null = null;
let runs = 0;
let waiting: { id: number; done: () => void } | null = null;

function warmDust() {
  if (layer || still() || !("transferControlToOffscreen" in HTMLCanvasElement.prototype)) return;
  const canvas = document.createElement("canvas");
  canvas.className = "dust-layer";
  canvas.setAttribute("aria-hidden", "true");
  document.body.append(canvas);
  const off = canvas.transferControlToOffscreen();
  const worker = new Worker(new URL("./dust.worker.ts", import.meta.url));
  const l: Layer = (layer = { worker, canvas, ready: false });
  worker.onmessage = ({ data }) => {
    if (data.type === "ready") l.ready = data.ok;
    else if (waiting && waiting.id === data.id) {
      const { done } = waiting;
      waiting = null;
      done();
    }
  };
  worker.postMessage({ type: "init", canvas: off }, [off]);
}

function dustAside(l: Layer, src: Source, stage: DOMRect, card: DOMRect, mode: "in" | "out", done: () => void, stone?: HTMLImageElement | null) {
  const id = ++runs;
  const stop = () => {
    if (waiting?.id === id) waiting = null;
    l.worker.postMessage({ type: "stop", id });
    if (runs === id) l.canvas.style.visibility = "";
  };
  const finish = () => {
    done();
    if (mode === "out") stop();
  };
  waiting = { id, done: finish };
  // The canvas's own box, so a grain lands on its pixel whatever the phone's address bar is doing.
  const vw = l.canvas.clientWidth, vh = l.canvas.clientHeight;
  l.canvas.style.visibility = "visible";
  const rect = ({ left, top, width, height }: DOMRect) => ({ left, top, width, height });
  Promise.all([createImageBitmap(src), stone?.complete && stone.naturalWidth ? createImageBitmap(stone) : undefined]).then(
    ([bitmap, rock]) => {
      if (waiting?.id !== id) {
        bitmap.close();
        rock?.close();
        return;
      }
      const run = { type: "run", id, bitmap, stone: rock, stage: rect(stage), card: rect(card), mode, vw, vh, dpr: Math.min(2, devicePixelRatio) };
      l.worker.postMessage(run, rock ? [bitmap, rock] : [bitmap]);
    },
    () => waiting?.id === id && ((waiting = null), finish()),
  );
  return stop;
}

function dust(canvas: HTMLCanvasElement, src: Source, stage: DOMRect, card: DOMRect, mode: "in" | "out", done: () => void, stone?: HTMLImageElement | null) {
  if (layer?.ready) return dustAside(layer, src, stage, card, mode, done, stone);
  const w = Math.max(1, Math.round(stage.width));
  const h = Math.max(1, Math.round(stage.height));
  let px: Uint8ClampedArray;
  try {
    px = grains(src, w, h);
  } catch {
    done();
    return () => {};
  }
  const step = Math.max(3, Math.ceil(Math.sqrt((w * h) / 9000)));
  const cols = Math.ceil(w / step), rows = Math.ceil(h / step), n = cols * rows;
  const sx = new Float32Array(n), sy = new Float32Array(n), tx = new Float32Array(n), ty = new Float32Array(n);
  const lag = new Float32Array(n), wob = new Float32Array(n), col = new Uint32Array(n);
  const left = card.left + card.width / 2 < stage.left + stage.width / 2;
  let k = 0;
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step, k++) {
      const i = (y * w + x) * 4;
      tx[k] = stage.left + x;
      ty[k] = stage.top + y;
      sx[k] = card.left + (x / w) * card.width + (Math.random() - 0.5) * 24;
      sy[k] = card.top + (y / h) * card.height + (Math.random() - 0.5) * 24;
      col[k] = (px[i + 2] << 16) | (px[i + 1] << 8) | px[i];
      const near = left ? x / w : 1 - x / w;
      lag[k] = (mode === "in" ? near : 1 - near) * 0.3 + Math.random() * 0.08;
      wob[k] = Math.random() * Math.PI * 2;
    }
  const W = (canvas.width = innerWidth);
  const H = (canvas.height = innerHeight);
  const ctx = canvas.getContext("2d")!;
  const frame = ctx.createImageData(W, H);
  const buf = new Uint32Array(frame.data.buffer);
  const D = mode === "in" ? 720 : 850;
  const t0 = performance.now();
  let raf = 0;
  const draw = (now: number) => {
    const T = (now - t0) / D;
    buf.fill(0);
    for (let k = 0; k < n; k++) {
      const t = Math.min(1, Math.max(0, (T - lag[k]) / 0.62));
      const e = t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
      const [ax, ay, bx, by] = mode === "in" ? [sx[k], sy[k], tx[k], ty[k]] : [tx[k], ty[k], sx[k], sy[k]];
      const arc = Math.sin(Math.PI * e);
      const x = (ax + (bx - ax) * e + Math.sin(wob[k] + e * 6) * 22 * arc) | 0;
      const y = (ay + (by - ay) * e - arc * (40 + 24 * Math.sin(wob[k]))) | 0;
      // In, a grain holds once it lands (the picture is made of them until the real one shows); out, it fades home.
      const a = mode === "in" ? Math.min(1, e * 6) : t === 0 ? 1 : Math.max(0, 1 - e * 1.15);
      if (a <= 0 || x < 0 || y < 0 || x >= W - 1 || y >= H - 1) continue;
      const c = ((a * 255) << 24) | col[k];
      const o = y * W + x;
      buf[o] = buf[o + 1] = buf[o + W] = buf[o + W + 1] = c;
    }
    ctx.putImageData(frame, 0, 0);
    if (T < 1) return void (raf = requestAnimationFrame(draw));
    done();
    if (mode === "out") ctx.clearRect(0, 0, W, H);
  };
  raf = requestAnimationFrame(draw);
  return () => {
    cancelAnimationFrame(raf);
    ctx.clearRect(0, 0, W, H);
  };
}

/* ── The stage ───────────────────────────────────────────────────────────
   The opened thing at the centre, the page blurred behind it. A figure or picture loads while its dust assembles and
   shows the moment the last grain lands; a film only starts loading then, and comes up once it's playing. One dust at
   a time: closing mid-flight stops the arriving dust before the leaving one starts. */
function Stage({ open, onClosed }: { open: Open; onClosed: () => void }) {
  const { item, button, picture } = open;
  const [phase, setPhase] = useState<"in" | "shown" | "out">("in");
  const root = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const stopDust = useRef<() => void>(() => {});
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const rock = () => button.parentElement?.querySelector<HTMLImageElement>(".stamp-rest img");

  useEffect(() => {
    const show = () => void (phaseRef.current === "in" && setPhase("shown"));
    const land = () => {
      const v = film.current;
      if (!v) return show();
      // A film loads only now: its decoder starting up holds the GPU for a few frames, which mid-flight was a stutter in
      // the dust. The dots hold still while it does, and it comes up playing from its first frame; on a slow connection
      // its poster comes up after a moment instead.
      v.addEventListener("playing", show, { once: true });
      setTimeout(show, 800);
      v.preload = "auto";
      v.play().catch(() => {});
    };
    sound("open");
    if (!still() && picture.complete && picture.naturalWidth && media.current && canvas.current)
      stopDust.current = dust(canvas.current, picture, media.current.getBoundingClientRect(), button.getBoundingClientRect(), "in", land, rock());
    else {
      land();
      show(); // No dots to hold: straight up, a film on its poster.
    }
    closeBtn.current?.focus({ preventScroll: true });
    const key = (e: KeyboardEvent) => e.key === "Escape" && close();
    // The page stays put behind the stage without locking it (a lock re-lays the whole page out).
    const hold = (e: Event) => e.preventDefault();
    const el = root.current!;
    el.addEventListener("wheel", hold, { passive: false });
    el.addEventListener("touchmove", hold, { passive: false });
    addEventListener("keydown", key);
    return () => {
      stopDust.current();
      removeEventListener("keydown", key);
      el.removeEventListener("wheel", hold);
      el.removeEventListener("touchmove", hold);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per opening
  }, []);

  // The real thing is fading up under the dots; clear them once it's there.
  useEffect(() => {
    if (phase !== "shown") return;
    const t = setTimeout(() => stopDust.current(), 340);
    return () => clearTimeout(t);
  }, [phase]);

  function close() {
    if (phaseRef.current === "out") return;
    stopDust.current();
    sound("close");
    const r = media.current?.getBoundingClientRect();
    const v = film.current;
    const shown = media.current?.querySelector("img");
    const src: Source | null = v && v.readyState >= 2 ? v : shown?.complete ? shown : picture.complete && picture.naturalWidth ? picture : null;
    v?.pause();
    setPhase("out");
    // Focus first: the stones are still held, so it comes home without being lifted and hammered again.
    const end = () => {
      button.focus({ preventScroll: true });
      onClosed();
    };
    if (still() || !r || !canvas.current || !src) return void setTimeout(end, 220);
    stopDust.current = dust(canvas.current, src, r, button.getBoundingClientRect(), "out", end, rock());
  }

  const kind = item.kind[0].toUpperCase() + item.kind.slice(1);
  return createPortal(
    <div ref={root} role="dialog" aria-modal="true" aria-label={item.title} className={`stage stage-${phase}`} onClick={close}>
      <canvas ref={canvas} className="stage-dust" aria-hidden="true" />
      <div className="stage-body" data-fly-scope data-figure={item.figure ? "" : undefined} onClick={(e) => e.stopPropagation()} style={item.figure ? undefined : ({ "--ar": item.w / item.h } as CSSProperties)}>
        <div ref={media} className="stage-media" data-fly="screen">
          {item.video ? (
            <video ref={film} src={item.video} poster={item.picture.src} preload="none" muted loop playsInline controls className="size-full object-cover" />
          ) : item.figure ? (
            // Focused as it loads, so an animation that's steered by keys answers to them straight away.
            <iframe src={item.figure} title={item.title} onLoad={(e) => e.currentTarget.contentWindow?.focus()} className="size-full border-0 bg-sheet" />
          ) : (
            <Image src={item.picture.src} alt={item.picture.alt} width={item.w} height={item.h} sizes="(min-width: 1100px) 960px, 88vw" className="size-full object-cover object-top" />
          )}
        </div>
        <div className="stage-caption">
          <p className="font-mono text-[11px] tracking-[0.08em] text-label uppercase">
            {kind} · {item.year}
          </p>
          <p className="mt-1 font-serif text-[clamp(22px,1.2vw+14px,30px)] leading-tight text-ink">{item.title}</p>
          <p className="mt-1 text-small text-body">{item.note}</p>
          {item.href && (
            <PageLink href={item.href} className="mt-3 inline-flex font-mono text-[11px] tracking-[0.08em] text-fg uppercase underline-offset-4 hover:underline">
              Open the case study →
            </PageLink>
          )}
        </div>
        <button ref={closeBtn} type="button" onClick={close} className="stage-close" aria-label="Close" data-sound="none">
          ×
        </button>
      </div>
    </div>,
    document.body,
  );
}

// Set up ahead of the pointer: the first screenful, on a desktop.
const ROOM_AHEAD = 8;
// How each stone lies, in turn.
const TURNS = [-8, 6, -4, 10, 5, -11, 7, -6, -3, 9, -7, 4, 8, -5, 3, -9];

/** A circle drawn by hand round the kind a piece is. */
const RING = "M9 21C6 10 37 3 62 5C88 7 98 14 95 23C92 34 58 38 34 36C14 34 2 28 10 16";

/**
 * The archive's own page. At the middle of the left edge, its nav: every kind, a small square marking the one you're on. Down the left,
 * a way back, a tall holed stone, what this is. Then a grid of cards, each with a piece's number, its stone (cut like the hero's,
 * scripts/stamps/bake.py PIECES, and hammered when pointed at the same way), what it is, and its kind circled. Pressed, a stone takes
 * one last blow and breaks up: its dust flies to the middle of the screen and settles into the piece, a live figure, a film, or a
 * screen, with what it is under it. Closed, the dust goes home and the stone comes back. The nav clears the others away and slides
 * what's left into place.
 */
export function Archive({ items, kinds }: { items: Node[]; kinds: { kind: ArchiveKind; label: string }[] }) {
  const [open, setOpen] = useState<Open | null>(null);
  const [kind, setKind] = useState<ArchiveKind | "all">("all");
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const pictures = useRef(new Map<string, HTMLImageElement>());
  const stones = useStones(root, { ahead: ROOM_AHEAD, twoTap: false, hoverOnly: true, push: false, rise: 0.13 });

  useEffect(() => {
    const idle = (fn: () => void, wait: number) => ("requestIdleCallback" in window ? requestIdleCallback(fn, { timeout: wait }) : setTimeout(fn, wait));
    // The dust's worker and its GL, made while nothing's happening, so the first opening has nothing left to build.
    landed().then(() => idle(warmDust, 4000));
    // Each piece's picture, small, which the dust takes its colours from, as its card comes near the screen.
    const cards = [...grid.current!.children];
    const near = new IntersectionObserver(
      (seen) => {
        for (const { isIntersecting, target } of seen) {
          if (!isIntersecting) continue;
          near.unobserve(target);
          const it = items[cards.indexOf(target)], im = document.createElement("img");
          im.src = `/_next/image?url=${encodeURIComponent(it.picture.src)}&w=640&q=90`;
          pictures.current.set(it.id, im);
        }
      },
      { rootMargin: "600px 0px" },
    );
    cards.forEach((c) => near.observe(c));
    return () => near.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- the list is fixed for the page
  }, []);

  const choose = (next: ArchiveKind | "all") => {
    if (next === kind) return;
    stones.current?.clear();
    grid.current!.dataset.sifted = ""; // the cards' own entrance is over
    sift([...grid.current!.children] as HTMLElement[], (el) => next === "all" || el.dataset.kind === next, () => flushSync(() => setKind(next)));
  };

  // Anywhere on a card opens it. On the stone itself the last blow lands where it was pressed; otherwise, and from a key, on its heart.
  const press = (it: Node, e: MouseEvent<HTMLElement>) => {
    if (open || (e.target as Element).closest("a")) return;
    const button = e.currentTarget.querySelector<HTMLButtonElement>(".stamp-link")!, li = button.parentElement!, s = stones.current;
    const r = button.getBoundingClientRect(), aimed = e.detail && e.target === button;
    if (s) {
      s.frozen = true;
      s.smash(li, aimed ? e.clientX : r.left + r.width / 2, aimed ? e.clientY : r.top + r.height / 2);
      setTimeout(() => s.clear(), 70);
    }
    li.dataset.gone = "";
    setOpen({ item: it, button, picture: pictures.current.get(it.id) ?? document.createElement("img") });
  };
  const closed = () => {
    if (open) delete open.button.parentElement!.dataset.gone;
    if (stones.current) stones.current.frozen = false;
    setOpen(null);
  };

  const tabs = [{ kind: "all" as const, label: "All" }, ...kinds];
  return (
    <div className="home relative min-h-svh overflow-x-clip bg-sheet">
      <Paper />
      <Cursor />
      <div ref={root} className="ar">
        <div className="ar-toggles">
          <SoundToggle className="hero-toggle" />
          <ThemeToggle plain className="hero-toggle" />
        </div>
        <nav className="ar-nav" aria-label="Kinds of work" style={{ "--a": tabs.findIndex((t) => t.kind === kind) } as CSSProperties}>
          {tabs.map((t) => (
            <button key={t.kind} type="button" aria-pressed={kind === t.kind} data-sound="switch" onClick={() => choose(t.kind)}>
              {t.label}
              <span>{t.kind === "all" ? items.length : items.filter((i) => i.kind === t.kind).length}</span>
            </button>
          ))}
        </nav>
        <div className="ar-layout">
          <aside className="ar-side">
            <PageLink href="/" className="ar-back" data-stone="piece-back">
              <span aria-hidden="true">←</span> Back
            </PageLink>
            <div className="ar-mark" aria-hidden="true">
              <div className="stamp" data-slug="piece-archive" style={{ "--rot": -2 } as CSSProperties}>
                <span className="stamp-rest" data-land="stone">
                  {/* eslint-disable-next-line @next/next/no-img-element -- baked with its outline in alpha */}
                  <img src="/stamps/piece-archive.webp" alt="" width={768} height={962} decoding="async" draggable={false} />
                </span>
                <span className="stamp-link" />
              </div>
            </div>
            <h1 className="ar-title font-serif">Archive</h1>
            <p className="ar-desc">{items.length} pieces: animations, films, sites and products, each cut in its own stone. Press one to break it open.</p>
          </aside>
          <main className="ar-main">
            <ul ref={grid} className="cards">
              {items.map((it, n) => (
                <li key={it.id} className="card" data-kind={it.kind} hidden={kind !== "all" && it.kind !== kind} style={{ "--i": n } as CSSProperties} data-cursor="Open" data-stone={`piece-${it.id}`} onClick={(e) => press(it, e)}>
                  <p className="card-top">
                    <span>{it.year}</span>
                    <b>{String(n + 1).padStart(4, "0")}</b>
                  </p>
                  <div className="card-stone">
                    <div className="stamp" data-slug={`piece-${it.id}`} style={{ "--rot": TURNS[n % TURNS.length] } as CSSProperties}>
                      <span className="stamp-rest" aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element -- baked with its outline in alpha, 512 px */}
                        <img src={`/stamps/piece-${it.id}-sm.webp`} alt="" width={512} height={641} loading={n < 6 ? "eager" : "lazy"} decoding="async" draggable={false} />
                      </span>
                      <button type="button" className="stamp-link" aria-label={`Open ${it.title}, ${it.kind} ${it.year}`} />
                    </div>
                  </div>
                  <h2 className="card-title font-serif">{it.title}</h2>
                  <p className="card-note">{it.note}</p>
                  <p className="card-tags" aria-hidden="true">
                    {kinds.map((k) => (
                      <span key={k.kind} data-on={k.kind === it.kind || undefined}>
                        {k.label}
                        {k.kind === it.kind && (
                          <svg viewBox="0 0 100 40" preserveAspectRatio="none">
                            <path d={RING} />
                          </svg>
                        )}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ul>
          </main>
        </div>
      </div>
      {open && <Stage key={open.item.id} open={open} onClosed={closed} />}
    </div>
  );
}
