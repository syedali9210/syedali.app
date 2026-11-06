import media from "./media.json";
import type { CaseStudy, Picture } from "./types";
import { trace } from "./case-studies/trace";
import { animationEngine } from "./case-studies/animation-engine";
import { kiprun } from "./case-studies/kiprun";
import { kodex } from "./case-studies/kodex";
import { uniqkey } from "./case-studies/uniqkey";
import { animeSportsLeague } from "./case-studies/anime-sports-league";

/** In the order they're read; each page links on to the next. */
export const caseStudies: CaseStudy[] = [trace, animationEngine, kiprun, kodex, uniqkey, animeSportsLeague];

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
  for (const b of c.blocks)
    if (b.type === "gallery" && b.tabs && b.tabs.length !== b.pictures.length) throw new Error(`${c.slug}: a gallery has ${b.pictures.length} pictures but ${b.tabs.length} tabs`);
  const pictures = [
    c.cover,
    c.hero.picture,
    ...c.blocks.flatMap((b) =>
      "picture" in b ? [b.picture] : "pictures" in b ? b.pictures : b.type === "wireframes" && b.over ? [b.over] : [],
    ),
  ];
  pictures.forEach(sizeOf);
}

/** Width and height of a picture in public/, from media.json. */
export function sizeOf(p: Picture): { width: number; height: number } {
  const dims: number[] | undefined = (media as Record<string, number[]>)[p.src];
  if (!dims) throw new Error(`${p.src} isn't in media.json. Add the file to public/ and run npm run media.`);
  return { width: dims[0], height: dims[1] };
}
