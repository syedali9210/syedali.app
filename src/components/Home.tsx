import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { caseStudies, sizeOf } from "@/content";
import { PLACES } from "@/content/places";
import { Contact } from "./Contact";
import { Cursor } from "./Cursor";
import { Dome } from "./Dome";
import { EARLY } from "./early";
import { InkWord } from "./InkWord";
import { PageLink } from "./PageLink";
import { Loop } from "./Loop";
import { Paper } from "./Paper";
import { Clock, Peek } from "./Peek";
import { Preloader } from "./Preloader";
import { SoundToggle } from "./Sound";
import { StampTrigger, Stamps } from "./Stamps";
import { StoneMenu } from "./StoneMenu";
import { ThemeToggle } from "./ThemeToggle";
import { WorkFilter } from "./WorkFilter";

const FRAME = "px-[clamp(16px,2.6vw,40px)]";
const label = "font-mono text-[11px] leading-4 tracking-[0.08em] uppercase";
const b = (n: number) => ({ "--b": n }) as CSSProperties;

/**
 * The work section's rows, in order. side: which side its details are on; a wide row runs the full width with its one line big
 * under it. win: its screen or film on the field: centre x, centre y and width, % of the field.
 */
const ROWS: { slug: string; side: "r" | "l" | "wide-r" | "wide-l"; win: [number, number, number] }[] = [
  { slug: "trace", side: "r", win: [50, 50, 74] },
  { slug: "animation-engine", side: "l", win: [50, 50, 74] },
  { slug: "kiprun", side: "wide-r", win: [50, 50, 46] },
  { slug: "kodex", side: "r", win: [50, 50, 74] },
  { slug: "uniqkey", side: "l", win: [50, 50, 74] },
  { slug: "anime-sports-league", side: "wide-l", win: [50, 50, 46] },
];

/**
 * One project: its film or its screen floating on a dithered field in its own inks (scripts/stamps/fields.py), and beside it a
 * panel with what it is, what he did on it and what came of it. The whole row is the link; the pointer says "View project".
 */
function Work({ slug, side, win }: (typeof ROWS)[number]) {
  const study = caseStudies.find((c) => c.slug === slug)!;
  const fact = (...labels: string[]) => study.meta.find((m) => labels.includes(m.label))?.value;
  const who = fact("Client", "Studio")?.split(",")[0];
  const shot = sizeOf(study.cover);
  const line = study.tagline.replaceAll("==", "");
  return (
    <li data-reveal className="wk-row" data-side={side} data-kind={study.kind} data-fly-scope>
      <div className="wk-media">
        {/* eslint-disable-next-line @next/next/no-img-element -- hard-edged dots, a few kB, shown as they were baked */}
        <img className="wk-field" src={`/stamps/field-${slug}.webp`} alt="" loading="lazy" decoding="async" draggable={false} />
        <div className="wk-window" data-fly="screen" style={{ "--x": `${win[0]}%`, "--y": `${win[1]}%`, "--w": `${win[2]}%`, aspectRatio: study.card ? "16 / 9" : `${shot.width} / ${shot.height}` } as CSSProperties}>
          {study.card ? <Loop src={study.card.video} poster={study.card.poster} className="wk-shot" /> : <Image quality={90} src={study.cover.src} alt="" {...shot} sizes="(min-width: 1024px) 44vw, 70vw" className="wk-shot" {...EARLY} />}
        </div>
      </div>
      {side.startsWith("wide") && <p className="wk-claim font-serif">{line}</p>}
      <div className="wk-panel">
        <h3 className="wk-name font-serif">
          {/* eslint-disable-next-line @next/next/no-img-element -- the hero's own rock, already loaded, its outline in alpha */}
          <img className="wk-mark" data-fly="stone" src={`/stamps/${slug}-sm.webp`} alt="" width={512} height={641} loading="lazy" decoding="async" draggable={false} />
          {study.title}
        </h3>
        <p className="wk-kicker">
          {study.kind} · {study.year}
          {who ? ` · ${who}` : ""}
        </p>
        <p className="wk-line font-serif">{line}</p>
        <dl className="wk-facts">
          <div>
            <dt>What I did</dt>
            <dd>{fact("Role")}</dd>
          </div>
          <div>
            <dt>Result</dt>
            <dd>{study.quick.result}</dd>
          </div>
        </dl>
        <p className="wk-go">
          Read the case study <span aria-hidden="true">→</span>
        </p>
      </div>
      <PageLink href={`/work/${slug}`} className="wk-link" aria-label={`${study.title}: read the case study`} data-cursor="View project" data-stone={slug} />
    </li>
  );
}

