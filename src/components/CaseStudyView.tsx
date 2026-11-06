import Image from "next/image";
import type { CSSProperties } from "react";
import { nextAfter, sizeOf } from "@/content";
import type { Block, CaseStudy } from "@/content/types";
import { BlockView } from "./Blocks";
import { FullFrame } from "./FullFrame";
import { Hero } from "./Hero";
import { PageLink } from "./PageLink";
import { RevealObserver } from "./motion";
import { Panels } from "./Panels";
import { Paper } from "./Paper";
import { SmoothScroll } from "./SmoothScroll";

type Group = { kind: "card" | "film" | "frame"; blocks: Block[] };

/**
 * Parts follow the sections: each section starts one and keeps the blocks after it. A film stands alone; the
 * device-and-wireframes block opens out to the full screen, taking the section right before it as its heading.
 */
function group(blocks: Block[]) {
  const out: Group[] = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (b.type === "immersive") out.push({ kind: "film", blocks: [b] });
    else if (b.type === "wireframes") {
      if (last?.kind === "card" && last.blocks.length === 1 && last.blocks[0].type === "section") {
        last.kind = "frame";
        last.blocks.push(b);
      } else out.push({ kind: "frame", blocks: [b] });
    } else if (b.type === "section" || !last || last.kind !== "card") out.push({ kind: "card", blocks: [b] });
    else last.blocks.push(b);
  }
  return out;
}

/** Every block but a section says whether it belongs to the quick overview; the CSS hides the rest in that mode. */
const tag = (b: Block) => (b.type === "section" ? {} : b.quick ? { "data-quick": "" } : { "data-full": "" });

/**
 * Widths, as in the reference (Rachel Chen's case studies): everything you read, tables included, keeps one 688 px
 * column with one left edge; pictures, films and figures take a 923 px column centred on it, a little wider each side.
 */
const TEXT = "col mx-auto w-full max-w-[calc(var(--measure)+2*var(--gutter))] px-[var(--gutter)]";
const WIDE = "col mx-auto w-full max-w-[calc(var(--wide)+2*var(--gutter))] px-[var(--gutter)]";
const PICTURES = ["media", "gallery", "showcase", "image", "system"];
const widthOf = (b: Block) => (PICTURES.includes(b.type) ? `${WIDE} enter` : TEXT);

/**
 * A case study as one quiet page (the layout Syed pointed at: Rachel Chen's, with a little of Bill Guo's): the entry
 * plate and title, then the story in one column, chapters marked by a hairline with their name in its middle, the
 * way round it in the bar at the foot, and the next case study at the end.
 */
export function CaseStudyView({ study }: { study: CaseStudy }) {
  const next = nextAfter(study.slug);
  const t = study.theme;
  const theme = { "--deep": t.deep, "--mid": t.mid, "--light": t.light, "--hl": t.highlight } as CSSProperties;

  return (
    <div style={theme} className="case min-h-svh overflow-x-clip bg-sheet">
      <Paper />
      <RevealObserver />
      <SmoothScroll />
      <Panels status={study.status} />

      {/* A constant soft blur along the bottom edge: the page dissolves into it as it scrolls. */}
      <div className="bottom-blur pointer-events-none fixed inset-x-0 bottom-0 z-20" aria-hidden="true">
        <div />
        <div />
        <div />
      </div>

      <article className="relative z-[2] pb-[var(--page-end)]">
        <Hero study={study} />

        <div className="story relative">
          {/* The quick overview's three lines, only in that mode. */}
          <section data-only="quick" data-quick className="part" aria-label="Quick overview">
            <dl className={`${TEXT} grid gap-group`}>
              {(
                [
                  ["The problem", study.quick.problem],
                  ["What I did", study.quick.approach],
                  ["The result", study.quick.result],
                ] as const
              ).map(([label, text]) => (
                <div key={label}>
                  <dt className="font-serif text-statement text-ink">{label}</dt>
                  <dd className="mt-note text-copy text-body">{text}</dd>
                </div>
              ))}
            </dl>
          </section>

          {group(study.blocks).map((g, n) => {
            if (g.kind === "film")
              return (
                <div key={n} {...tag(g.blocks[0])} className={`part ${WIDE}`}>
                  <BlockView block={g.blocks[0]} />
                </div>
              );
            if (g.kind === "frame") {
              const wire = g.blocks[g.blocks.length - 1];
              const head = g.blocks.length > 1 ? g.blocks[0] : null;
              return (
                <div key={n} {...tag(wire)} className={`part ${WIDE}`}>
                  <div>
                    <FullFrame className="frame-plate">
                      <div className="ml-[var(--col-l,0px)] w-[var(--col-w,100%)] py-[var(--pad-y)]">
                        {head && (
                          <div className="mb-lead px-[var(--pad-x)]">
                            <BlockView block={head} center />
                          </div>
                        )}
                        <BlockView block={wire} />
                      </div>
                    </FullFrame>
                  </div>
                </div>
              );
            }
            return (
              <section key={n} className="part flex flex-col gap-block">
                {g.blocks.map((b, k) => (
                  <div key={k} {...tag(b)} className={`relative min-w-0 ${widthOf(b)}`}>
                    <BlockView block={b} />
                  </div>
                ))}
              </section>
            );
          })}

          {/* Up next (Bill Guo's ending): the chapter rule, then the next case study as its card. */}
          <div className={`part pb-0 ${TEXT}`}>
            {study.closing && (
              <div data-reveal className="mx-auto mb-block max-w-[560px] text-center">
                <p className="font-serif text-statement text-ink">{study.closing[0]}</p>
                <p className="mt-note text-copy text-body">{study.closing[1]}</p>
              </div>
            )}
            <p className="eyebrow">
              Up next
              <span className="eyebrow-rule" aria-hidden="true" />
            </p>
            <PageLink href={`/work/${next.slug}`} data-cursor="View project" data-stone={next.slug} className="group mx-auto block max-w-[460px]">
              <span className="work-media block aspect-[16/10]" data-fly="screen" style={{ "--tint": next.theme.mid } as CSSProperties}>
                <Image quality={90} src={next.cover.src} alt="" {...sizeOf(next.cover)} sizes="460px" className="work-shot" />
              </span>
              <span className="mt-caption flex items-baseline gap-note text-copy">
                <span className="text-ink">{next.title}</span>
                <span className="text-ink/25">/</span>
                <span className="text-label">
                  {next.kind} {next.year}
                </span>
              </span>
            </PageLink>
          </div>
        </div>
      </article>
    </div>
  );
}
