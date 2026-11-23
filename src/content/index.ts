import media from "./media.json";
import type { CaseStudy, Picture } from "./types";
import { trace } from "./case-studies/trace";
import { videoEngine } from "./case-studies/video-engine";
import { kiprun } from "./case-studies/kiprun";
import { kodex } from "./case-studies/kodex";
import { uniqkey } from "./case-studies/uniqkey";
import { animeSportsLeague } from "./case-studies/anime-sports-league";

/**
 * media.json: [width, height] for every picture, and a case study picture's own colour third. Up here, above the checks below:
 * they run as the module loads, and a const declared after them isn't there yet.
 */
type Entry = [number, number] | [number, number, string];
const table = media as unknown as Record<string, Entry>;

/** In the order they're read; each page links on to the next. */
export const caseStudies: CaseStudy[] = [videoEngine, trace, kiprun, kodex, uniqkey, animeSportsLeague];

export const getCaseStudy = (slug: string) => caseStudies.find((c) => c.slug === slug);

export const nextAfter = (slug: string) => {
  const i = caseStudies.findIndex((c) => c.slug === slug);
  return caseStudies[(i + 1) % caseStudies.length];
};

// Runs on every build and page load: a missing picture, a duplicate id or a link to nowhere stops the build.
for (const c of caseStudies) {
  const ids = c.blocks.flatMap((b) => ("id" in b && b.id ? [b.id] : []));
  const dupe = ids.find((id, n) => ids.indexOf(id) !== n);
  if (dupe) throw new Error(`${c.slug}: the id "${dupe}" is used twice`);
  for (const l of c.status.sections)
    if (!ids.includes(l.href.slice(1))) throw new Error(`${c.slug}: "${l.label}" links to ${l.href}, which isn't on the page`);
  for (const l of c.status.links) if (!l.href.startsWith("https://")) throw new Error(`${c.slug}: "${l.label}" isn't a public https link`);
  for (const b of c.blocks) {
    // The feedback was "too text heavy": a chapter says it in a couple of lines and lets a screen do the rest.
    const words = b.type === "section" ? b.body.join(" ").split(/\s+/).filter(Boolean).length : 0;
    if (words > 45) throw new Error(`${c.slug}: the "${b.type === "section" && b.id}" chapter runs ${words} words; keep it to 45 and let a screen say the rest`);
  }
  const pictures = [
    c.cover,
    c.hero.picture,
    ...c.blocks.flatMap((b) =>
      "picture" in b
        ? [b.picture]
        : "pictures" in b
          ? b.pictures
          : b.type === "versions"
            ? b.items.map((v) => v.poster)
            : b.type === "steps"
              ? b.items.map((s) => s.picture)
              : b.type === "wireframes" && b.over
                ? [b.over]
                : [],
    ),
  ];
  pictures.forEach(sizeOf);
  // A screen in both themes swaps in place when the theme does, so its two captures must be the same size or the page jumps.
  for (const p of pictures) {
    if (!p.dark) continue;
    const [a, d] = [sizeOf(p), sizeOf({ ...p, src: p.dark })];
    if (a.width !== d.width || a.height !== d.height) throw new Error(`${p.dark} is ${d.width}×${d.height}, not ${a.width}×${a.height} like ${p.src}`);
  }
  // A chapter told in screens shows three or four of them (Syed: "3-4 screens that belong to that part"), never a lone one.
  for (const b of c.blocks)
    if (b.type === "steps" && (b.items.length < 2 || b.items.length > 4)) throw new Error(`${c.slug}: a steps block shows 2 to 4 screens, not ${b.items.length}`);
}

/** Width and height of a picture in public/, from media.json. */
export function sizeOf(p: Picture): { width: number; height: number } {
  const dims = table[p.src];
  if (!dims) throw new Error(`${p.src} isn't in media.json. Add the file to public/ and run npm run media.`);
  return { width: dims[0], height: dims[1] };
}

/** A case study picture's own colour, painted behind it while it loads (npm run media reads it). */
export const toneOf = (src: string) => table[src]?.[2];
