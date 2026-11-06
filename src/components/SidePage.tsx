"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";
import { Cursor } from "./Cursor";
import { PageLink } from "./PageLink";
import { Paper } from "./Paper";
import { SoundToggle } from "./Sound";
import { useStones } from "./Stamps";
import { ThemeToggle } from "./ThemeToggle";

const PAGES = [
  { page: "experience", label: "Experience" },
  { page: "about", label: "About" },
];

/** A project's rock, alive as on the first screen, and a link into its case study: the rock flies there. */
export function Rock({ slug, title, rot }: { slug: string; title: string; rot: number }) {
  return (
    <div className="stamp" data-slug={slug} data-fly-scope style={{ "--rot": rot } as CSSProperties}>
      <span className="stamp-rest" data-fly="stone" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- baked with its outline in alpha, 512 px */}
        <img src={`/stamps/${slug}-sm.webp`} alt="" width={512} height={641} decoding="async" draggable={false} />
      </span>
      <PageLink href={`/work/${slug}`} className="stamp-link" aria-label={`${title}: read the case study`} data-cursor="View project" draggable={false} />
    </div>
  );
}

/**
 * Experience and About, on the archive's layout: a way back, the page's own stone, its heading and a line down the left, cards on the
 * right, and at the middle of the left edge a small square marking which of the two you're on.
 */
export function SidePage({ page, title, desc, children }: { page: string; title: string; desc: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useStones(root, { ahead: 4, twoTap: false, hoverOnly: true, push: false, rise: 0.13 });
  return (
    <div className="home relative min-h-svh overflow-x-clip bg-sheet">
      <Paper />
      <Cursor />
      <div ref={root} className="ar" data-page={page}>
        <div className="ar-toggles">
          <SoundToggle className="hero-toggle" />
          <ThemeToggle plain className="hero-toggle" />
        </div>
        <nav className="ar-nav" aria-label="About Syed" style={{ "--a": PAGES.findIndex((p) => p.page === page) } as CSSProperties}>
          {PAGES.map((p) => (
            <PageLink key={p.page} href={`/${p.page}`} aria-current={p.page === page ? "page" : undefined} data-stone={`piece-${p.page}`} preload={`/stamps/piece-${p.page}.webp`}>
              {p.label}
            </PageLink>
          ))}
        </nav>
        <div className="ar-layout">
          <aside className="ar-side">
            <PageLink href="/" className="ar-back" data-stone="piece-back">
              <span aria-hidden="true">←</span> Back
            </PageLink>
            <div className="ar-mark" aria-hidden="true">
              <div className="stamp" data-slug={`piece-${page}`} style={{ "--rot": -2 } as CSSProperties}>
                <span className="stamp-rest" data-land="stone">
                  {/* eslint-disable-next-line @next/next/no-img-element -- baked with its outline in alpha */}
                  <img src={`/stamps/piece-${page}.webp`} alt="" width={768} height={962} decoding="async" draggable={false} />
                </span>
                <span className="stamp-link" />
              </div>
            </div>
            <h1 className="ar-title font-serif">{title}</h1>
            <p className="ar-desc">{desc}</p>
          </aside>
          <main className="ar-main">{children}</main>
        </div>
      </div>
    </div>
  );
}
