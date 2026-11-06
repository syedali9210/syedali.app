import Image from "next/image";
import { sizeOf } from "@/content";
import type { CaseStudy } from "@/content/types";
import { Device } from "./Device";
import { Icon } from "./Icon";
import { ModeButton } from "./Panels";
import { plain, Rich } from "./Rich";

/**
 * The entry, as in the reference (Rachel Chen's case studies): a plate across the wide column (the product's device in
 * a soft sky of the case study's own colours, square-cornered), then in the reading column the title, the summary,
 * the facts in a row (label over value), the ways in, and a hairline before the story starts.
 */
export function Hero({ study }: { study: CaseStudy }) {
  const { frame, picture } = study.hero;
  const phone = frame === "phone";
  const lead = plain(study.tagline);
  const lede = study.summary.startsWith(lead) ? study.summary.slice(lead.length).trim() : study.summary;
  const live = study.status.links[0];
  const link = "out-link inline-flex h-9 items-center gap-note text-copy text-ink underline-offset-4 hover:underline";

  return (
    <header id="overview" data-quick className="hero part pt-[var(--page-top)]">
      <div className="col mx-auto w-full max-w-[calc(var(--wide)+2*var(--gutter))] px-[var(--gutter)]">
        <div className="sky relative aspect-[4/3] overflow-hidden sm:aspect-[16/9]">
          <div className="sky-glow" aria-hidden="true" />
          <div data-land="screen" className={`hero-device absolute left-1/2 z-[1] ${phone ? "top-[9%] w-[clamp(150px,26%,250px)]" : "top-[11%] w-[78%] sm:w-[68%]"}`}>
            <Device frame={frame}>
              {phone ? (
                <Image quality={90} src={picture.src} alt="" {...sizeOf(picture)} sizes="(min-width: 1024px) 250px, 40vw" priority className="block h-auto w-full" />
              ) : (
                // A window onto the whole page: the reader scrolls it (wheel, trackpad, drag, keys); nothing moves on its own.
                // At either end the scroll carries on to the page.
                <div tabIndex={0} aria-label={`${picture.alt}. Scroll to look through it.`} className="screen-scroll relative aspect-[16/10] overflow-y-auto rounded-[5px] bg-white">
                  <Image quality={90} src={picture.src} alt={picture.alt} {...sizeOf(picture)} sizes="(min-width: 1024px) 630px, 78vw" priority className="block min-h-full w-full object-cover object-top" />
                </div>
              )}
            </Device>
          </div>
        </div>
      </div>

      <div className="col mx-auto mt-block w-full max-w-[calc(var(--measure)+2*var(--gutter))] px-[var(--gutter)]">
        {/* eslint-disable-next-line @next/next/no-img-element -- the project's rock from the first screen, already loaded */}
        <img className="case-mark" data-land="stone" src={`/stamps/${study.slug}-sm.webp`} alt="" width={512} height={641} decoding="async" draggable={false} />
        <h1 className="font-serif text-display text-ink">
          <Rich text={study.tagline} />
        </h1>
        <p className="mt-text text-lead text-body">{lede}</p>
        <dl className="mt-group grid grid-cols-2 gap-lead sm:grid-cols-3">
          {study.meta.map((m) => (
            <div key={m.label}>
              <dt className="text-copy text-label">{m.label}</dt>
              <dd className="mt-label text-copy text-ink">{m.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-lead flex flex-wrap items-center gap-x-lead gap-y-label">
          {live && (
            <a href={live.href} target="_blank" rel="noopener" className={link}>
              {live.label}
              <Icon name="arrow-up-right" size={14} className="out-arrow text-label" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          <ModeButton className={`${link} cursor-pointer`}>
            <span className="when-full">Quick overview</span>
            <span className="when-quick">Full story</span>
            <Icon name="arrow-right" size={14} className="text-label" />
          </ModeButton>
        </div>
        <hr className="mt-group border-line" />
      </div>
    </header>
  );
}
