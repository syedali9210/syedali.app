"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "./cn";

/**
 * Ported from the standalone "pet buddy hero" reference (index.html): an
 * isometric maze walkway with a pet that walks back and forth along its
 * centerline (bouncing + pausing at each end), a cursor-following spotlight
 * that reveals a glowing orange copy of the path edges, and depth-based
 * scaling so the pet reads bigger/nearer at the bottom of the frame. All
 * geometry/animation math is a direct port of the reference's vanilla JS —
 * kept close to the original for fidelity, adapted to refs + rAF instead of
 * getElementById + a global IIFE. The walkway surface/stroke are theme
 * tokens (matching Hero's dock/screenshot card color) so it adapts in light
 * mode; the pet's own body colors stay fixed — it's the same character
 * regardless of theme, same as the terracotta accent used elsewhere.
 *
 * On mount, the walkway assembles itself instead of just appearing: one
 * slab per straight leg of the zigzag falls from above and settles into
 * place, cascading along the path; the dashed guide rays draw themselves
 * in over the same window; and only once that's landed does the buddy drop
 * in and start its ambient walk — see the timing constants, the entrance
 * geometry block, and PathPiece/GuideLine below.
 */

const PET_BODY = "#db744f";
const PET_HI = "#ec9a78";
const PET_SH = "#b95a3c";
const PET_SH2 = "#8f4530";
const PET_OUTLINE = "#ffffff";
const PET_EYE = "#141414";
const BG = "var(--color-card)";
const STROKE = "var(--color-wire)";

const MAIN: [number, number][] = [
  [212.082, 228.432], [359.917, 143.079], [507.753, 228.432], [573.871, 190.258],
  [469.865, 130.21], [507.753, 108.336], [647.418, 27.7021], [685.304, 49.5762],
  [787.083, 108.335], [871.773, 59.4395], [909.661, 81.314], [787.083, 152.084],
  [647.42, 71.4502], [545.643, 130.211], [649.647, 190.258], [507.753, 272.181],
  [359.917, 186.828], [249.969, 250.306], [431.236, 354.96], [393.348, 376.835],
  [174.193, 250.306], [212.081, 228.431],
];
const STRIP: [number, number][] = [
  [393.347, 376.837], [308.657, 425.733], [270.769, 403.859], [355.459, 354.963],
];
const DEPTH = 12;

const TOP_PATH_D =
  "M212.082 228.432L359.917 143.079L507.753 228.432L573.871 190.258L469.865 130.21L507.753 108.336L507.755 108.337L647.418 27.7021L685.304 49.5762L685.306 49.5747L787.083 108.335L871.773 59.4395L909.661 81.314L787.083 152.084L647.42 71.4502L545.643 130.211L649.647 190.258L507.753 272.181L359.917 186.828L249.969 250.306L431.236 354.96L393.348 376.835L174.193 250.306L212.081 228.431L212.082 228.432ZM393.347 376.837L308.657 425.733L270.769 403.859L355.459 354.963L393.347 376.837Z";

// Walkway centerline — every segment is a true 30-degree isometric direction.
const WPTS: [number, number][] = [
  [289.71, 414.8], [393.34, 354.96], [212.08, 250.31], [359.92, 164.95],
  [507.75, 250.32], [611.77, 190.26], [507.75, 130.19], [647.42, 49.57],
  [787.08, 130.22], [890.72, 70.38],
];

function inPoly(p: [number, number], poly: [number, number][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const inUnion = (p: [number, number]) => inPoly(p, MAIN) || inPoly(p, STRIP);

/* ---- entrance geometry: one falling slab per straight run ----------------
   The walkway is a zigzag of straight isometric legs, so it assembles from
   one piece per leg rather than from arbitrary horizontal slices: every cut
   lands exactly on a corner, and a straight stretch always drops as a single
   block. Each piece's clip region is a quad bounded lengthwise by the two
   corner cuts and laterally by PIECE_HALF_W. */

type Vec = [number, number];
const vAdd = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const vSub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1]];
const vMul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
const vDot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1];
const vNorm = (a: Vec): Vec => {
  const len = Math.hypot(a[0], a[1]) || 1;
  return [a[0] / len, a[1] / len];
};
const vPerp = (a: Vec): Vec => [-a[1], a[0]];

// Perpendicular reach of a piece's clip region. Has to clear the walkway
// surface (~19 out from the centerline) plus the extruded side walls, while
// staying well short of the next leg of the zigzag — the closest two legs
// ever run parallel is ~104 apart, so two regions at 38 can never collide.
const PIECE_HALF_W = 38;
// How far the first/last piece reaches past the ends of the centerline, so
// the walkway's end caps (and the detached STRIP quad, which sits just
// behind the first waypoint) still travel with a piece.
const PIECE_END_CAP = 70;

const SEG_DIRS: Vec[] = WPTS.slice(0, -1).map((p, i) => vNorm(vSub(WPTS[i + 1], p)));

