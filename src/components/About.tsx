import type { CSSProperties } from "react";
import { ABOUT } from "@/content/about";
import { GITHUB } from "@/content/contact";
import { Icon } from "./Icon";
import { Clock } from "./Peek";
import { Rock, SidePage } from "./SidePage";

const num = (n: number) => String(n).padStart(4, "0");

/** About as its own page, on the archive's layout and in its cards: what I hold to, what I do and with what, and what's on now. */
export function About() {
  return (
    <SidePage page="about" title="About" desc="A product designer and design engineer in Bengaluru.">
      <ul className="cards ab">
        <li className="card xp ab-wide" style={{ "--i": 0 } as CSSProperties}>
          <p className="card-top">
            <span>
              Syed Ali <i className="ab-say-it font-serif">/sai-yed&ensp;ah-lee/</i>
            </span>
            <b>{num(1)}</b>
          </p>
          <p className="ab-lead font-serif">{ABOUT.lead}</p>
          <p className="card-note ab-note">{ABOUT.story}</p>
          <p className="card-note ab-note">
            Root-cause fixes, never <em className="font-serif text-accent">jugaad</em> <span className="text-label">(the quick hack that holds till Monday).</span>
          </p>
        </li>
        {[
          { head: "What I do", list: ABOUT.does },
          { head: "What I build with", list: ABOUT.uses },
        ].map((c, i) => (
          <li key={c.head} className="card xp" style={{ "--i": i + 1 } as CSSProperties}>
            <p className="card-top">
              <span>{c.head}</span>
              <b>{num(i + 2)}</b>
            </p>
            <ul className="xp-points ab-list">
              {c.list.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </li>
        ))}
        <li className="card xp ab-wide" style={{ "--i": 3 } as CSSProperties}>
          <p className="card-top">
            <span>Now</span>
            <b>{num(4)}</b>
          </p>
          <div className="xp-body">
            <div className="xp-stones" data-n={2}>
              <Rock slug="trace" title="Trace" rot={-9} />
              <Rock slug="animation-engine" title="Animation Engine" rot={8} />
            </div>
            <div className="xp-text">
              <p className="ab-lead ab-now font-serif">{ABOUT.now}</p>
              <p className="ab-open">
                <span className="live-dot relative size-1.5 shrink-0 rounded-full bg-live" aria-hidden="true" />
                {ABOUT.open}
              </p>
              <p className="xp-who">
                Bengaluru · <Clock />
              </p>
            </div>
          </div>
          <p className="card-tags">
            <a href={GITHUB} target="_blank" rel="noopener">
              GitHub <Icon name="arrow-up-right" size={11} />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </p>
        </li>
      </ul>
    </SidePage>
  );
}
