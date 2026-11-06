"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Part } from "@/content/types";

/**
 * Rows by depth: a part sits one row below the deepest part that moves it, so every line runs downhill. Parts that
 * move nothing are what the system puts out, so they all share the last row.
 */
function layers(parts: Part[]) {
  const from = new Map<string, string[]>();
  for (const p of parts) for (const m of p.moves ?? []) from.set(m, [...(from.get(m) ?? []), p.id]);
  const depth = new Map<string, number>();
  const d = (id: string, seen: Set<string>): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (seen.has(id)) return 0; // a loop in the data: stop rather than recurse forever
    seen.add(id);
    const v = Math.max(-1, ...(from.get(id) ?? []).map((p) => d(p, seen))) + 1;
    depth.set(id, v);
    return v;
  };
  for (const p of parts) d(p.id, new Set());
  const last = Math.max(...depth.values());
  const rows: Part[][] = [];
  for (const p of parts) (rows[p.moves?.length ? depth.get(p.id)! : last] ??= []).push(p);
  return rows.filter(Boolean);
}

/** Everything a change to `id` reaches, following `moves` all the way down. */
function reach(parts: Part[], id: string) {
  const by = new Map(parts.map((p) => [p.id, p]));
  const out = new Set<string>();
  const walk = (k: string) => by.get(k)?.moves?.forEach((m) => !out.has(m) && (out.add(m), walk(m)));
  walk(id);
  return out;
}

type Link = { from: string; to: string; d: string };

/**
 * A system drawn in hairlines: its parts in rows, lines from each part to what a change to it moves. Point at (or tab
 * to) a part and its whole reach lights up, with the count and names read out under the figure. Nothing moves until
 * the reader asks; the lines draw in once when the figure first comes into view.
 */
export function System({ title, note, parts }: { title: string; note: string; parts: Part[] }) {
  const rows = useMemo(() => layers(parts), [parts]);
  const box = useRef<HTMLDivElement>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [on, setOn] = useState<string | null>(null);
  const lit = useMemo(() => (on ? reach(parts, on) : new Set<string>()), [on, parts]);
  const part = parts.find((p) => p.id === on);

  // Lines from the foot of each part to the head of what it moves, measured from the laid-out buttons. Offsets, not
  // getBoundingClientRect: the column is scaled while it scrolls in (.enter), and a line drawn from a scaled box misses its pill.
  useEffect(() => {
    const el = box.current!;
    const measure = () => {
      const at = (id: string) => el.querySelector<HTMLElement>(`[data-part="${id}"]`);
      const out: Link[] = [];
      for (const p of parts)
        for (const m of p.moves ?? []) {
          const a = at(p.id), b = at(m);
          if (!a || !b) continue;
          const x1 = a.offsetLeft + a.offsetWidth / 2, y1 = a.offsetTop + a.offsetHeight;
          const x2 = b.offsetLeft + b.offsetWidth / 2, y2 = b.offsetTop;
          const mid = (y1 + y2) / 2;
          out.push({ from: p.id, to: m, d: `M${x1.toFixed(1)} ${y1.toFixed(1)}C${x1.toFixed(1)} ${mid.toFixed(1)} ${x2.toFixed(1)} ${mid.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}` });
        }
      setLinks(out);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [parts]);

  const live = (l: Link) => !!on && (l.from === on || lit.has(l.from)) && lit.has(l.to);
  const names = part ? parts.filter((p) => lit.has(p.id)).map((p) => p.label) : [];

  return (
    <figure data-reveal className="system mx-auto w-full max-w-[860px]">
      <div ref={box} className="relative" onPointerLeave={() => setOn(null)}>
        <svg className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
          {links.map((l, n) => (
            <path key={`${l.from}-${l.to}`} d={l.d} pathLength={1} className="sys-link" data-on={live(l) || undefined} style={{ "--i": n } as CSSProperties} />
          ))}
          {links.filter(live).map((l) => (
            <path key={`flow-${l.from}-${l.to}`} d={l.d} pathLength={1} className="sys-flow" />
          ))}
        </svg>
        <div className="relative flex flex-col gap-block">
          {rows.map((row, r) => (
            <div key={r} className="flex flex-wrap justify-center gap-caption">
              {row.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  data-part={p.id}
                  aria-pressed={on === p.id}
                  data-state={on === p.id ? "on" : lit.has(p.id) ? "lit" : on ? "dim" : undefined}
                  onPointerEnter={() => setOn(p.id)}
                  onFocus={() => setOn(p.id)}
                  onBlur={() => setOn(null)}
                  onClick={() => setOn(on === p.id ? null : p.id)}
                  className="sys-part rounded-full px-text py-note text-small font-medium"
                >
                  {p.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <figcaption aria-live="polite" className="mx-auto mt-group min-h-[64px] max-w-[560px] text-center">
        {part ? (
          <>
            <p className="text-small font-medium text-fg">{part.note}</p>
            <p className="mt-label text-small text-label">
              {names.length ? `A change here reaches ${names.length} more: ${names.join(", ")}.` : "Nothing else depends on it: a change here stays here."}
            </p>
          </>
        ) : (
          <>
            <p className="text-small font-medium text-fg">{title}</p>
            <p className="mt-label text-small text-label">{note}</p>
          </>
        )}
      </figcaption>
    </figure>
  );
}