// Cut direction at each waypoint — the bisector of the two legs meeting
// there, i.e. the mitre seam the artwork's own corner is already built on.
// Both neighbours derive their shared edge from this one vector, so pieces
// tile back together with neither a gap nor a double-drawn overlap.
const CUT_DIRS: Vec[] = WPTS.map((_, j) => {
  if (j === 0) return vPerp(SEG_DIRS[0]);
  if (j === SEG_DIRS.length) return vPerp(SEG_DIRS[SEG_DIRS.length - 1]);
  return vNorm(vAdd(vPerp(SEG_DIRS[j - 1]), vPerp(SEG_DIRS[j])));
});

const PIECE_CLIPS: string[] = SEG_DIRS.map((u, i) => {
  const normal = vPerp(u);
  const last = SEG_DIRS.length - 1;
  const startCut = CUT_DIRS[i];
  const endCut = CUT_DIRS[i + 1];
  const start = i === 0 ? vSub(WPTS[0], vMul(u, PIECE_END_CAP)) : (WPTS[i] as Vec);
  const end = i === last ? vAdd(WPTS[i + 1], vMul(u, PIECE_END_CAP)) : (WPTS[i + 1] as Vec);
  // Dividing by the cut's alignment with this leg's normal is the mitre
  // extension: it keeps the region's *perpendicular* half-width at exactly
  // PIECE_HALF_W even where a cut runs oblique through a sharp corner.
  const startReach = PIECE_HALF_W / vDot(startCut, normal);
  const endReach = PIECE_HALF_W / vDot(endCut, normal);
  return [
    vAdd(start, vMul(startCut, startReach)),
    vAdd(end, vMul(endCut, endReach)),
    vSub(end, vMul(endCut, endReach)),
    vSub(start, vMul(startCut, startReach)),
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
});

// Entrance choreography timings (seconds unless noted). Kept as named
// constants because the imperative walk-loop start (in the effect below)
// has to line up with the JSX-driven spring transitions here.
const PIECE_DROP_PX = 170;
const PIECE_STAGGER = 0.055;
const PIECE_DURATION = 0.5;
const PIECE_BOUNCE = 0.32;
const LINES_DELAY = 0.08;
const LINES_DURATION = 0.7;
const BUDDY_DROP_DELAY = 0.92;
const BUDDY_DROP_DURATION = 0.45;
const BUDDY_DROP_BOUNCE = 0.4;
const BUDDY_DROP_PX = 90;
const WALK_START_MS = (BUDDY_DROP_DELAY + BUDDY_DROP_DURATION) * 1000;

// Wall-quad path data (the hatched slab-depth strips along bottom-facing
// edges) — pure geometry derived from MAIN/STRIP/DEPTH, identical on every
// mount, so it's computed once here instead of re-walking every edge with
// point-in-polygon checks each time the component mounts.
const WALL_QUADS: string[] = (() => {
  const quads: string[] = [];
  [MAIN, STRIP].forEach((poly) => {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (len < 1) continue;
      const n = Math.max(1, Math.ceil(len / 6));
      let run: { t0: number; t1: number } | null = null;
      const emit = (r: { t0: number; t1: number }) => {
        const x0 = a[0] + (b[0] - a[0]) * r.t0;
        const y0 = a[1] + (b[1] - a[1]) * r.t0;
        const x1 = a[0] + (b[0] - a[0]) * r.t1;
        const y1 = a[1] + (b[1] - a[1]) * r.t1;
        quads.push(`M${x0},${y0} L${x1},${y1} L${x1},${y1 + DEPTH} L${x0},${y0 + DEPTH} Z`);
      };
      for (let k = 0; k < n; k++) {
        const t0 = k / n;
        const t1 = (k + 1) / n;
        const tm = (t0 + t1) / 2;
        const mx = a[0] + (b[0] - a[0]) * tm;
        const my = a[1] + (b[1] - a[1]) * tm;
        const facing = !inUnion([mx, my + 2.5]) && inUnion([mx, my - 2.5]);
        if (facing) {
          if (!run) run = { t0, t1 };
          else run.t1 = t1;
        } else if (run) {
          emit(run);
          run = null;
        }
      }
      if (run) emit(run);
    }
  });
  return quads;
})();

const ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;

