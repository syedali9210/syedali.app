"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { CaseStudy } from "@/content/types";
import { Icon } from "./Icon";
import { useActiveSection } from "./motion";
import { PageLink, usePageNav } from "./PageLink";
import { SoundToggle } from "./Sound";
import { ThemeToggle } from "./ThemeToggle";
import { warmEffects } from "./warm";

type Mode = "full" | "quick";

/**
 * Full story or quick overview: one attribute on <html> that the CSS reads, kept in the address as ?view=quick.
 * Shared by everything that shows it (the side panel, the tab, the entry screen's button), so they never disagree.
 */
const views = new Set<(m: Mode) => void>();
function setMode(m: Mode) {
  const apply = () => {
    document.documentElement.dataset.mode = m;
    views.forEach((f) => f(m));
    const url = new URL(location.href);
    if (m === "quick") url.searchParams.set("view", "quick");
    else url.searchParams.delete("view");
    history.replaceState(history.state, "", url);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return apply();
  const root = document.documentElement;
  root.dataset.vt = "fade";
  document.startViewTransition(apply).finished.finally(() => delete root.dataset.vt);
}
function useMode() {
  const [mode, setModeState] = useState<Mode>("full");
  useEffect(() => {
    const m: Mode = new URLSearchParams(location.search).get("view") === "quick" ? "quick" : "full";
    document.documentElement.dataset.mode = m;
    setModeState(m);
    views.add(setModeState);
    return () => void views.delete(setModeState);
  }, []);
  return [mode, setMode] as const;
}

/** A button anywhere on the page (the entry card's) that flips between the full story and the quick overview. */
export function ModeButton({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => dispatchEvent(new Event("case:mode"))}>
      {children}
    </button>
  );
}

function ModeSwitch({ mode, setMode, className = "" }: { mode: Mode; setMode: (m: Mode) => void; className?: string }) {
  return (
    <div role="group" aria-label="How much to read" className={`grid grid-cols-2 rounded-[10px] bg-card p-0.5 ${className}`}>
      {(["full", "quick"] as const).map((m) => (
        <button
          key={m}
          type="button"
          aria-pressed={mode === m}
          onClick={() => setMode(m)}
          className="h-8 rounded-[8px] text-tag text-label transition-[background-color,color,box-shadow] duration-200 aria-pressed:bg-surface aria-pressed:text-fg aria-pressed:shadow-[0_1px_2px_rgb(0_0_0/0.08),0_0_0_1px_rgb(0_0_0/0.04)]"
        >
          {m === "full" ? "Full story" : "Quick overview"}
        </button>
      ))}
    </div>
  );
}

/** How far apart the bar's names sit, centre to centre (px), on a 208 px bar: the neighbours land half out at its faded ends. */
const SLOT = 76;

/**
 * Where one name sits on the bar: the section you're in sharp in the middle, the one before and the one after blurred at the edges, the
 * rest out of sight. Moving to a section slides them all along together, so the old name blurs away as the new one comes into focus: one
 * name morphing into the next rather than two swapping (the blur bridges them). Transform, filter and opacity only, written on each name.
 */
function place(d: number): CSSProperties {
  const far = Math.abs(d);
  return {
    transform: `translate3d(${d * SLOT}px, 0, 0) scale(${far ? 0.84 : 1})`,
    filter: far ? `blur(${far === 1 ? 1.6 : 6}px)` : "none",
    opacity: far === 0 ? 1 : far === 1 ? 0.62 : 0,
  };
}

/**
 * The way round a case study, the same on every screen: it sits at the foot, under the thumb, in the site's own things: a small carved
 * stone to go back, and the black tag the first screen's stones wear, grown into a small bar. The bar shows only the section you're in,
 * with the one before and the one after blurred at its edges (Syed, 2026-11-22: "only the current section should be visible and it should
 * show the coming and previous one with blur and morph it"). Press a neighbour, or flick the bar on a phone, to go there. Press the one
 * you're in for the whole list and the switches, big words on the same soft blur as the home page's menu.
 */
