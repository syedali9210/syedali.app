"use client";

import { useEffect, useState } from "react";
import { BODIES, hz, ROW, VOICES, type Voice } from "@/content/voices";

/* The site's sounds, made on the spot with Web Audio (no files): a small metal tick for every tap, a detent for the archive's
   tabs, the dust lifting and settling for the stage, and every stone's own tune under the hammer (content/voices.ts). Quiet by
   design, and one switch turns them all off (remembered). Nothing plays before the reader's first press. */
export type Cue = "tick" | "switch" | "open" | "close" | "case" | "deal" | "gather";

let ctx: AudioContext | null = null;
let out: GainNode;
let grain: AudioBuffer;

const muted = () => {
  try {
    return localStorage.getItem("sound") === "off";
  } catch {
    return false;
  }
};

function make() {
  if (ctx) return ctx;
  ctx = new AudioContext();
  out = ctx.createGain();
  out.gain.value = 0.7;
  out.connect(ctx.destination);
  grain = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = grain.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return ctx;
}

function audio() {
  const a = make();
  if (a.state === "suspended") void a.resume();
  return a;
}

/** Noise through a band-pass whose centre glides from f0 to f1: a click's contact, or the dust's hiss. */
function hiss(a: AudioContext, t: number, len: number, rise: number, peak: number, f0: number, f1: number, q: number) {
  const src = a.createBufferSource();
  src.buffer = grain;
  const band = a.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = q;
  band.frequency.setValueAtTime(f0, t);
  band.frequency.exponentialRampToValueAtTime(f1, t + len);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + rise);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  src.connect(band).connect(g).connect(out);
  src.start(t, Math.random() * 0.4);
  src.stop(t + len + 0.02);
}

/** A sine that sinks a little as it dies: a click's body, or one partial of struck metal. */
function tone(a: AudioContext, t: number, len: number, peak: number, f0: number, f1: number) {
  const o = a.createOscillator();
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + len);
  const g = a.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(peak, t + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  o.connect(g).connect(out);
  o.start(t);
  o.stop(t + len + 0.02);
}

/**
 * One blow on a stone: the hammer's knock, then the note in that rock's partials. Lower notes are lifted a little, since a laptop's speakers
 * and the ear both give them less. Never quite the same twice (a few cents, a little weight), so a tune doesn't sound like a sample, but always
 * in tune. A press has the hammer's full weight: louder, longer, with the octave under the note.
 */
function ring(a: AudioContext, t: number, note: string, voice: Voice, hard = false) {
  const { ring: partials, knock } = BODIES[voice.body];
  const f = hz(note) * (1 + (Math.random() - 0.5) * 0.005);
  const level = (1100 / f) ** 0.35 * (0.92 + Math.random() * 0.16) * (hard ? 1.45 : 1);
  hiss(a, t, knock[0], 0.001, knock[1] * (hard ? 1.25 : 1), knock[2], knock[3], knock[4]);
  for (const [r, p, len] of partials) tone(a, t, len * (hard ? 1.2 : 1), p * level, f * r, f * r * 0.996);
  if (hard) tone(a, t, partials[0][2] * 1.2, partials[0][1] * 0.5 * level, f / 2, (f / 2) * 0.996);
}

/** A stone struck: n is which blow of the hammer, so which note of its tune. Without it, a press, on the tune's last note. */
export function strike(stone: string, n?: number) {
  if (typeof AudioContext === "undefined" || muted()) return;
  const voice = VOICES[stone];
  if (!voice) return sound("tick");
  const a = audio();
  const { tune } = voice;
  ring(a, a.currentTime + 0.004, tune[n === undefined ? tune.length - 1 : n % tune.length], voice, n === undefined);
}

export function sound(cue: Cue) {
  if (typeof AudioContext === "undefined" || muted()) return;
  const a = audio();
  const t = a.currentTime + 0.004;
  if (cue === "tick") {
    hiss(a, t, 0.02, 0.002, 0.16, 4200, 2600, 1.4);
    tone(a, t, 0.03, 0.045, 1450, 700);
  } else if (cue === "switch") {
    hiss(a, t, 0.016, 0.002, 0.12, 3400, 2200, 1.6);
    hiss(a, t + 0.028, 0.016, 0.002, 0.08, 2600, 1800, 1.6);
    tone(a, t, 0.03, 0.035, 1100, 600);
  } else if (cue === "open") {
    hiss(a, t, 0.75, 0.2, 0.1, 700, 3200, 0.9);
  } else if (cue === "close") {
    hiss(a, t, 0.85, 0.12, 0.09, 3000, 600, 0.9);
  } else if (cue === "deal" || cue === "gather") {
    // The stones lining up, or going back: each in turn on its first note, a run up the scale, or down it.
    (cue === "deal" ? ROW : [...ROW].reverse()).forEach((stone, i) => ring(a, t + i * 0.06, VOICES[stone].tune[0], VOICES[stone]));
  } else {
    // A jewel case: the hollow knock of the plastic, then the hinge's click.
    hiss(a, t, 0.035, 0.001, 0.2, 1700, 1100, 3.5);
    tone(a, t, 0.05, 0.045, 820, 460);
    hiss(a, t + 0.032, 0.02, 0.001, 0.13, 3300, 2500, 2.5);
  }
}

