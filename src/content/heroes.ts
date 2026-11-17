/**
 * The front page's first screen comes in four arrangements, all from Syed's Figma file (4x5ipL3dTlhJBwMzLpXCe1): the same words and
 * stones, placed four ways. One shows at a time and the next takes over every two hours, the same one for everyone. layout.tsx picks it
 * before the first paint and puts it on <html data-hero>; the CSS (globals.css) and the stones' places (LAY in Stamps.tsx) follow it.
 * `?hero=orbit` shows one on demand. They apply from 1280 wide and 720 tall; a smaller screen always gets the studio, which folds down to 1024.
 *
 *   studio    08 — Staggered studio    node 73:932
 *   orbit     09 — Orbital poetry      node 74:2
 *   diagonal  10 — Diagonal manifesto  node 74:128
 *   gallery   12 — Collected gallery wall  node 74:380
 */
export const HEROES = ["studio", "orbit", "diagonal", "gallery"] as const;
export type Hero = (typeof HEROES)[number];

/** How long each one stays up: two hours. */
const SPELL = 2 * 60 * 60 * 1000;

/**
 * Runs in <head> before the first paint: the asked-for arrangement if the address names one, otherwise whichever is up now (they take
 * turns in order, counted from 1970, so every visitor sees the same one).
 */
export const PICK_HERO = `var h=new URLSearchParams(location.search).get('hero'),H=${JSON.stringify(HEROES)};d.dataset.hero=H.indexOf(h)>=0?h:H[Math.floor(Date.now()/${SPELL})%H.length];`;
