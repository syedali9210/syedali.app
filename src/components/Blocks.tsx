import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { sizeOf, toneOf } from "@/content";
import type { Block, Picture, Step, Wire, WireItem } from "@/content/types";
import { EARLY } from "./early";
import { Immersive } from "./Immersive";
import { Rich, RiseWords } from "./Rich";
import { Versions } from "./Versions";
import { Video } from "./Video";
import { Zoom } from "./Zoom";

const i = (n: number) => ({ "--i": n }) as CSSProperties;
const MAIN = "(min-width: 816px) 744px, 100vw";

/**
 * A case study's pictures are served as they are: each one is already a WebP cut to the size it's shown at (2400 px wide at most), so it
 * comes straight off the CDN instead of waiting on the image optimiser, which took about a second per picture after every deploy
 * ("the assets are loading late"). Its own colour sits behind it until it lands. `quality` sends it through the optimiser instead.
 *
 * A screen captured in both of its product's themes (`dark`) draws both halves, and globals.css shows the one matching the site's.
 * Both are lazy in the markup (the server can't know the reader's theme); ThemePairs loads the shown half with the page, and the hidden
 * one isn't fetched until the theme switches to it. They're plain imgs, served as they are: the optimiser kept handing back its copy
 * of an old home screen, and next/image flags the first screen's lazy half as the LCP, though eager there would fetch both halves at
 * once, at high priority, and slow the one you see.
 */
export function Pic({ picture, sizes = MAIN, className, style, priority, quality, alt = picture.alt }: { picture: Picture; sizes?: string; className?: string; style?: CSSProperties; priority?: boolean; quality?: number; alt?: string }) {
  const size = sizeOf(picture);
  const toned = (src: string) => {
    const tone = toneOf(src);
    return tone ? { backgroundColor: tone, ...style } : style;
  };
  if (!picture.dark)
    return <Image unoptimized={!quality} quality={quality} src={picture.src} alt={alt} {...size} sizes={sizes} className={className} style={toned(picture.src)} {...(priority ? { priority } : EARLY)} />;
  return (
    <>
      {[
        [picture.src, "pic-light"],
        [picture.dark, "pic-dark"],
      ].map(([src, theme]) => (
        // eslint-disable-next-line @next/next/no-img-element -- a theme pair's half, as captured (see above)
        <img key={src} src={src} alt={alt} {...size} loading="lazy" decoding="async" fetchPriority={priority ? "high" : "low"} className={`${className ?? ""} ${theme}`} style={{ color: "transparent", ...toned(src) }} />
      ))}
    </>
  );
}

/** What a picture shows, in a line under it. */
function Caption({ children }: { children?: string }) {
  if (!children) return null;
  return <p className="caption mx-auto mt-caption max-w-[var(--measure)] text-center text-small text-label">{children}</p>;
}

/** A component sized to what it shows: `w` keeps it at its own size, otherwise the column. */
const sizesFor = (p: Picture) => (p.w ? `(min-width: ${p.w + 64}px) ${p.w}px, 100vw` : MAIN);

/**
 * One component on the page as itself (globals.css .ui): no plate or box around it, just its own corners and a soft lift off the
 * paper. `open` pictures (cards on a transparent ground, a region that fades out) get neither.
 */
function Shot({ picture, children }: { picture: Picture; children: ReactNode }) {
  return (
    <div data-reveal="clip" className={`ui mx-auto w-full ${picture.open ? "ui-open" : ""}`} style={picture.w ? { maxWidth: picture.w } : undefined}>
      {children}
    </div>
  );
}

const WIDE_SIZES = "(min-width: 987px) 923px, 100vw";
const HALF_SIZES = "(min-width: 987px) 454px, (min-width: 640px) 50vw, 100vw";
const PHONE_SIZES = "(min-width: 987px) 220px, (min-width: 640px) 25vw, 50vw";

/** Which steps span the column: four run wide, two, wide; three run wide, then two; two pair up (unless a step says). */
function spans(items: Step[]) {
  const n = items.length;
  return items.map((s, k) => s.wide ?? (n === 1 || (n >= 3 && (k === 0 || (n === 4 && k === 3)))));
}

/**
 * A chapter told through its screens (Syed, 2026-11-22: "3-4 screens that belong to that part … explain about it as steps"):
 * whole screens, never a lone component, each on the page as itself with its step under it, a number, what happened, one line.
 */