/**
 * A hammer blow on a rock, which comes from a hover. A browser holds all sound back until the reader's first press, and a blow played
 * into a sleeping context would wait there and land with all the others on that press, so before then a blow is silent.
 */
export function hammer(stone: string, n: number) {
  if (ctx?.state === "running") strike(stone, n);
}

/**
 * Every tap anywhere sounds, not only on links and buttons: a mouse on the press, like a real switch; a finger on the lift, so
 * a scroll, which cancels the touch, stays quiet; a key on the click it makes. data-sound picks another cue, or "none".
 * A stone (.stamp) answers in its own voice, and so does anything marked data-stone: a word or a row that goes to that stone's page.
 * data-stone-hover sounds it when pointed at as well, where pointing brings the stone up.
 */
export function Sound() {
  useEffect(() => {
    // Inside an archive animation's frame: those have no sound of their own, and a second audio context would stall the page opening it.
    if (window.parent !== window) return;
    let finger: { id: number; x: number; y: number; t: number } | null = null;
    const play = (t: EventTarget | null) => {
      const at = t instanceof Element ? t : null;
      const el = at?.closest<HTMLElement>("a[href], button, [data-sound], [data-stone]");
      if (el?.matches(":disabled") || el?.dataset.sound === "none") return;
      const stone = el?.dataset.stone ?? at?.closest<HTMLElement>(".stamp")?.dataset.slug;
      if (stone) strike(stone);
      else sound((el?.dataset.sound as Cue | undefined) ?? "tick");
    };
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !(e.target instanceof Element)) return;
      const el = e.target.closest<HTMLElement>("[data-stone-hover]");
      if (el && !el.contains(e.relatedTarget as Node | null)) hammer(el.dataset.stone!, 0);
    };
    const down = (e: PointerEvent) => {
      if (!e.isPrimary) return;
      if (e.pointerType !== "mouse") finger = { id: e.pointerId, x: e.clientX, y: e.clientY, t: e.timeStamp };
      // Not on the page's own scrollbar, which is outside this box.
      else if (e.button === 0 && e.clientX < document.documentElement.clientWidth && e.clientY < document.documentElement.clientHeight) play(e.target);
    };
    const up = (e: PointerEvent) => {
      if (e.pointerId !== finger?.id) return;
      const tap = Math.hypot(e.clientX - finger.x, e.clientY - finger.y) < 10 && e.timeStamp - finger.t < 700;
      finger = null;
      if (tap) play(e.target);
    };
    const cancel = () => (finger = null);
    // A pointer's click has already sounded; a key's has a detail of 0.
    const click = (e: MouseEvent) => {
      if (e.detail === 0) play(e.target);
    };
    // iOS only lets audio wake on the touch's own end.
    const wake = () => {
      if (ctx?.state === "suspended" && !muted()) void ctx.resume();
    };
    addEventListener("pointerdown", down, true);
    addEventListener("pointerover", over, { capture: true, passive: true });
    addEventListener("pointerup", up, true);
    addEventListener("pointercancel", cancel, true);
    addEventListener("click", click, true);
    addEventListener("touchend", wake, { capture: true, passive: true });
    // Making the context opens the audio device, which holds the page for 0.2 to 0.75 s on Windows; made on the first
    // press, that was the stall before anything opened. So it's made just after the fonts are in (on the home page the
    // preloader's lines are drawing then, off the page's thread), asleep, and a press only wakes it (about 3 ms).
    if (typeof AudioContext !== "undefined") document.fonts.ready.then(() => setTimeout(() => muted() || make(), 150));
    return () => {
      removeEventListener("pointerdown", down, true);
      removeEventListener("pointerover", over, true);
      removeEventListener("pointerup", up, true);
      removeEventListener("pointercancel", cancel, true);
      removeEventListener("click", click, true);
      removeEventListener("touchend", wake, true);
    };
  }, []);
  return null;
}

/** The one switch for all of it, beside the theme switch. Turning it on answers with a press. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const sync = () => setOn(!muted());
    sync();
    addEventListener("soundchange", sync);
    return () => removeEventListener("soundchange", sync);
  }, []);
  const flip = () => {
    try {
      localStorage.setItem("sound", on ? "off" : "on");
    } catch {}
    setOn(!on);
    dispatchEvent(new Event("soundchange"));
    if (!on) sound("tick");
  };
  return (
    <button type="button" role="switch" aria-checked={on} aria-label="Sound" data-sound="none" onClick={flip} className={className}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
        <path d="M3.5 9.5h3L11 6v12l-4.5-3.5h-3z" />
        {on ? <path d="M15 9.5a3.5 3.5 0 0 1 0 5M17.6 7a7 7 0 0 1 0 10" /> : <path d="m15.5 9.5 5 5m0-5-5 5" />}
      </svg>
    </button>
  );
}