function CaseNav({ status, mode }: { status: CaseStudy["status"]; mode: Mode }) {
  const all = useMemo(() => [{ id: "overview", label: "Overview" }, ...status.sections.map((l) => ({ id: l.href.slice(1), label: l.label }))], [status]);
  const active = useActiveSection(all.map((s) => s.id));
  // Only the stops the page is showing: the quick overview leaves some out.
  const [left, setLeft] = useState<string[]>([]);
  useEffect(() => setLeft(all.filter((s) => !document.getElementById(s.id)?.getClientRects().length).map((s) => s.id)), [all, mode]);
  const stops = all.filter((s) => !left.includes(s.id));
  const at = Math.max(0, stops.findIndex((s) => s.id === active));
  const [open, setOpen] = useState(false);
  const strip = useRef<HTMLElement>(null);
  const touch = useRef<{ x: number; t: number } | null>(null);

  // A flick along the bar goes one section that way: far enough, or fast enough (a quick flick needn't travel).
  const flick = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    if (Math.abs(dx) < 24 && Math.abs(dx) / (performance.now() - start.t) < 0.3) return;
    const to = stops[at + (dx < 0 ? 1 : -1)];
    if (!to) return;
    e.preventDefault(); // the tap under the finger doesn't also land
    strip.current?.querySelector<HTMLAnchorElement>(`a[href="#${to.id}"]`)?.click();
  };

  useEffect(warmEffects, []);

  // Nothing moves under the blur, so it only has to be worked out while it's arriving.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-hold", open);
    return () => document.documentElement.removeAttribute("data-hold");
  }, [open]);

  // The list shuts on Esc, which then doesn't also close the case study.
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
    };
    window.addEventListener("keydown", key, true);
    return () => window.removeEventListener("keydown", key, true);
  }, [open]);

  return (
    <div className="pnav" data-open={open || undefined}>
      <div className="pnav-blur" aria-hidden="true" />
      <div className="pnav-veil" onClick={() => setOpen(false)} aria-hidden="true" />
      <div id="pnav-list" className="pnav-panel" inert={!open}>
        <nav aria-label="On this page" className="pnav-list font-serif">
          {stops.map((s) => (
            <a key={s.id} href={`#${s.id}`} aria-current={s.id === active ? "location" : undefined} onClick={() => setOpen(false)}>
              {s.label}
            </a>
          ))}
        </nav>
        <ModeSwitch mode={mode} setMode={(m) => (setOpen(false), setMode(m))} className="pnav-mode" />
        <div className="pnav-foot">
          {status.links.slice(0, 1).map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener" className="smenu-out">
              {l.label} <Icon name="arrow-up-right" size={11} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ))}
          <SoundToggle className="hero-toggle" />
          <ThemeToggle plain className="hero-toggle" />
        </div>
      </div>
      <div className="pnav-dock">
        <PageLink href="/" className="pnav-back" aria-label="Back to the front page" data-stone="piece-back">
          {/* eslint-disable-next-line @next/next/no-img-element -- baked with its outline in alpha, shown small */}
          <img src="/stamps/piece-back.webp" alt="" width={216} height={271} decoding="async" draggable={false} />
        </PageLink>
        <div className="pnav-bar" onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, t: performance.now() })} onTouchEnd={flick}>
          <nav ref={strip} aria-label="Sections" className="pnav-strip">
            {stops.map((s, i) => {
              const d = i - at, here = d === 0, near = Math.abs(d) <= 1;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  style={place(d)}
                  aria-current={here ? "location" : undefined}
                  aria-expanded={here ? open : undefined}
                  aria-controls={here ? "pnav-list" : undefined}
                  aria-hidden={near ? undefined : true}
                  tabIndex={near ? undefined : -1}
                  data-near={near || undefined}
                  data-sound="switch"
                  onClick={(e) => {
                    if (here) {
                      e.preventDefault();
                      setOpen(!open);
                    } else setOpen(false);
                  }}
                >
                  {s.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}

/** It only takes the nav's own part of the study: everything a client component is given goes down the wire a second time. */
export function Panels({ status }: { status: CaseStudy["status"] }) {
  const [mode] = useMode();
  const nav = usePageNav();

  // The entry screen's button flips the mode; leaving the page clears it.
  useEffect(() => {
    const flip = () => setMode(document.documentElement.dataset.mode === "quick" ? "full" : "quick");
    addEventListener("case:mode", flip);
    return () => {
      removeEventListener("case:mode", flip);
      delete document.documentElement.dataset.mode;
    };
  }, []);

  // Esc closes the case study, unless something open takes it first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.querySelector("dialog[open], [role='dialog']")) nav("/");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nav reads what it needs when it's called
  }, []);

  return <CaseNav status={status} mode={mode} />;
}