function Steps({ items, phones = false }: { items: Step[]; phones?: boolean }) {
  const wide = phones ? items.map(() => false) : spans(items);
  return (
    <ol className="steps" data-phones={phones || undefined} style={{ "--n": items.length } as CSSProperties}>
      {items.map((s, n) => {
        const { width, height } = sizeOf(s.picture);
        return (
          <li key={s.picture.src} className="step" data-wide={wide[n] || undefined}>
            <figure>
              <div data-reveal="clip" className="ui" style={i(n)}>
                {s.video ? (
                  <Video src={s.video} poster={s.picture.src} width={width} height={height} label={s.picture.alt} />
                ) : (
                  <Zoom src={s.picture.src} dark={s.picture.dark} alt={s.picture.alt} width={width} height={height}>
                    <Pic picture={s.picture} sizes={phones ? PHONE_SIZES : wide[n] ? WIDE_SIZES : HALF_SIZES} className="block h-auto w-full" />
                  </Zoom>
                )}
              </div>
              <figcaption className="step-cap">
                <span className="step-n" aria-hidden="true">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="step-title">{s.title}</span>
                  {s.text && <span className="step-text"> {s.text}</span>}
                </span>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
  );
}

/** One part of a wireframe. Pictures get their diagonals, copy is a bar unless it has words. */
function WirePart({ it, phone }: { it: WireItem; phone: boolean }) {
  const h = it.h ?? 0;
  const dash = { strokeDasharray: phone ? "2.4 1.8" : "1.6 1.2" };
  const ns = "non-scaling-stroke" as const;
  switch (it.k) {
    case "box":
      return <rect style={dash} x={it.x} y={it.y} width={it.w} height={h} rx={phone ? 3 : 1.6} fill="none" stroke="currentColor" vectorEffect={ns} />;
    case "img":
      return (
        <g>
          <rect x={it.x} y={it.y} width={it.w} height={h} rx={phone ? 2.4 : 1.2} fill="none" stroke="currentColor" style={dash} vectorEffect={ns} />
          <path d={`M${it.x} ${it.y}L${it.x + it.w} ${it.y + h}M${it.x + it.w} ${it.y}L${it.x} ${it.y + h}`} stroke="currentColor" strokeOpacity={0.35} vectorEffect={ns} />
        </g>
      );
    case "btn":
      return <rect style={dash} x={it.x} y={it.y} width={it.w} height={h} rx={h / 2} fill="none" stroke="currentColor" vectorEffect={ns} />;
    case "dot":
      return <circle style={dash} cx={it.x + it.w / 2} cy={it.y + it.w / 2} r={it.w / 2} fill="none" stroke="currentColor" vectorEffect={ns} />;
    case "rule":
      return <line x1={it.x} y1={it.y} x2={it.x + it.w} y2={it.y} stroke="currentColor" vectorEffect={ns} />;
    case "text":
      return it.t ? (
        <text style={{ fontFamily: "var(--font-geist)" }} x={it.x} y={it.y} fontSize={phone ? 6.2 : 3.6} fill="var(--color-wire-text)" dominantBaseline="middle">
          {it.t}
        </text>
      ) : (
        <rect x={it.x} y={it.y - (phone ? 1.4 : 0.9)} width={it.w} height={phone ? 2.8 : 1.8} rx={phone ? 1.4 : 0.9} fill="var(--color-wire-bar)" />
      );
  }
}

function WireSvg({ wire }: { wire: Wire }) {
  const phone = wire.frame === "phone";
  const [w, h] = phone ? [100, 200] : [160, 100];
  return (
    <svg viewBox={`-1 -1 ${w + 2} ${h + 2}`} className="block h-auto w-full" aria-hidden="true">
      <rect x={0} y={0} width={w} height={h} rx={phone ? 10 : 3} fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke" />
      {phone && <rect x={36} y={4} width={28} height={6} rx={3} fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke" />}
      {wire.items.map((it, k) => (
        <WirePart key={k} it={it} phone={phone} />
      ))}
    </svg>
  );
}

/**
 * The device section (the "no margins" reference): the product's real screen on a device in isometric, floating over
 * its screens laid out as wireframes. The field runs past the column, so when the card opens to the full screen
 * (FullFrame) the rest of the product comes into view around the device. The notes under it say what each screen is for.
 */
function DeviceStage({ screens, over, label }: { screens: Wire[]; over?: Picture; label: string }) {
  const phone = screens[0]?.frame === "phone";
  // Sizes in cqw of the stage (the column's width).
  const g = phone
    ? { w: 31, h: 31 / 0.462, r: 5, bezel: 1.1, rIn: 3.9, yc: 27, deep: 1.8, tileW: 13, gap: 2.4, top: 40, rows: 2, height: 92 }
    : { w: 64, h: 40, r: 2, bezel: 1, rIn: 1, yc: 26, deep: 1.3, tileW: 24, gap: 2.6, top: 38, rows: 3, height: 88 };
  const cols = 13;
  const half = (cols - 1) / 2;
  const box = { width: `${g.w}cqw`, height: `${g.h}cqw`, left: `calc(50% - ${g.w / 2}cqw)`, top: `${g.yc - g.h / 2}cqw` };
  const slices = 7;
  return (
    <figure className="device-stage relative" aria-label={label} role="img">
      <div style={{ height: `${g.height}cqw` }} className="relative">
        {/* The wireframe field: rows of the product's screens, centred under the device, fading downward. */}
        {/* It runs 120cqw past the column on each side (the mask is as wide as its box, so the box has to be). */}
        <div data-field className="absolute will-change-transform" style={{ top: `${g.top}cqw`, left: "-120cqw", right: "-120cqw", maskImage: "linear-gradient(#000 35%, transparent 96%)" }}>
          <div data-reveal className="flex flex-col items-center" style={{ gap: `${g.gap}cqw` }}>
            {Array.from({ length: g.rows }, (_, row) => (
              <div key={row} className="flex justify-center" style={{ gap: `${g.gap}cqw`, marginLeft: row % 2 ? `${g.tileW + g.gap}cqw` : 0 }}>
                {Array.from({ length: cols }, (_, c) => {
                  const wire = screens[(((c - half + row * 2) % screens.length) + screens.length) % screens.length];
                  return (
                    <div
                      key={c}
                      className="wire-tile shrink-0 rounded-[0.9cqw] bg-surface text-wire ring-1 ring-fg/[0.06]"
                      style={{ width: `${g.tileW}cqw`, padding: `${g.tileW * 0.045}cqw`, "--d": Math.abs(c - half) + row } as CSSProperties}
                    >
                      <WireSvg wire={wire} />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* The device: its shadow on the field, then the slab's edge (stacked outlines) and its face. */}
        {over && (
          <>
            <div data-shadow className="device-shadow absolute opacity-50" style={{ ...box, transform: `translateY(${g.h * 0.16}cqw) rotateX(54deg) rotateZ(-38deg) scale(0.94)`, background: "#000", borderRadius: `${g.r}cqw` }} />
            <div data-device className="absolute inset-0 will-change-transform">
              <div data-reveal="clip" className="iso absolute" style={{ ...box, "--r": `${g.r}cqw`, "--r-in": `${g.rIn}cqw`, "--bezel": `${g.bezel}cqw` } as CSSProperties}>
                {Array.from({ length: slices }, (_, k) => (
                  <span key={k} className="slab" style={{ "--y": `${(g.deep * (slices - k)) / slices}cqw`, "--slab": k === 0 ? "#111113" : "#1e1e21" } as CSSProperties} />
                ))}
                <span className="slab-rim" style={{ "--y": `${g.deep * 0.12}cqw` } as CSSProperties} />
                <div className="face">
                  <div className="glass">
                    <Pic picture={over} sizes={phone ? "300px" : "620px"} className="block size-full object-cover object-top" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </figure>
  );
}

export function BlockView({ block, center = false }: { block: Block; center?: boolean }) {
  switch (block.type) {
    case "section": {
      // Only the four main sections arrive with motion, and each a different way (globals.css, .entry-*);
      // the rest of the headings are simply there.
      const e = block.entry;
      return (
        <section id={block.id} className={`mx-auto w-full max-w-[var(--measure)] ${center ? "text-center" : ""}`}>
          {block.eyebrow && (
            <p data-reveal className={`eyebrow ${center ? "justify-center" : ""} ${e === "draw" ? "eyebrow-draw" : ""}`}>
              {block.eyebrow}
              <span className="eyebrow-rule" aria-hidden="true" />
            </p>
          )}
          <h2 data-reveal={e ? "" : undefined} className={`${e ? `entry-${e}` : ""} font-serif text-headline text-ink`}>
            {e === "rise" ? (
              <RiseWords text={block.title} />
            ) : e === "wipe" ? (
              // the clip sits on a child: a clipped target has no visible area, so it would never be seen arriving
              <span className="wipe-in block">
                <Rich text={block.title} />
              </span>
            ) : (
              <Rich text={block.title} />
            )}
          </h2>
          <div className={`mt-text flex flex-col gap-text empty:hidden ${center ? "mx-auto max-w-[560px]" : ""}`}>
            {block.body.map((p, n) => (
              <p key={n} data-reveal style={i(n + 1)} className="section-copy text-copy text-body">
                <Rich text={p} />
              </p>
            ))}
          </div>
        </section>
      );
    }

    case "media": {
      const { width, height } = sizeOf(block.picture);
      return (
        <figure>
          <Shot picture={block.picture}>
            {block.video ? (
              <Video src={block.video} poster={block.picture.src} width={width} height={height} label={block.picture.alt} />
            ) : (
              <Pic picture={block.picture} sizes={sizesFor(block.picture)} className="block h-auto w-full" />
            )}
          </Shot>
          <Caption>{block.caption}</Caption>
        </figure>
      );
    }

    case "immersive": {
      const { width, height } = sizeOf(block.picture);
      return (
        <Immersive aspect={width / height}>
          {block.video ? (
            <Video src={block.video} poster={block.picture.src} width={width} height={height} label={block.picture.alt} fill />
          ) : (
            <Pic picture={block.picture} sizes="100vw" className="size-full object-cover object-top" />
          )}
        </Immersive>
      );
    }

    case "gallery":
      // Components side by side on the page, each as itself (no plate): a row shares one height, small ones keep their own size.
      return (
        <figure>
          <div data-reveal className="bento" data-fit={block.fit}>
            {block.pictures.map((p) => {
              const { width, height } = sizeOf(p);
              return (
                <div key={p.src} className={`bento-cell ui ${p.open ? "ui-open" : ""}`} style={{ "--a": (width / height).toFixed(3), "--w": `${width}px`, maxWidth: width } as CSSProperties}>
                  <Pic picture={p} sizes="(min-width: 640px) 640px, 100vw" className="block h-auto w-full" />
                </div>
              );
            })}
          </div>
          <Caption>{block.caption}</Caption>
        </figure>
      );

    case "versions":
      // Sizes are read here, on the server: the client part only gets the four films, not the whole of the content.
      return <Versions items={block.items.map((v) => ({ ...v, ...sizeOf(v.poster) }))} />;

    case "wireframes":
      return (
        <>
          <DeviceStage screens={block.screens} over={block.over} label={`${block.screens.map((w) => w.title).join(", ")}, as wireframes`} />
          <dl className={`mx-auto mt-text grid max-w-[calc(var(--measure)+2*var(--pad-x))] gap-x-group gap-y-lead px-[var(--pad-x)] ${block.screens.length > 3 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-3"}`}>
            {block.screens.map((w, n) => (
              <div key={w.title} data-reveal style={i(n)}>
                <dt className="text-small font-medium text-fg">{w.title}</dt>
                <dd className="mt-label text-small text-label">{w.note}</dd>
              </div>
            ))}
          </dl>
        </>
      );

    case "cards": {
      // The reference's grid of points: a name over its line, side by side, no boxes. A tag (a challenge's kind) sits above in mono.
      return (
        <ul className="cards-grid mx-auto grid w-full max-w-[var(--measure)] gap-x-group gap-y-lead sm:grid-cols-2">
          {block.items.map((card, n) => (
            <li key={card.title} data-reveal style={i(n)} className="flex flex-col gap-label border-t border-line pt-text">
              {card.tag && <p className="font-mono text-[11px] leading-4 tracking-[0.1em] text-label uppercase">{card.tag}</p>}
              <p className="text-copy font-medium text-ink">{card.title}</p>
              {card.text && <p className="text-copy text-body">{card.text}</p>}
            </li>
          ))}
        </ul>
      );
    }

    case "stats":
      return (
        <div className="mx-auto flex w-full max-w-[var(--measure)] flex-col gap-group">
          {block.note && (
            <p data-reveal className="text-lead text-ink">
              {block.note}
            </p>
          )}
          <dl className="grid grid-cols-1 gap-x-group gap-y-lead sm:grid-cols-2">
            {block.items.map((s, n) => (
              <div key={s.label} data-reveal style={i(n)} className="flex flex-col gap-note border-t border-line pt-text">
                <dt className="text-small text-label">{s.label}</dt>
                <dd className="overflow-hidden pb-label font-serif text-statement text-ink">
                  <span className="stat-value tabular-nums" style={i(n)}>
                    {s.value}
                  </span>
                </dd>
                {s.note && <dd className="text-small text-body">{s.note}</dd>}
              </div>
            ))}
          </dl>
        </div>
      );

    case "process": {
      // The design process: the stairs figure climbs these phases (one step each, with what the phase left behind),
      // then the phases run across in order, each with what it was for and its output.
      const q = new URLSearchParams({ p: block.steps.map((s) => s.phase).join(","), k: block.steps.map((s) => s.kind).join(",") });
      return (
        <div className="flex flex-col gap-group">
          <figure className="diagram flex justify-center px-text pt-block pb-note">
            <span className="diagram-name">“The process”</span>
            <iframe src={`/illustrations/stairs.html?${q}`} title="The design process, as a flight of steps" className="aspect-[5/4] w-full max-w-[400px] border-0 bg-transparent" />
          </figure>
          <ol className="grid gap-x-group gap-y-lead sm:grid-cols-2">
            {block.steps.map((s, n) => (
              <li key={s.title} data-reveal style={i(n)} className="flex flex-col gap-note border-t border-line pt-text">
                <p className="flex items-baseline gap-note font-mono text-[11px] leading-4 tracking-[0.1em] text-label uppercase">
                  <span className="tabular-nums">{String(n + 1).padStart(2, "0")}</span>
                  <span>{s.phase}</span>
                </p>
                <p className="font-serif text-[18px] leading-[1.45] text-ink">{s.title}</p>
                <p className="text-copy text-body">{s.text}</p>
                {s.made && <p className="text-small text-label">Output: {s.made}</p>}
              </li>
            ))}
          </ol>
        </div>
      );
    }

    case "steps":
      return <Steps items={block.items} phones={block.phones} />;

    case "compare":
      // Each tool reads straight across: what it is, what it's good at, where it fell short. Below sm each cell names its column.
      return (
        <div className="mx-auto w-full max-w-[var(--measure)]">
          <div className="hidden grid-cols-[150px_1fr_1fr] gap-group pb-text text-small font-medium text-fg sm:grid">
            <p>Tool</p>
            <p>Good at</p>
            <p>Where it fell short</p>
          </div>
          <ol>
            {block.items.map((t, n) => (
              <li key={t.name} data-reveal style={i(n)} className="grid gap-note border-t border-line py-text sm:grid-cols-[150px_1fr_1fr] sm:gap-group">
                <p className="flex flex-col gap-label">
                  <span className="text-copy font-medium text-ink">{t.name}</span>
                  <span className="font-mono text-[11px] leading-4 tracking-[0.08em] text-label uppercase">{t.kind}</span>
                </p>
                <p className="text-copy text-body">
                  <span className="font-medium text-fg sm:hidden">Good at: </span>
                  {t.good}
                </p>
                <p className="text-copy text-body">
                  <span className="font-medium text-fg sm:hidden">Fell short: </span>
                  {t.short}
                </p>
              </li>
            ))}
          </ol>
        </div>
      );

    case "timeline":
      // The story in order: when on the left in mono, what happened beside it, the moments joined by one hairline.
      return (
        <ol className="timeline mx-auto w-full max-w-[var(--measure)]">
          {block.items.map((t, n) => (
            <li key={t.title} data-reveal style={i(n)} className="timeline-item">
              <p className="timeline-when">{t.when}</p>
              <div>
                <p className="font-serif text-[18px] leading-[1.45] text-ink">{t.title}</p>
                <p className="mt-label text-copy text-body">{t.text}</p>
              </div>
            </li>
          ))}
        </ol>
      );

    case "tradeoffs":
      // Each trade-off reads straight across: what I went with, then what it cost. Below sm each cell names its column.
      return (
        <div className="mx-auto w-full max-w-[var(--measure)]">
          <div className="hidden grid-cols-2 gap-group pb-text text-small font-medium text-fg sm:grid">
            <p>I went with</p>
            <p>What it cost</p>
          </div>
          <ol>
            {block.items.map((t, n) => (
              <li key={t.chose} data-reveal style={i(n)} className="grid gap-caption border-t border-line py-text sm:grid-cols-2 sm:gap-group">
                <p className="font-serif text-[clamp(19px,17px+0.4vw,22px)] leading-snug text-ink">{t.chose}</p>
                <p className="text-copy text-body">
                  <span className="font-medium text-fg sm:hidden">What it cost: </span>
                  {t.cost}
                </p>
              </li>
            ))}
          </ol>
        </div>
      );
  }
}
