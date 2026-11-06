/**
 * Memory (Trace): one project as five stacked plates, the same memory read five ways. From the bottom: the core,
 * the case study (ruled lines), the canvas (a grid of blocks), the diffs (a before and an after) and the timeline
 * (a spine of ticks). The pointer's x pulls the stack apart; its height picks a plate, which takes the bright edge.
 * The slider is how far the stack can open.
 */
const { Cam, clamp, lerp, facing, fit, prism, proj, rings, rrect, ringAt, poly, seg, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

const N = 5, X1 = 104, Y1 = 66, T = 3, SHIFT = 0.9, GMIN = 5, REST = 14;
const NAMES = ["core", "study", "canvas", "diff", "time"];

/** Plate k's own marks on its top face, at height z, offset by (o, o): geometry, never words. */
function marks(P, k, z, o) {
  const Q = (x, y, zz) => P(x + o, y, zz);
  const p = (x, y) => Q(x, y, z);
  const ring = (x0, y0, x1, y1) => poly(ringAt(Q, rrect(x0, y0, x1, y1, 2.5, 3), z));
  if (k === 4) return [seg(p(12, 50), p(84, 50)), ...[0, 1, 2, 3, 4, 5, 6].map((i) => seg(p(16 + i * 11, 44), p(16 + i * 11, 56)))].join("");
  if (k === 3) return ring(12, 34, 44, 60) + ring(52, 34, 84, 60);
  if (k === 2) return [0, 1, 2].flatMap((i) => [0, 1].map((j) => ring(12 + i * 25, 30 + j * 16, 32 + i * 25, 42 + j * 16))).join("");
  if (k === 1) return [38, 45, 52, 59].map((y, i) => seg(p(12, y), p(i === 3 ? 56 : 84, y))).join("");
  return [0, 1, 2].flatMap((i) => [0, 1, 2].map((j) => ring(30 + i * 13, 34 + j * 9, 36 + i * 13, 38 + j * 9))).join("");
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gmax = value;
  const C = Cam(45, 0.5, 1.62);
  // Fitted to the most open pose, so the stack never leaves the frame (rule 03).
  const hiZ = (N - 1) * 24 + T, hiO = -(N - 1) * 24 * SHIFT;
  fit(C, [[0, 0, 0], [X1, Y1, 0], [X1, 0, 0], [0, Y1, 0], [hiO, 0, hiZ], [X1 + hiO, 0, hiZ], [hiO, Y1, hiZ], [X1 + hiO, Y1, hiZ]], 200, 166);
  const P = proj(C), front = facing(C);
  const [ring, inner] = rings(0, 0, X1, Y1, 9, 1.6);

  const g = mk("g", {}, svg), plates = [];
  for (let k = 0; k < N; k++) {
    const el = solid(g), m = mk("path", { class: "nf lo" }, el.g);
    plates.push({ el, m });
  }
  const gap = spring(REST, { eps: 0.02 });
  let drawn = NaN, pick = -1, rest = N - 1;

  /** Plate k's height and backward shift for a gap. */
  const pose = (k, gp) => ({ z: k * gp, o: -k * gp * SHIFT });
  // Each plate is a prism of the shifted footprint: shift the ring's samples, not the camera.
  const shifted = (r, o) => r.map((q) => ({ ...q, u: q.u + o }));

  function draw(gp) {
    if (gp === drawn) return;
    drawn = gp;
    plates.forEach((pl, k) => {
      const { z, o } = pose(k, gp);
      put(pl.el, prism(P, front, shifted(ring, o), shifted(inner, o), z, z + T));
      pl.m.setAttribute("d", marks(P, k, z + T, o));
    });
  }
  function light() {
    const a = pick < 0 ? rest : pick;
    plates.forEach((pl, k) => pl.el.sil.classList.toggle("hi", k === a));
    read.textContent = pick < 0 ? "rest" : NAMES[pick];
  }

  const B = register(stage, (dt) => {
    const m = stepS(gap, dt);
    draw(gap.x);
    return m;
  });
  bag.add(B.unregister);

  bag.add(pointer(stage, {
    move: ([x, y]) => {
      gap.t = lerp(GMIN, gmax, clamp((x - 70) / 260, 0, 1));
      // Pick by the target pose (rule 01): the plate whose centre will sit nearest the pointer's height.
      let best = -1, bd = Infinity;
      for (let k = 0; k < N; k++) {
        const { z, o } = pose(k, gap.t);
        const d = Math.abs(P(X1 / 2 + o, Y1 / 2, z + T)[1] - y);
        if (d < bd) { bd = d; best = k; }
      }
      pick = bd < 34 ? best : -1;
      light();
      B.wake();
    },
    leave: () => { gap.t = REST; pick = -1; light(); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  draw(gap.x);
  light();
  return { set: (v) => { gmax = v; }, destroy: bag.dispose };
}

hairline({
  name: "memory",
  means: "One project as five plates: the timeline, the diffs, the canvas, the case study and the core memory under them.",
  rules: [1, 3, 4, 10],
  range: [14, 19, 24],
  mount,
});