// One falling leg of the walkway. Every piece <use>s the same single copy of
// the artwork (#pbh-walkway, in defs) and differs only by which corner-to-
// corner region it clips to — so the pieces are guaranteed to reassemble
// into the original drawing exactly, with no per-piece geometry to keep in
// sync. clip-path is evaluated in the element's own coordinate system, so it
// travels with the group's transform rather than acting as a fixed wipe
// window: a piece keeps showing its whole leg the entire way down.
function PathPiece({
  index,
  reduceMotion,
  mounted,
}: {
  index: number;
  reduceMotion: boolean;
  mounted: boolean;
}) {
  const landed = reduceMotion || mounted;
  return (
    <motion.g
      clipPath={`url(#pbh-piece-${index})`}
      initial={{ y: -PIECE_DROP_PX, opacity: 0 }}
      animate={landed ? { y: 0, opacity: 1 } : { y: -PIECE_DROP_PX, opacity: 0 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", bounce: PIECE_BOUNCE, duration: PIECE_DURATION, delay: index * PIECE_STAGGER }
      }
    >
      <use href="#pbh-walkway" />
    </motion.g>
  );
}

// A dashed guide ray that draws itself in on mount, then hands back off to
// a plain static dash pattern once settled — pathLength take over
// stroke-dasharray/dashoffset while animating (which is how the draw-in is
// achieved), so the "12 12" resting look is restored afterward by simply
// rendering a plain line instead of continuing to fight motion for control
// of those attributes.
function GuideLine({
  x1, y1, x2, y2, reduceMotion, mounted,
}: {
  x1: number; y1: number; x2: number; y2: number; reduceMotion: boolean; mounted: boolean;
}) {
  // Flipped by the draw-in's own completion callback rather than a matching
  // timer, so the swap back to the dashed resting line can never drift out
  // of sync with the animation that precedes it.
  const [drawn, setDrawn] = useState(false);

  if (reduceMotion || drawn) {
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={STROKE} strokeWidth="0.5" strokeDasharray="12 12" />;
  }
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={STROKE}
      strokeWidth="0.5"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: mounted ? 1 : 0 }}
      transition={{ duration: LINES_DURATION, delay: LINES_DELAY, ease: ENTRANCE_EASE }}
      // The pre-mount `pathLength: 0 -> 0` pass also "completes"; only the
      // real draw (which can only run once mounted is true) should settle.
      onAnimationComplete={() => {
        if (mounted) setDrawn(true);
      }}
    />
  );
}

