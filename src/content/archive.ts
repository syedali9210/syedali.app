import { caseStudies } from ".";
import { PLACES } from "./places";
import type { Picture } from "./types";
import { VOICES } from "./voices";

export type ArchiveKind = "animation" | "motion" | "web" | "product" | "photos";

/** One thing in the archive: what's drawn on its node, and what opens on the stage (a live figure, a film, a picture). */
export type ArchiveItem = {
  id: string;
  kind: ArchiveKind;
  title: string;
  note: string;
  year: string;
  picture: Picture;
  video?: string;
  figure?: string;
  href?: string;
};

const fig = (id: string, title: string, note: string): ArchiveItem => ({
  id, kind: "animation", title, note, year: "2026", picture: { src: `/archive/${id}.webp`, alt: title }, figure: `/archive/${id}`,
});
const film = (id: string, title: string, note: string, dir: string, name: string, href: string): ArchiveItem => ({
  id, kind: "motion", title, note, year: "2026", picture: { src: `/case-studies/${dir}/${name}-poster.webp`, alt: title }, video: `/case-studies/${dir}/${name}.mp4`, href,
});

/** The branches, in the order they hang from the root. Photos has nothing in it yet, and says so. */
export const ARCHIVE_KINDS: { kind: ArchiveKind; label: string }[] = [
  { kind: "animation", label: "Animation" },
  { kind: "motion", label: "Motion" },
  { kind: "web", label: "Web" },
  { kind: "product", label: "Product" },
  { kind: "photos", label: "Photos" },
];

export const archive: ArchiveItem[] = [
  fig("maze-walk", "Maze Walk", "A pixel pet walking an isometric maze. Steer it with the arrow keys."),
  fig("hello", "Hello", "A small mascot by its sign, watching your pointer and waving back."),
  fig("tab-hop", "Tab Hop", "The mascot leaps from tab to tab as you switch."),
  fig("notch-card", "Info Notch Card", "A MacBook notch that opens into a business card."),
  fig("scratch-card", "Scratch Card", "A foil card to scratch off, after Framer University's Image Scratch."),
  fig("nav-scrubber", "Nav Scrubber", "A nav you hold and drag, one place at a time."),
  fig("chat-quiz", "Chat Quiz", "An AI composer that asks its questions before it helps."),
  film("trace-launch", "Trace launch film", "Made with Animation Engine.", "trace", "launch", "/work/trace"),
  film("engine-launch", "Animation Engine launch film", "Exported from its own Studio.", "animation-engine", "engine-launch", "/work/animation-engine"),
  film("kiprun-film", "KIPRUN launch film", "48 seconds, made for the page.", "kiprun", "site-film", "/work/kiprun"),
  film("trace-ui", "Trace, recorded", "A project's timeline, its screens and its checks.", "trace", "trace-ui", "/work/trace"),
  ...caseStudies.map((c) => ({
    id: c.slug,
    kind: (c.kind === "Product" ? "product" : "web") as ArchiveKind,
    title: c.title,
    note: c.tagline.replace(/==/g, ""),
    year: c.year,
    picture: c.cover,
    href: `/work/${c.slug}`,
  })),
];

// Runs on every build: a stone with no voice, or two stones playing one tune, stops it.
for (const stone of [...caseStudies.map((c) => c.slug), ...archive.map((a) => `piece-${a.id}`), ...PLACES.map((p) => p.stone), "piece-menu", "piece-back"])
  if (!VOICES[stone]) throw new Error(`${stone} has no voice: add one to content/voices.ts`);
const tunes = Object.entries(VOICES).map(([stone, v]) => [stone, v.tune.join(" ")]);
for (const [stone, tune] of tunes)
  if (tunes.some(([other, t]) => other !== stone && t === tune)) throw new Error(`${stone} shares its tune, ${tune}, with another stone`);
