/**
 * Spike (Trace): a receipt spike on a round weighted base, seven slips on it, each turned a little differently, the
 * newest on top. A slip is one moment: raw saves, gathered. The pointer's height picks a slip; it squares up and rises
 * up the spike so it can be read, and the slips above it ride up with it, staggered from it. The read-out names the
 * moment, the newest being 7; the slider is the stagger, in ms.
 */
const { Cam, circ, clamp, facing, fit, prism, proj, rings, rrect, seg, tween, tset, tval, tdone, mk, pointer, put, register, disposer, solid } = HL;

const N = 7, SW = 58, SD = 40, TH = 1.4, PITCH = 7.5, Z0 = 9, LIFT = 20, TIP = Z0 + N * PITCH + LIFT + 14;
const TURN = [-18, 9, -6, 16, -12, 4, -2]; // each slip's rest angle, degrees: a pile, not a stack of identical sheets

/** A ring turned by a degrees about the spike (0, 0). */
const turn = (ring, a) => {
  const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
  return ring.map((q) => ({ u: q.u * c - q.v * s, v: q.u * s + q.v * c, nu: q.nu * c - q.nv * s, nv: q.nu * s + q.nv * c }));
};

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;
  const C = Cam(45, 0.5, 2.2);
  fit(C, [[-34, -34, 0], [34, 34, 0], [34, -34, 0], [-34, 34, 0], [0, 0, TIP], [-30, 30, Z0 + N * PITCH + LIFT]], 200, 166);
  const P = proj(C), front = facing(C);
  const slip = rrect(-SW / 2, -SD / 2, SW / 2, SD / 2, 3, 4), slipIn = rrect(-SW / 2 + 1.6, -SD / 2 + 1.6, SW / 2 - 1.6, SD / 2 - 1.6, 1.6, 4);
  const rod = circ(1.5, 10), rodIn = circ(0.7, 10);

  const g = mk("g", {}, svg);
  // The base: a weighted puck with a raised boss the spike stands in.
  put(solid(g), prism(P, front, circ(30, 24), circ(28, 24), 0, 5));
  put(solid(g), prism(P, front, circ(9, 16), circ(7.6, 16), 5, 8));

  // Each slip and the length of spike above it are drawn together, bottom to top, so a higher slip covers the spike below it.
  const parts = [];
  for (let k = 0; k < N; k++) {
    parts.push({ k, el: solid(g), lines: mk("path", { class: "nf lo" }, g), rod: solid(g), a: tween(TURN[k]), z: tween(0), drawn: "" });
  }
  const tip = solid(g);

  const zOf = (p, now) => Z0 + p.k * PITCH + tval(p.z, now);
  function draw(now) {
    let below = 8;
    parts.forEach((p) => {
      const a = tval(p.a, now), z = zOf(p, now), key = a.toFixed(2) + "," + z.toFixed(2);
      if (key !== p.drawn) {
        p.drawn = key;
        put(p.el, prism(P, front, turn(slip, a), turn(slipIn, a), z, z + TH));
        // Two printed rules on the slip: what was saved, and when.
        const on = (u, v) => { const r = turn([{ u, v, nu: 0, nv: 0 }], a)[0]; return P(r.u, r.v, z + TH); };
        p.lines.setAttribute("d", seg(on(-SW / 2 + 7, -6), on(SW / 2 - 12, -6)) + seg(on(-SW / 2 + 7, 1), on(SW / 2 - 22, 1)) + seg(on(-SW / 2 + 7, 8), on(-4, 8)));
      }
      put(p.rod, prism(P, front, rod, rodIn, below, z));
      below = z + TH;
    });
    put(tip, prism(P, front, circ(1.1, 10), circ(0.5, 10), below, TIP));
  }

  const B = register(stage, (_dt, now) => {
    draw(now);
    return parts.some((p) => !tdone(p.a, now) || !tdone(p.z, now));
  });
  bag.add(B.unregister);

  let act = -2;
  /** Pulls slip a (-1 lets them all back). It squares up and rises; the slips above it rise with it, staggered from it. */
  function pick(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : Math.max(0, act);
    act = a;
    parts.forEach((p) => {
      const delay = Math.abs(p.k - from) * stag;
      tset(p.a, a === p.k ? 0 : TURN[p.k], now, delay);
      tset(p.z, a >= 0 && p.k >= a ? LIFT : 0, now, delay);
      p.el.sil.classList.toggle("hi", p.k === (a < 0 ? N - 1 : a));
    });
    read.textContent = a < 0 ? "rest" : `moment ${a + 1}`;
    B.wake();
  }

  bag.add(pointer(stage, {
    // Picked by each slip's rest height on screen (rule 01), never by where a lifted slip is drawn now.
    move: ([x, y]) => {
      if (Math.abs(x - P(0, 0, 0)[0]) > 70) return pick(-1);
      let best = -1, bd = Infinity;
      parts.forEach((p) => { const d = Math.abs(P(0, 0, Z0 + p.k * PITCH)[1] - y); if (d < bd) { bd = d; best = p.k; } });
      pick(bd < PITCH * 1.6 ? best : -1);
    },
    leave: () => pick(-1),
  }));
  bag.add(() => svg.replaceChildren());
  draw(performance.now());
  pick(-1);
  return { set: (v) => { stag = clamp(v, 0, 120); }, destroy: bag.dispose };
}

hairline({
  name: "spike",
  means: "Moments on a receipt spike, newest on top: the one at the pointer's height squares up and rises so it can be read.",
  rules: [1, 2, 5, 8],
  range: [0, 45, 90],
  mount,
});