// Playable on /animations/maze-walk: `interactive` disables the ambient
// back-and-forth pacing and hands direction control to the caller — arrow
// keys on desktop, an on-screen d-pad below the frame on touch/tablet sizes.
// The Home hero never passes this, so it keeps its original ambient walk.
export default function PetBuddyPathHero({ interactive = false }: { interactive?: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wallsRef = useRef<SVGGElement>(null);
  const glowLayerRef = useRef<SVGGElement>(null);
  const spotRef = useRef<SVGCircleElement>(null);
  const petPosRef = useRef<SVGGElement>(null);
  const petMirrorRef = useRef<SVGGElement>(null);
  const petBobRef = useRef<SVGGElement>(null);
  const petScaleRef = useRef<SVGGElement>(null);
  const petShadowRef = useRef<SVGEllipseElement>(null);
  const eyesRef = useRef<SVGGElement>(null);
  const backViewRef = useRef<SVGGElement>(null);
  const shin1Ref = useRef<SVGRectElement>(null);
  const shin2Ref = useRef<SVGRectElement>(null);
  const shin3Ref = useRef<SVGRectElement>(null);
  const shin4Ref = useRef<SVGRectElement>(null);
  // Which of the 4 arrow keys are currently held — read by the rAF loop
  // each frame and written by both the keyboard listener and the on-screen
  // d-pad buttons. A ref (not state) since it's mutated from event handlers
  // without needing a React re-render on every key/pointer event.
  //
  // The walkway is a fixed 1D path, but it's isometric, so each segment
  // points in a genuinely different screen direction (some run up-right,
  // some up-left, some down-right) — there's no single "forward is always
  // the right key" mapping that feels correct on every segment. Instead,
  // each frame picks whichever arrow key actually matches *this* segment's
  // direction (see segmentDirectionKeys below), the same way you'd expect
  // an isometric character to only respond to the key that matches the
  // corridor it's currently walking.
  const heldKeysRef = useRef<Set<string>>(new Set());
  // Render-visible mirror of the ref above, purely so the d-pad can light up
  // the direction currently being held. The ref stays the source of truth for
  // the rAF loop (which must not depend on React's render timing); this only
  // has to keep up with the eye, and arrow presses are far too infrequent for
  // the extra renders to matter.
  const [heldKeys, setHeldKeys] = useState<string[]>([]);

  const press = (key: string) => {
    heldKeysRef.current.add(key);
    setHeldKeys((keys) => (keys.includes(key) ? keys : [...keys, key]));
  };
  const release = (key: string) => {
    heldKeysRef.current.delete(key);
    setHeldKeys((keys) => keys.filter((k) => k !== key));
  };

  // Drives both the JSX-level entrance springs (pieces/lines/buddy) and the
  // imperative walk-loop delay below — a single source of truth so an OS
  // "reduce motion" preference skips the whole choreography and lands
  // everything in its resting state immediately, matching the ambient
  // walk's own existing reduced-motion behavior.
  const prefersReducedMotion = useReducedMotion();

  // This whole subtree sits inside PageTransition's
  // `<AnimatePresence initial={false}>`, and that flag rides React context
  // down to *every* descendant motion component — not just AnimatePresence's
  // own children — telling each one to skip its mount animation and render
  // straight at `animate`. So an entrance written as plain initial->animate
  // silently never plays here. Flipping a flag one render after hydration
  // turns it into an ordinary state change on an already-mounted element,
  // which Motion does animate. The extra render is the entire point of the
  // effect, so the cascading-render lint rule doesn't apply.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Two rAFs deep, not an immediate flip: on a cold hard reload this effect
    // fires while the rest of the page is still hydrating/decoding images,
    // so the browser hasn't necessarily painted the pre-entrance (rest)
    // frame yet. Motion's springs are wall-clock driven — if that hydration
    // work blocks the main thread right as they start, the first real paint
    // lands mid-spring instead of at frame 0, and it reads as a jump/stutter
    // instead of a fall. Two rAFs guarantee at least one real paint has
    // already happened before the choreography's clock starts ticking.
    //
    // A backgrounded/unfocused tab can suspend rAF delivery entirely — the
    // walkway would then never drop in at all instead of just landing a beat
    // late, which is worse than the jump this is fixing. A capped timeout
    // races it: whichever fires first wins, `fired` stops the loser.
    let fired = false;
    const flip = () => {
      if (fired) return;
      fired = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate post-paint flip; see above
      setMounted(true);
    };
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(flip);
    });
    const fallback = window.setTimeout(flip, 200);
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      clearTimeout(fallback);
    };
  }, []);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const wallsEl = wallsRef.current;
    const glowLayer = glowLayerRef.current;
    const spot = spotRef.current;
    const petPos = petPosRef.current;
    const petMirror = petMirrorRef.current;
    const petBob = petBobRef.current;
    const petScale = petScaleRef.current;
    const petShadow = petShadowRef.current;
    const eyes = eyesRef.current;
    const backView = backViewRef.current;
    const shins = [shin1Ref.current, shin2Ref.current, shin3Ref.current, shin4Ref.current];
    if (!svg || !wallsEl || !glowLayer || !spot || !petPos || !petMirror || !petBob || !petScale || !petShadow || !eyes || !backView || shins.some((s) => !s)) {
      return;
    }

    // Cursor spotlight: orange stroke-only copies of every path edge,
    // visible only inside the radial mask that follows the pointer. Cloned
    // from the shared #pbh-walkway definition rather than from the rendered
    // pieces — the pieces are all <use> references to it, so this is the
    // only place the real path elements exist (and each shape appears once).
    svg.querySelectorAll("#pbh-walkway path.pbh-wall-quad").forEach((p) => {
      const c = p.cloneNode() as SVGPathElement;
      c.setAttribute("fill", "none");
      c.setAttribute("stroke", PET_BODY);
      c.setAttribute("stroke-width", "1");
      glowLayer.appendChild(c);
    });
    const topPathEl = svg.querySelector("#pbh-top-path");
    if (topPathEl) {
      const top = topPathEl.cloneNode() as SVGPathElement;
      top.removeAttribute("id");
      top.setAttribute("fill", "none");
      top.setAttribute("stroke", PET_BODY);
      top.setAttribute("stroke-width", "1.2");
      glowLayer.appendChild(top);
    }

    const onPointerMove = (e: PointerEvent) => {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const p = pt.matrixTransform(ctm.inverse());
      spot.setAttribute("cx", String(p.x));
      spot.setAttribute("cy", String(p.y));
      glowLayer.style.opacity = "0.9";
    };
    const onPointerLeave = () => {
      spot.setAttribute("cx", "-200");
      spot.setAttribute("cy", "-200");
      glowLayer.style.opacity = "0";
    };
    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerleave", onPointerLeave);

    const isTypingTarget = (target: EventTarget | null) =>
      target instanceof HTMLElement && (target.tagName === "INPUT" || target.tagName === "TEXTAREA");
    const ARROW_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);

    // Mirrors into `heldKeys` state as well as the ref so the on-screen d-pad
    // lights up under keyboard control, not just under pointer presses (which
    // get :active for free). setState is stable, so this needs no extra deps.
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !ARROW_KEYS.has(e.key)) return;
      heldKeysRef.current.add(e.key);
      setHeldKeys((keys) => (keys.includes(e.key) ? keys : [...keys, e.key]));
      e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (!ARROW_KEYS.has(e.key)) return;
      heldKeysRef.current.delete(e.key);
      setHeldKeys((keys) => keys.filter((k) => k !== e.key));
    };
    if (interactive) {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);
    }

    const segs: { x0: number; y0: number; x1: number; y1: number; len: number; start: number }[] = [];
    let total = 0;
    for (let i = 0; i < WPTS.length - 1; i++) {
      const [x0, y0] = WPTS[i];
      const [x1, y1] = WPTS[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0);
      segs.push({ x0, y0, x1, y1, len, start: total });
      total += len;
    }
    const minY = 49.57;
    const maxY = 414.8;

    const ANCHOR_X = 131.25;
    const ANCHOR_Y = 150;
    const BASE_S = 0.23;
    const SPEED = 100;
    const PAUSE_MS = 700;
    const STEP_MS = 130;
    const JOG = 12;
    const TICK = 1 / 12;
    const PIX = 3;

    const q = (v: number, s: number) => Math.round(v / s) * s;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

    function segmentAt(t: number) {
      let idx = segs.findIndex((s) => t >= s.start && t <= s.start + s.len);
      if (idx === -1) idx = t <= 0 ? 0 : segs.length - 1;
      return segs[idx];
    }

    // Which arrow key advances/retreats along a given segment, based on its
    // actual on-screen direction — every segment here is a true isometric
    // diagonal (NE, NW, or SE in this particular walkway), so only one key
    // pair is ever the "right" one for it, and it changes at each corner.
    function directionKeysFor(s: { x0: number; y0: number; x1: number; y1: number }) {
      const dx = s.x1 - s.x0;
      const dy = s.y1 - s.y0;
      if (dx >= 0 && dy <= 0) return { forwardKey: "ArrowUp", backwardKey: "ArrowDown" }; // NE
      if (dx <= 0 && dy <= 0) return { forwardKey: "ArrowLeft", backwardKey: "ArrowRight" }; // NW
      if (dx >= 0 && dy >= 0) return { forwardKey: "ArrowRight", backwardKey: "ArrowLeft" }; // SE
      return { forwardKey: "ArrowDown", backwardKey: "ArrowUp" }; // SW
    }

    let travelled = 0;
    let dir = 1;
    let paused = false;
    let segIndex = 0;
    let stepPhase = 0;
    let stepTimer = 0;
    let squashUntil = 0;
    let acc = 0;
    let last = performance.now();
    let raf = 0;
    let restTimer: ReturnType<typeof setTimeout> | null = null;
    let walkStartTimer: ReturnType<typeof setTimeout> | null = null;

    function pose() {
      let idx = segs.findIndex((s) => travelled >= s.start && travelled <= s.start + s.len);
      if (idx === -1) idx = travelled <= 0 ? 0 : segs.length - 1;
      if (idx !== segIndex) {
        segIndex = idx;
        squashUntil = performance.now() + 170;
      }
      const s = segs[idx];
      const t = clamp((travelled - s.start) / s.len, 0, 1);
      const x = lerp(s.x0, s.x1, t);
      const y = lerp(s.y0, s.y1, t);

      const vx = (s.x1 - s.x0) * dir;
      const vy = (s.y1 - s.y0) * dir;
      const facingBack = vy < 0;
      const mirror = vx < 0 ? -1 : 1;

      const depth = lerp(0.68, 1.14, (y - minY) / (maxY - minY));

      return { x, y, facingBack, mirror, depth, moving: !paused };
    }

    function render(p: ReturnType<typeof pose>, now: number) {
      petPos!.setAttribute("transform", `translate(${q(p.x, 1)},${q(p.y, 1)})`);

      let squash = 1;
      if (now < squashUntil) squash = squashUntil - now > 85 ? 0.72 : 0.88;
      petMirror!.setAttribute("transform", `scale(${p.mirror * squash},1)`);

      petScale!.setAttribute(
        "transform",
        `scale(${(BASE_S * p.depth).toFixed(4)}) translate(${-ANCHOR_X},${-ANCHOR_Y})`
      );
      petShadow!.setAttribute("rx", String(30 * p.depth));
      petShadow!.setAttribute("ry", String(8 * p.depth));

      backView!.style.opacity = p.facingBack ? "1" : "0";
      eyes!.style.opacity = p.facingBack ? "0" : "1";
      if (!p.facingBack) eyes!.setAttribute("transform", "translate(6,4)");

      const jog = p.moving ? (stepPhase ? JOG : -JOG) : 0;
      shins.forEach((sh, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        sh!.setAttribute("transform", `translate(${q(jog * side, PIX)},0)`);
      });
      petBob!.setAttribute("transform", `translate(0,${p.moving && stepPhase ? -3 : 0})`);
    }

    function rest(nextDir: number) {
      paused = true;
      squashUntil = performance.now() + 170;
      restTimer = setTimeout(() => {
        dir = nextDir;
        paused = false;
        squashUntil = performance.now() + 170;
      }, PAUSE_MS);
    }

    function frame(now: number) {
      const dt = clamp((now - last) / 1000 || 0.016, 0.001, 0.05);
      last = now;

      if (interactive) {
        // Held-key/button state drives direction directly instead of the
        // ambient bounce-at-the-ends cycle. Which key counts as forward vs
        // backward is re-evaluated every frame from the *current* segment
        // — holding both (or holding a key that doesn't match this
        // segment's direction) cancels out and the buddy just stands.
        const { forwardKey, backwardKey } = directionKeysFor(segmentAt(travelled));
        const held = heldKeysRef.current;
        const forward = held.has(forwardKey);
        const backward = held.has(backwardKey);
        const active = forward !== backward;
        paused = !active;
        if (active) {
          dir = forward ? 1 : -1;
          travelled = clamp(travelled + dir * SPEED * dt, 0, total);
          stepTimer += dt * 1000;
          if (stepTimer >= STEP_MS) {
            stepTimer = 0;
            stepPhase = 1 - stepPhase;
          }
        }
      } else if (!paused) {
        travelled += dir * SPEED * dt;
        if (travelled >= total) {
          travelled = total;
          rest(-1);
        } else if (travelled <= 0) {
          travelled = 0;
          rest(1);
        }
        stepTimer += dt * 1000;
        if (stepTimer >= STEP_MS) {
          stepTimer = 0;
          stepPhase = 1 - stepPhase;
        }
      }

      acc += dt;
      if (acc >= TICK) {
        acc = 0;
        render(pose(), now);
      }
      raf = requestAnimationFrame(frame);
    }

    if (interactive) paused = true; // idle, standing still until a key/button is held

    // Render the resting pose immediately (so there's never a blank/T-pose
    // frame), but hold off starting the rAF walk loop until the buddy's own
    // drop-in has actually landed — walking while still invisible (or
    // mid-fall) would read as broken rather than sequenced.
    render(pose(), performance.now());
    if (prefersReducedMotion) {
      raf = requestAnimationFrame(frame);
    } else {
      walkStartTimer = setTimeout(() => {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }, WALK_START_MS);
    }
    // Now that it's actually positioned, reveal it (see the group's opacity
    // comment in the JSX above) — the *outer* drop-in wrapper still hides it
    // visually until its own delayed spring starts.
    petPos.style.opacity = "1";

    return () => {
      if (raf) cancelAnimationFrame(raf);
      if (restTimer) clearTimeout(restTimer);
      if (walkStartTimer) clearTimeout(walkStartTimer);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerleave", onPointerLeave);
      if (interactive) {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
      }
    };
  }, [interactive, prefersReducedMotion]);

  // Held state is driven off `heldKeys` rather than CSS :active so the pad
  // reads the same whether the input was a click or the matching arrow key.
  const dpadButtonClass = (key: string) =>
    cn(
      "flex size-10 items-center justify-center rounded-lg shadow-[var(--media-shadow)] transition-colors select-none touch-none",
      heldKeys.includes(key)
        ? "bg-card text-ink"
        : "bg-surface text-label hover:bg-card hover:text-ink"
    );

  return (
    <div className="relative mx-auto flex w-full max-w-[680px] flex-col items-center gap-6">
      <svg
        ref={svgRef}
        viewBox="0 0 1041 435"
        fill="none"
        className="block w-full overflow-visible"
        aria-label="Pixel pet buddy walking the isometric path"
      >
        {/* Dashed guide rays extended way past the viewBox (svg overflow is
            visible) so they run off the screen edges in their own isometric
            direction — the walkway/pet stay clipped to the frame below. */}
        <g aria-hidden>
          <GuideLine x1={-1276.4} y1={-801.7} x2={354.625} y2={136.283} reduceMotion={!!prefersReducedMotion} mounted={mounted} />
          <GuideLine x1={786.624} y1={152.283} x2={3679.6} y2={1802.3} reduceMotion={!!prefersReducedMotion} mounted={mounted} />
          <GuideLine x1={906.375} y1={83.6679} x2={2479.6} y2={-824.6} reduceMotion={!!prefersReducedMotion} mounted={mounted} />
          <GuideLine x1={-2395.3} y1={1842.4} x2={178.217} y2={247.561} reduceMotion={!!prefersReducedMotion} mounted={mounted} />
        </g>
        <g clipPath="url(#pbh-frame-clip)">
          <GuideLine x1={507.624} y1={272.283} x2={820.624} y2={450.283} reduceMotion={!!prefersReducedMotion} mounted={mounted} />
          <GuideLine x1={649.363} y1={190.228} x2={744.363} y2={128.291} reduceMotion={!!prefersReducedMotion} mounted={mounted} />
          <GuideLine x1={551.625} y1={-27.7165} x2={649.839} y2={28.9872} reduceMotion={!!prefersReducedMotion} mounted={mounted} />

          <g ref={wallsRef}>
            {PIECE_CLIPS.map((_, index) => (
              <PathPiece
                key={index}
                index={index}
                reduceMotion={!!prefersReducedMotion}
                mounted={mounted}
              />
            ))}
          </g>

          <g ref={glowLayerRef} mask="url(#pbh-spot-mask)" style={{ opacity: 0, pointerEvents: "none", transition: "opacity 0.35s ease" }} />

          {/* Starts hidden: this group's actual position only exists as an
              imperative transform set by the effect below, so on a fresh
              (non-hydrated) load the raw server-rendered markup has no
              transform yet and would otherwise flash at the origin for a
              frame. Opacity is static/SSR-safe, so the browser's very first
              paint already renders it invisible; the effect reveals it only
              once positioned, before that first paint of the hydrated tree.
              The outer motion.g is the actual entrance: it holds the whole
              thing at opacity 0 until the walkway has landed, then drops
              the buddy in from above — independent of petPosRef's own
              transform, which the walk loop keeps driving underneath it. */}
          <motion.g
            initial={{ y: -BUDDY_DROP_PX, opacity: 0 }}
            animate={
              prefersReducedMotion || mounted ? { y: 0, opacity: 1 } : { y: -BUDDY_DROP_PX, opacity: 0 }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { type: "spring", bounce: BUDDY_DROP_BOUNCE, duration: BUDDY_DROP_DURATION, delay: BUDDY_DROP_DELAY }
            }
          >
            <g ref={petPosRef} style={{ pointerEvents: "none", opacity: 0 }}>
              <g ref={petMirrorRef}>
                <ellipse ref={petShadowRef} cx="0" cy="0" rx="30" ry="8" fill="#000" opacity="0.45" />
                <g ref={petBobRef}>
                  <g ref={petScaleRef}>
                    <g fill={PET_SH2}>
                      <use href="#pbh-pet-shape" transform="translate(-24,14)" opacity="0.55" />
                      <use href="#pbh-pet-shape" transform="translate(-12,7)" opacity="0.8" />
                    </g>

                    <g filter="url(#pbh-outline)">
                      <g fill={PET_BODY}>
                        <rect x="56.25" y="0" width="150" height="112.5" />
                        <g>
                          <rect x="56.25" y="0" width="150" height="9.375" fill={PET_HI} />
                          <rect x="56.25" y="9.375" width="9.375" height="93.75" fill={PET_HI} />
                          <rect x="196.875" y="0" width="9.375" height="103.125" fill={PET_SH} />
                          <rect x="56.25" y="103.125" width="150" height="9.375" fill={PET_SH} />
                          <rect x="93.75" y="84.375" width="7.5" height="7.5" fill={PET_SH} opacity="0.45" />
                          <rect x="140.625" y="90" width="7.5" height="7.5" fill={PET_SH} opacity="0.45" />
                          <rect x="121.875" y="72" width="7.5" height="7.5" fill={PET_SH} opacity="0.35" />
                        </g>

                        <g>
                          <rect x="28.125" y="37.5" width="28.125" height="37.5" />
                          <rect x="0" y="37.5" width="28.125" height="37.5" />
                          <rect x="28.125" y="37.5" width="28.125" height="6" fill={PET_HI} />
                        </g>
                        <g>
                          <rect x="206.25" y="37.5" width="28.125" height="37.5" />
                          <rect x="234.375" y="37.5" width="28.125" height="37.5" />
                          <rect x="206.25" y="37.5" width="28.125" height="6" fill={PET_HI} />
                        </g>

                        <g fill={PET_SH}>
                          <g>
                            <rect x="56.25" y="112.5" width="18.75" height="18.75" />
                            <rect ref={shin1Ref} x="56.25" y="125.25" width="18.75" height="24.75" fill={PET_SH2} />
                            <rect x="59.625" y="120.75" width="12" height="9" />
                          </g>
                          <g>
                            <rect x="93.75" y="112.5" width="18.75" height="18.75" />
                            <rect ref={shin2Ref} x="93.75" y="125.25" width="18.75" height="24.75" fill={PET_SH2} />
                            <rect x="97.125" y="120.75" width="12" height="9" />
                          </g>
                          <g>
                            <rect x="150" y="112.5" width="18.75" height="18.75" />
                            <rect ref={shin3Ref} x="150" y="125.25" width="18.75" height="24.75" fill={PET_SH2} />
                            <rect x="153.375" y="120.75" width="12" height="9" />
                          </g>
                          <g>
                            <rect x="187.5" y="112.5" width="18.75" height="18.75" />
                            <rect ref={shin4Ref} x="187.5" y="125.25" width="18.75" height="24.75" fill={PET_SH2} />
                            <rect x="190.875" y="120.75" width="12" height="9" />
                          </g>
                        </g>
                      </g>

                      <g ref={backViewRef} style={{ opacity: 0 }}>
                        <rect x="65.625" y="9.375" width="131.25" height="93.75" fill={PET_SH} opacity="0.6" />
                        <rect x="112.5" y="28" width="37.5" height="30" fill={PET_SH2} opacity="0.5" />
                      </g>

                      <g ref={eyesRef}>
                        <g fill={PET_EYE}>
                          <rect x="75" y="18.75" width="18.75" height="18.75" />
                          <rect x="168.75" y="18.75" width="18.75" height="18.75" />
                          <rect x="78" y="21.75" width="5.5" height="5.5" fill={PET_OUTLINE} />
                          <rect x="171.75" y="21.75" width="5.5" height="5.5" fill={PET_OUTLINE} />
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </motion.g>
        </g>

        <defs>
          <clipPath id="pbh-frame-clip">
            <rect x="0.5" y="0.5" width="1040" height="434" />
          </clipPath>

          {/* The single shared copy of the walkway artwork. Each falling
              piece <use>s this and clips it to its own leg; the cursor
              spotlight's glow layer clones these same paths (see the effect
              above), so there's exactly one source of truth for the shape. */}
          <g id="pbh-walkway">
            {WALL_QUADS.map((d, i) => (
              <path key={i} className="pbh-wall-quad" d={d} fill="url(#pbh-hatch)" stroke={STROKE} strokeWidth="0.75" />
            ))}
            <path id="pbh-top-path" d={TOP_PATH_D} fill={BG} stroke={STROKE} strokeWidth="1" />
          </g>

          {PIECE_CLIPS.map((points, index) => (
            <clipPath id={`pbh-piece-${index}`} key={index}>
              <polygon points={points} />
            </clipPath>
          ))}

          <pattern id="pbh-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="6" fill={BG} />
            <line x1="0" y1="0" x2="0" y2="6" stroke={STROKE} strokeWidth="1" opacity="0.65" />
          </pattern>

          <radialGradient id="pbh-spot-grad">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="65%" stopColor="#fff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="pbh-spot-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="1041" height="435">
            <circle ref={spotRef} cx="-200" cy="-200" r="85" fill="url(#pbh-spot-grad)" />
          </mask>

          <filter id="pbh-outline" x="-25%" y="-25%" width="150%" height="150%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="3.4" result="d" />
            <feFlood floodColor={PET_SH2} />
            <feComposite in2="d" operator="in" result="o" />
            <feMerge>
              <feMergeNode in="o" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <g id="pbh-pet-shape">
            <rect x="56.25" y="0" width="150" height="112.5" />
            <rect x="0" y="37.5" width="56.25" height="37.5" />
            <rect x="206.25" y="37.5" width="56.25" height="37.5" />
            <rect x="56.25" y="112.5" width="18.75" height="37.5" />
            <rect x="93.75" y="112.5" width="18.75" height="37.5" />
            <rect x="150" y="112.5" width="18.75" height="37.5" />
            <rect x="187.5" y="112.5" width="18.75" height="37.5" />
          </g>
        </defs>
      </svg>

      {interactive && (
        // Shown at every size: on touch it's the only way to steer, and on
        // desktop it doubles as the readout for the arrow keys — the held
        // direction lights up whichever way you drove it, so the pad also
        // answers "is this key doing anything?" on segments where the buddy
        // legitimately ignores an arrow that doesn't match the corridor.
        <div className="flex flex-col items-center gap-3">
          <div className="grid grid-cols-3 grid-rows-3 gap-1.5">
            <span aria-hidden />
            <button
              type="button"
              aria-label="Move buddy up"
              onPointerDown={() => press("ArrowUp")}
              onPointerUp={() => release("ArrowUp")}
              onPointerLeave={() => release("ArrowUp")}
              onPointerCancel={() => release("ArrowUp")}
              className={dpadButtonClass("ArrowUp")}
            >
              <ArrowUp className="size-4" />
            </button>
            <span aria-hidden />

            <button
              type="button"
              aria-label="Move buddy left"
              onPointerDown={() => press("ArrowLeft")}
              onPointerUp={() => release("ArrowLeft")}
              onPointerLeave={() => release("ArrowLeft")}
              onPointerCancel={() => release("ArrowLeft")}
              className={dpadButtonClass("ArrowLeft")}
            >
              <ArrowLeft className="size-4" />
            </button>
            <span aria-hidden />
            <button
              type="button"
              aria-label="Move buddy right"
              onPointerDown={() => press("ArrowRight")}
              onPointerUp={() => release("ArrowRight")}
              onPointerLeave={() => release("ArrowRight")}
              onPointerCancel={() => release("ArrowRight")}
              className={dpadButtonClass("ArrowRight")}
            >
              <ArrowRight className="size-4" />
            </button>

            <span aria-hidden />
            <button
              type="button"
              aria-label="Move buddy down"
              onPointerDown={() => press("ArrowDown")}
              onPointerUp={() => release("ArrowDown")}
              onPointerLeave={() => release("ArrowDown")}
              onPointerCancel={() => release("ArrowDown")}
              className={dpadButtonClass("ArrowDown")}
            >
              <ArrowDown className="size-4" />
            </button>
            <span aria-hidden />
          </div>
          <p className="text-small text-label [@media(pointer:fine)]:hidden">
            Press the arrows to make the buddy move
          </p>
          <p className="hidden text-small text-label [@media(pointer:fine)]:block">
            Use the arrow keys — or click the pad — to make the buddy move
          </p>
        </div>
      )}
    </div>
  );
}