const MENU = "relative inline-flex h-[28.5px] w-fit items-center font-serif text-[19px] text-fg";

/** The menu: a column on the first screen's grid. Point at a word and its page's stone comes up beside it; press it and the stone flies there. */
function Menu() {
  return (
    <nav aria-label="Main" className="flex flex-wrap gap-x-text lg:flex-col">
      <a href="#work" className={`${MENU} italic`}>
        <InkWord text="Work" />
      </a>
      {PLACES.map((p) => (
        <PageLink key={p.href} href={p.href} className={MENU} preload={`/stamps/${p.stone}.webp`} data-stone={p.stone} data-stone-hover="">
          <InkWord text={p.word} />
          {/* eslint-disable-next-line @next/next/no-img-element -- a small stone, shown as the word is pointed at; pressed, it flies to its page */}
          <img className="menu-stone" data-fly="stone" data-land-from={p.href} src={`/stamps/${p.stone}-icon.webp`} alt="" width={216} height={271} loading="lazy" decoding="async" draggable={false} />
        </PageLink>
      ))}
    </nav>
  );
}

/** A project named in the profile, tinted in its own colour; point at it and its picture floats beside the pointer (Peek). */
function Chip({ slug, children }: { slug: string; children: ReactNode }) {
  const c = caseStudies.find((s) => s.slug === slug)!;
  return (
    <PageLink href={`/work/${slug}`} data-peek={c.cover.src} data-stone={slug} className="chip" style={{ "--c": c.theme.mid } as CSSProperties}>
      {children}
    </PageLink>
  );
}

/**
 * The portfolio's front page. The first screen is on Bill Guo's grid: the name and what he does, the menu and how to reach
 * him, then far to the right the stamps' switch, a profile and what's on now; the line set big at the foot; and every project
 * a perforated stamp scattered at depth (Stamps), that lifts and turns to metal when pointed at. The work follows as rows of
 * screens on dithered fields beside their details. The archive, the experience and the about have their own pages. The page is paper (Paper), the pointer is drawn in the
 * accent (Cursor), and the first screen loads as its own scaffold (Preloader). On a phone the first screen runs name, line, profile and
 * now down the page, then the stones in an arc beside the Work card, and the menu is a stone in the corner (StoneMenu).
 */
