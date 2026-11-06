import type { CSSProperties } from "react";
import { duration, experience } from "@/content/experience";
import { Icon } from "./Icon";
import { PageLink } from "./PageLink";
import { Rock, SidePage } from "./SidePage";

/**
 * Experience as its own page, on the archive's layout. Every role is a card of the archive's kind: its dates and a red number, the rock
 * of what it made (alive, and a way into its case study), the role, what was done on a dashed rule, and its tools along the foot.
 */
export function Experience() {
  const roles = experience.flatMap((co) => co.roles.map((role) => ({ co, role })));
  return (
    <SidePage page="experience" title="Experience" desc="An internship at Basenine, and two campaign sites for Decathlon India. Press a stone to read its case study.">
      <ul className="cards">
        {roles.map(({ co, role }, n) => (
          <li key={role.title} className="card xp" data-fly-scope style={{ "--i": n } as CSSProperties}>
            <p className="card-top">
              <span>
                {role.start} — {role.end ?? "Now"} · {duration(role.start, role.end)}
              </span>
              <b>{String(n + 1).padStart(4, "0")}</b>
            </p>
            <div className="xp-body">
              <div className="xp-stones" data-n={role.stones.length}>
                {role.stones.map((s, k) => (
                  <Rock key={s.slug} slug={s.slug} title={s.title} rot={[-9, 8][k] ?? -6} />
                ))}
              </div>
              <div className="xp-text">
                <h2 className="card-title font-serif">{role.title}</h2>
                <p className="xp-who">
                  {/* eslint-disable-next-line @next/next/no-img-element -- a 16 px mark */}
                  <img src={co.logo} alt="" width={16} height={16} />
                  {co.site ? (
                    <a href={co.site} target="_blank" rel="noopener">
                      {co.name} <Icon name="arrow-up-right" size={12} />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : (
                    <span>{co.name}</span>
                  )}
                  <span className="xp-type">· {role.type}</span>
                  {co.current && (
                    <span className="xp-now">
                      <span className="live-dot relative size-1.5 shrink-0 rounded-full bg-live" aria-hidden="true" />
                      Now
                    </span>
                  )}
                </p>
                <ul className="xp-points card-note">
                  {role.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {role.href && (
                  <PageLink href={role.href} className="xp-go" data-stone={role.stones[0]?.slug}>
                    Read the case study <span aria-hidden="true">→</span>
                  </PageLink>
                )}
              </div>
            </div>
            <p className="card-tags">
              <span className="sr-only">Tools: </span>
              {role.skills.map((s) => (
                <span key={s}>{s}</span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </SidePage>
  );
}
