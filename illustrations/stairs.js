/**
 * Stairs (every case study's design process): a flight of steps, one per phase, rising away from you, each holding
 * what that phase left behind: a notepad, a fan of sticky notes, a screen, a phone, a parcel. A ball climbs the flight
 * on its own, one hop per phase, rests at the top, then rolls back down to begin again: the process, repeated. Point at
 * a step and the ball goes there and waits, and that step's object lifts and takes the bright edge. The phases come
 * from the page (?p=Discover,Define,…&k=notes,cards,…). The read-out names the phase; the slider is the beat per hop.
 */
const { Cam, circ, clamp, facing, fit, lerp, open, poly, prism, proj, rings, rrect, seg, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

const q = new URLSearchParams(location.search);
const PHASES = (q.get("p") || "Discover,Define,Explore,Build,Ship").split(",").slice(0, 6);
const KINDS = (q.get("k") || "notes,cards,screen,phone,box").split(",");
const N = PHASES.length, SW = 30, D = 38, SH = 13, BALL = 5.4, HOP = 14, LIFT = 13;

/** Step k (0 is the lowest, at the front) and the centre of its top. */
const x0 = (k) => (N - 1 - k) * SW;
const top = (k) => [x0(k) + SW / 2, D / 2, (k + 1) * SH];

/** A ring turned by a degrees about (cx, cy). */
const turn = (ring, a, cx, cy) => {
  const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
  return ring.map((r) => ({ u: cx + r.u * c - r.v * s, v: cy + r.u * s + r.v * c, nu: r.nu * c - r.nv * s, nv: r.nu * s + r.nv * c }));
};

/** What a phase leaves behind, standing on its step: drawn into the solids given, z0 its foot. */
function artefact(kind, P, front, el, marks, [cx, cy], z0) {
  const box = (w, d, h, r = 1.4) => rings(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, r, Math.min(0.8, w / 6, d / 6));
  if (kind === "cards") {
    // Three sticky notes, fanned.
    const parts = [-14, 6, -2].map((a, i) => prism(P, front, turn(rrect(-7, -7, 7, 7, 1, 3), a, cx, cy), turn(rrect(-6, -6, 6, 6, 0.6, 3), a, cx, cy), z0 + i * 1.3, z0 + i * 1.3 + 1));
    put(el, { sil: parts.map((p) => p.sil).join(""), crease: parts[2].crease });
    marks.setAttribute("d", "");
  } else if (kind === "screen" || kind === "phone") {
    // A standing panel, its glass inset; a screen has a foot.
    const [w, h] = kind === "screen" ? [20, 14] : [9, 17];
    const [r, i] = box(w, 2.2, 0);
    const lift = kind === "screen" ? 3 : 0;
    const p = prism(P, front, r, i, z0 + lift, z0 + lift + h);
    const foot = kind === "screen" ? prism(P, front, ...box(8, 6, 0, 1), z0, z0 + 1.4) : { sil: "", crease: "" };
    put(el, { sil: foot.sil + p.sil, crease: p.crease });
    const fy = cy + 1.11, z1 = z0 + lift;
    marks.setAttribute("d", poly([[cx - w / 2 + 1.6, z1 + 1.6], [cx + w / 2 - 1.6, z1 + 1.6], [cx + w / 2 - 1.6, z1 + h - 1.6], [cx - w / 2 + 1.6, z1 + h - 1.6]].map(([x, z]) => P(x, fy, z))));
  } else if (kind === "box") {
    // A parcel: its lid seam and the tape across it.
    const [r, i] = box(16, 14, 0);
    put(el, prism(P, front, r, i, z0, z0 + 10));
    marks.setAttribute("d", seg(P(cx, cy - 7, z0 + 10), P(cx, cy + 7, z0 + 10)) + open([P(cx, cy + 7, z0 + 10), P(cx, cy + 7, z0 + 6)]));
  } else {
    // A notepad: its cover and the lines on its top page.
    const [r, i] = box(15, 18, 0);
    put(el, prism(P, front, r, i, z0, z0 + 2.4));
    const z = z0 + 2.4;
    marks.setAttribute("d", [-4, 0, 4].map((d) => seg(P(cx - 4, cy + d, z), P(cx + 5, cy + d, z))).join("") + seg(P(cx - 6, cy - 7, z), P(cx - 6, cy + 7, z)));
  }
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let beat = value;
  const C = Cam(45, 0.5, clamp(2.75 - N * 0.16, 1.7, 2.3));
  fit(C, [[0, 0, 0], [N * SW, D, 0], [N * SW, 0, 0], [0, D, 0], [0, 0, N * SH + 24], [SW, D, N * SH + 20]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  // Steps from the top (the back) down to the front, so a nearer, lower step covers the foot of the one behind it.
  const steps = [];
  for (let k = N - 1; k >= 0; k--) {
    const [r, i] = rings(x0(k), 0, x0(k) + SW, D, 2.2, 1);
    put(solid(g), prism(P, front, r, i, 0, (k + 1) * SH));
    const grp = mk("g", {}, g);
    steps[k] = { k, grp, el: solid(grp), marks: mk("path", { class: "nf lo" }, grp), up: spring(0, { eps: 0.03 }), drawn: NaN };
  }
  const ballG = mk("g", {}, g), ball = mk("path", { class: "sil" }, ballG), shine = mk("path", { class: "nf lo" }, ballG);

  function drawStep(s) {
    if (s.up.x === s.drawn) return;
    s.drawn = s.up.x;
    const [cx, cy, z] = top(s.k);
    artefact(KINDS[s.k % KINDS.length], P, front, s.el, s.marks, [cx, cy], z + s.up.x);
  }

  // The ball: where it is along the flight (a float, k + fraction), drawn as a circle with its equator.
  let pos = 0, mode = "climb", hold = 0, aim = -1, drawnPos = NaN;
  function drawBall() {
    if (pos === drawnPos) return;
    drawnPos = pos;
    const k = Math.floor(pos), f = pos - k, a = top(clamp(k, 0, N - 1)), b = top(clamp(k + 1, 0, N - 1));
    const e = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2;
    const x = lerp(a[0], b[0], e), y = D / 2 + 9, z = lerp(a[2], b[2], e) + Math.sin(Math.PI * f) * (mode === "back" ? 2 : HOP) + BALL;
    const [sx, sy] = P(x, y, z), r = BALL * C.S;
    ball.setAttribute("d", poly(circ(r, 20).map((c) => [sx + c.u, sy + c.v])));
    shine.setAttribute("d", poly(circ(r, 20).map((c) => [sx + c.u, sy + c.v * 0.32])));
    // Keep it painted just after the step it's over, so the steps in front still cover it.
    const over = clamp(Math.round(pos), 0, N - 1);
    if (ballG.previousSibling !== steps[over].grp) steps[over].grp.after(ballG);
  }

  const B = register(stage, (dt) => {
    for (const s of steps) { stepS(s.up, dt); drawStep(s); }
    const hopS = beat / 1000;
    if (aim >= 0) {
      // Going to the step under the pointer and waiting there.
      const d = aim - pos;
      pos = Math.abs(d) < 0.01 ? aim : pos + Math.sign(d) * Math.min(Math.abs(d), dt / hopS);
    } else if (mode === "climb") {
      pos = Math.min(N - 1, pos + dt / hopS);
      if (pos >= N - 1) { mode = "rest"; hold = 1.1; }
    } else if (mode === "rest") {
      hold -= dt;
      if (hold <= 0) mode = "back";
    } else {
      pos = Math.max(0, pos - (dt / hopS) * 2.2);
      if (pos <= 0) { mode = "climb"; hold = 0; }
    }
    drawBall();
    // The step the ball is on carries the bright edge, unless the pointer chose one.
    const on = aim >= 0 ? aim : Math.round(pos);
    steps.forEach((s) => s.el.sil.classList.toggle("hi", s.k === on));
    return true; // ambient: the kernel's loop sleeps it off screen
  });
  bag.add(B.unregister);

  function pick(k) {
    aim = k;
    steps.forEach((s) => { s.up.t = s.k === k ? LIFT : 0; });
    read.textContent = k < 0 ? "rest" : `${String(k + 1).padStart(2, "0")} ${PHASES[k].toLowerCase()}`;
    if (k < 0) { mode = "climb"; pos = Math.floor(pos); }
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each step's fixed top on screen (rule 01): the nearest to the pointer.
    move: ([x, y]) => {
      let best = -1, bd = Infinity;
      steps.forEach((s) => { const c = P(...top(s.k)); const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = s.k; } });
      pick(bd < 34 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  steps.forEach(drawStep);
  drawBall();
  read.textContent = "rest";
  return { set: (v) => { beat = clamp(v, 300, 1400); }, destroy: bag.dispose };
}

hairline({
  name: "stairs",
  means: "A flight of steps, one per phase: a ball climbs it and starts again; point at a step and its object lifts.",
  rules: [1, 5, 7, 8],
  range: [500, 760, 1100],
  mount,
});
