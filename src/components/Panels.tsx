"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CaseStudy } from "@/content/types";
import { Icon } from "./Icon";
import { useActiveSection } from "./motion";
import { PageLink, usePageNav } from "./PageLink";
import { still } from "./scroll";
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

/**
 * The way round a case study, the same on every screen: it sits at the foot, under the thumb, in the site's own things: a carved stone to go
 * back, and the black tag the first screen's stones wear, grown into a bar. The bar names the section you're in, with the next one coming in
 * at its edge and a tick for each. Press a name, or swipe the bar on a phone, to go there. Press the one you're in for the whole list and the
 * switches, big words on the same soft blur as the home page's menu.
 */
function CaseNav({ status, mode }: { status: CaseStudy["status"]; mode: Mode }) {
  const all = useMemo(() => [{ id: "overview", label: "Overview" }, ...status.sections.map((l) => ({ id: l.href.slice(1), label: l.label }))], [status]);
  const active = useActiveSection(all.map((s) => s.id));
  // Only the stops the page is showing: the quick overview leaves some out.
  const [left, setLeft] = useState<string[]>([]);
  useEffect(() => setLeft(all.filter((s) => !document.getElementById(s.id)?.getClientRects().length).map((s) => s.id)), [all, mode]);
  const stops = all.filter((s) => !left.includes(s.id));
  const at = stops.findIndex((s) => s.id === active);
  const [open, setOpen] = useState(false);
  const strip = useRef<HTMLDivElement>(null);
  const swiping = useRef(false);

  // The one you're in stays in the middle of the bar.
  useEffect(() => {
    const s = strip.current!, a = s.children[at] as HTMLElement | undefined;
    if (a && !swiping.current) s.scrollTo({ left: a.offsetLeft - (s.clientWidth - a.offsetWidth) / 2, behavior: still() ? "auto" : "smooth" });
  }, [at]);

  // A swipe along the bar goes to the name it comes to rest on. (The scroll's own end event isn't in every phone's browser yet.)
  useEffect(() => {
    const s = strip.current!;
    let touching = false, timer = 0;
    const settle = () => {
      swiping.current = false;
      const mid = s.scrollLeft + s.clientWidth / 2, middle = (a: HTMLElement) => Math.abs(a.offsetLeft + a.offsetWidth / 2 - mid);
      const near = ([...s.children] as HTMLElement[]).reduce((a, b) => (middle(b) < middle(a) ? b : a));
      if (!near.hasAttribute("aria-current")) near.click();
    };
    const wait = () => {
      clearTimeout(timer);
      timer = window.setTimeout(settle, 140);
    };
    const down = () => {
      touching = true;
      clearTimeout(timer);
    };
    const move = () => void (swiping.current = true);
    const up = () => {
      touching = false;
      if (swiping.current) wait();
    };
    const scrolled = () => {
      if (swiping.current && !touching) wait();
    };
    s.addEventListener("touchstart", down, { passive: true });
    s.addEventListener("touchmove", move, { passive: true });
    s.addEventListener("touchend", up, { passive: true });
    s.addEventListener("touchcancel", up, { passive: true });
    s.addEventListener("scroll", scrolled, { passive: true });
    return () => {
      clearTimeout(timer);
      s.removeEventListener("touchstart", down);
      s.removeEventListener("touchmove", move);
      s.removeEventListener("touchend", up);
      s.removeEventListener("touchcancel", up);
      s.removeEventListener("scroll", scrolled);
    };
  }, []);

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
        <div className="pnav-bar">
          <nav ref={strip} aria-label="Sections" className="pnav-strip">
            {stops.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={s.id === active ? "location" : undefined}
                aria-expanded={s.id === active ? open : undefined}
                aria-controls={s.id === active ? "pnav-list" : undefined}
                data-sound="switch"
                onClick={(e) => {
                  if (s.id === active) {
                    e.preventDefault();
                    setOpen(!open);
                  } else setOpen(false);
                }}
              >
                {s.label}
              </a>
            ))}
          </nav>
          <span className="pnav-ticks" aria-hidden="true">
            {stops.map((s, i) => (
              <i key={s.id} data-on={i === at || undefined} data-past={i < at || undefined} />
            ))}
          </span>
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
