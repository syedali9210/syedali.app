"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Picture } from "@/content/types";
import { Video } from "./Video";

type Item = { label: string; meta: string; note: string; video: string; poster: Picture; width: number; height: number };

/**
 * A film's versions, oldest first (Video Engine's iterations). The chosen one plays big; under it every version sits in one row
 * with what changed, so the whole climb reads at a glance, and pressing one plays it. It opens on the first, so the story runs
 * forward. Arrow keys move along the row, as a tab list should.
 */
export function Versions({ items }: { items: Item[] }) {
  const [on, setOn] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const go = (n: number) => {
    const k = (n + items.length) % items.length;
    setOn(k);
    list.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[k]?.focus();
  };
  const v = items[on];
  return (
    <figure>
      <div id="versions-film" role="tabpanel" aria-label={`${v.meta}: ${v.label}`} className="ui mx-auto w-full">
        {/* Keyed, so a new choice mounts a new film: it fades up and starts from its first frame. */}
        <div key={on} className="versions-in">
          <Video src={v.video} poster={v.poster.src} width={v.width} height={v.height} label={v.poster.alt} />
        </div>
      </div>
      <div ref={list} role="tablist" aria-label="Versions of the film" className="mt-lead grid grid-cols-2 gap-x-text gap-y-lead sm:grid-cols-4">
        {items.map((it, n) => (
          <button
            key={it.video}
            type="button"
            role="tab"
            aria-selected={n === on}
            aria-controls="versions-film"
            tabIndex={n === on ? 0 : -1}
            data-sound="switch"
            onClick={() => setOn(n)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") go(on + 1);
              if (e.key === "ArrowLeft") go(on - 1);
            }}
            className="version flex cursor-pointer flex-col items-start gap-label text-left"
          >
            <span className="version-thumb block w-full overflow-hidden rounded-[8px]">
              <Image quality={90} src={it.poster.src} alt="" width={it.width} height={it.height} sizes="(min-width: 640px) 220px, 45vw" className="block aspect-video w-full object-cover" />
            </span>
            <span className="mt-note font-mono text-[11px] leading-4 tracking-[0.1em] text-label uppercase">{it.meta}</span>
            <span className="text-copy font-medium text-ink">{it.label}</span>
            <span className="text-small text-body">{it.note}</span>
          </button>
        ))}
      </div>
    </figure>
  );
}