export function Home() {
  return (
    <div className="home relative min-h-svh overflow-x-clip bg-sheet">
      <Paper />
      <Preloader />
      <Peek />
      <Cursor />

      <main className="relative z-[2]">
        <StoneMenu />
        {/* The first screen, on Bill Guo's grid. */}
        <section id="top" className="hero relative">
          <div className="hero-top">
            <div data-boot style={b(0)} className="hero-id">
              <a href="#top" className={`${label} text-fg`}>
                <span aria-hidden="true">✦ </span>Syed Ali
              </a>
              <p className={`${label} mt-caption max-w-[110px] text-body max-lg:hidden`}>Product designer &amp; design engineer</p>
            </div>
            <div data-boot style={b(1)} className="hero-menu">
              <p className={`${label} text-label/60 max-lg:hidden`}>Menu</p>
              <div className="lg:mt-caption">
                <Menu />
              </div>
            </div>
            <div data-boot style={b(1)} className="hero-contact">
              <p className={`${label} text-label/60`}>Contact</p>
              <Contact className="flex flex-col items-start gap-note" linkClass={`${label} inline-flex items-center gap-label text-fg underline-offset-4 hover:underline`} />
            </div>
            <div data-boot style={b(2)} className="hero-stamps">
              <p className={`${label} text-label/60`}>Stamps</p>
              <div className="mt-caption max-lg:mt-note">
                <StampTrigger />
              </div>
              <div className="mt-lead flex gap-note max-lg:mt-0 max-lg:ml-auto">
                <SoundToggle className="hero-toggle" />
                <ThemeToggle plain className="hero-toggle" />
              </div>
            </div>
            <h1 data-boot style={b(2)} className="hero-line font-serif text-fg">
              <span>Designing products,</span> <span>and building them down</span> <span>to the last frame.</span>
            </h1>
            <div data-boot style={b(3)} className="hero-profile">
              <p className={`${label} text-label/60`}>Profile</p>
              <p className="mt-caption text-small text-body max-lg:mt-note">
                I&apos;m Syed Ali <span className="font-serif text-[15px] whitespace-nowrap text-label italic">/sai-yed&ensp;ah-lee/</span>, a product designer and design engineer.
              </p>
              <p className="mt-text text-small text-body max-lg:mt-note">
                I start from the problem, design the product and build it in code: tools of my own, like <Chip slug="trace">Trace</Chip> and <Chip slug="animation-engine">Animation Engine</Chip>, and sites for{" "}
                <Chip slug="kiprun">Decathlon</Chip> and <Chip slug="kodex">Basenine&apos;s clients</Chip>.
              </p>
            </div>
            <div data-boot style={b(4)} className="hero-now">
              <p className={`${label} text-label/60`}>Now</p>
              <p className="mt-caption text-small text-body max-lg:mt-note">Building Trace and Animation Engine.</p>
              <p className="mt-text flex items-center gap-note text-small text-body max-lg:mt-note">
                <span className="live-dot relative size-1.5 shrink-0 rounded-full bg-live" aria-hidden="true" />
                Open to design engineer roles
              </p>
              <p className={`${label} mt-text text-label max-lg:mt-note`}>
                Bengaluru · <Clock />
              </p>
            </div>
          </div>

          <div data-boot style={b(4)} className="hero-field">
            <Stamps items={caseStudies.map(({ slug, title, kind, year, summary, meta }) => ({ slug, title, kind, year, summary, who: meta.find((m) => m.label === "Client" || m.label === "Studio")?.value.split(",")[0] }))} />
            <p className={`${label} hero-tag hero-tag-products text-label/60`} aria-hidden="true">
              Products
            </p>
            <p className={`${label} hero-tag hero-tag-sites text-label/60`} aria-hidden="true">
              Websites
            </p>
            <p className={`${label} hero-tag hero-tag-scroll text-body`} aria-hidden="true">
              Scroll <span>↓</span> for work
            </p>
            <a href="#work" className="hero-card">
              <span className="font-mono text-[9px] leading-none tracking-[0.08em] text-label uppercase">View all →</span>
              <span className="mt-note block font-serif text-[72px] leading-[1.1] tracking-[-0.02em] text-fg">Work</span>
              <span className="mt-label block max-w-[170px] text-[12px] leading-[1.35] text-body">Six projects: two tools of my own and four client sites.</span>
            </a>
          </div>
        </section>

        {/* The work inside Abhijit Rout's dome: the colour rises into white, the projects sit on the white (ink in the dark theme),
            and the mirrored dome brings the page back. */}
        <div className="pt-section">
          <Dome />
        </div>
        <div className="dome-zone">
          <section id="work" aria-labelledby="work-title" className={`scroll-mt-0 py-block ${FRAME}`}>
            <WorkFilter
              title={
                <h2 id="work-title" className="font-serif">
                  Work
                </h2>
              }
              kinds={[
                { kind: "All", label: "All", count: caseStudies.length },
                { kind: "Product", label: "Product", count: caseStudies.filter((c) => c.kind === "Product").length },
                { kind: "Web", label: "Web", count: caseStudies.filter((c) => c.kind === "Web").length },
              ]}
            >
              {ROWS.map((r) => (
                <Work key={r.slug} {...r} />
              ))}
            </WorkFilter>
          </section>
        </div>
        <Dome after />
      </main>

      <footer className={`flex h-16 items-center justify-between border-t border-line ${FRAME}`}>
        <p className={`${label} text-label`}>© 2026 Syed Ali</p>
        <nav aria-label="Pages" className="flex gap-lead max-lg:hidden">
          {PLACES.map((p) => (
            <PageLink key={p.href} href={p.href} className={`${label} text-label transition-colors hover:text-ink`} preload={`/stamps/${p.stone}.webp`} data-stone={p.stone}>
              {p.word}
            </PageLink>
          ))}
        </nav>
        <p className={`${label} text-label`}>Bengaluru</p>
      </footer>
    </div>
  );
}
