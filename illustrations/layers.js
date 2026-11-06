/**
 * Layers (KIPRUN): a running shoe's sole taken apart, the way the page takes the Kipstorm Elite apart as you scroll:
 * the outsole with its tread, the thick foam midsole, and the footbed, each cut to the same footprint (a round heel, a
 * narrow arch, a wide forefoot). The pointer's x pulls the layers apart; its height picks a layer, which takes the
 * bright edge. At rest they stand slightly apart with the midsole lit. The read-out names the layer; the slider is the
 * widest the gap can open.
 */
const { Cam, clamp, fillet, fit, hull, lerp, open, poly, proj, run, facing, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

// The footprint, heel at u = 0, toe at u = 118, medial edge at -v.
const FOOT = fillet(
  [[3, -8], [12, -12.5], [26, -12], [42, -8.5], [56, -7], [70, -12], [86, -18.5], [102, -19], [114, -13], [119, -3], [117, 7], [108, 15], [92, 19], [74, 17], [56, 13], [38, 12.5], [20, 13], [8, 11], [1, 5], [0, -2]],
  [3, 5, 6, 8, 8, 8, 8, 7, 6, 5, 6, 8, 8, 8, 10, 10, 8, 5, 3, 3],
  3,
);

/** A closed outline as a ring of samples with outward normals, so prism() can draw it; `b` insets it (its crease). */
function ringOf(pts, b = 0, scale = 1, cx = 60) {
  const p = pts.map(([u, v]) => [cx + (u - cx) * scale, v * scale]), n = p.length, out = [];
  for (let i = 0; i < n; i++) {
    const a = p[(i - 1 + n) % n], c = p[(i + 1) % n];
    let nu = c[1] - a[1], nv = -(c[0] - a[0]);
    const l = Math.hypot(nu, nv) || 1;
    nu /= l; nv /= l;
    if ((p[i][0] - cx) * nu + p[i][1] * nv < 0) { nu = -nu; nv = -nv; }
    out.push({ u: p[i][0] - nu * b, v: p[i][1] - nv * b, nu, nv });
  }
  return out;
}

const LAYERS = [
  { name: "outsole", th: 3.5, scale: 1 },
  { name: "midsole", th: 11, scale: 0.99 },
  { name: "footbed", th: 2.4, scale: 0.94 },
];
const REST_GAP = 7, LIT = 1;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gmax = value;
  const C = Cam(45, 0.5, 2.55);
  const top = LAYERS.reduce((s, l) => s + l.th, 0) + 2 * gmax;
  fit(C, [[-2, -19, 0], [120, 19, 0], [120, -19, 0], [-2, 19, 0], [0, 0, top], [120, 0, top]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const layers = LAYERS.map((l, k) => ({ ...l, k, ring: ringOf(FOOT, 0, l.scale), inner: ringOf(FOOT, 1.2, l.scale), el: solid(g), marks: mk("path", { class: "nf lo" }, g) }));
  const gap = spring(REST_GAP, { eps: 0.02 });
  let drawn = NaN;

  const zOf = (k, gp) => layers.slice(0, k).reduce((s, l) => s + l.th, 0) + k * gp;
  function draw() {
    if (gap.x === drawn) return;
    drawn = gap.x;
    layers.forEach((l) => {
      const z0 = zOf(l.k, gap.x), z1 = z0 + l.th, at = (u, v) => P(u, v, z1);
      put(l.el, { sil: poly(hull(l.ring.map((q) => P(q.u, q.v, z0)).concat(l.ring.map((q) => P(q.u, q.v, z1))))), crease: open(run(l.inner, front).map((q) => P(q.u, q.v, z1))) });
      // What each layer would really show on its top: tread on the outsole, the footbed's stitched edge.
      if (l.k === 0) l.marks.setAttribute("d", [70, 82, 94, 106].map((u) => open([at(u - 4, -11), at(u + 2, 0), at(u - 4, 11)])).join("") + [12, 22, 32].map((u) => open([at(u, -9), at(u, 9)])).join(""));
      if (l.k === 2) l.marks.setAttribute("d", poly(ringOf(FOOT, 4, l.scale).map((q) => at(q.u, q.v))));
    });
  }

  const B = register(stage, (dt) => {
    const m = stepS(gap, dt);
    draw();
    return m;
  });
  bag.add(B.unregister);

  function light(k) {
    layers.forEach((l) => l.el.sil.classList.toggle("hi", l.k === k));
    read.textContent = k < 0 ? "rest" : layers[k].name;
  }

  bag.add(pointer(stage, {
    move: ([x, y]) => {
      // x scrubs the gap; the layer is picked against the gap's target, never where the layers are drawn now (rule 01).
      gap.t = lerp(2, gmax, clamp((x - 70) / 260, 0, 1));
      let best = 0, bd = Infinity;
      layers.forEach((l) => { const c = P(60, 0, zOf(l.k, gap.t) + l.th / 2)[1]; if (Math.abs(c - y) < bd) { bd = Math.abs(c - y); best = l.k; } });
      light(bd < 40 ? best : -1);
      B.wake();
    },
    leave: () => { gap.t = REST_GAP; light(-1); layers[LIT].el.sil.classList.add("hi"); B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  draw();
  light(-1);
  layers[LIT].el.sil.classList.add("hi");
  return { set: (v) => { gmax = clamp(v, 8, 34); }, destroy: bag.dispose };
}

hairline({
  name: "layers",
  means: "A running shoe's sole taken apart: the pointer's x pulls the layers apart, its height picks one to read.",
  rules: [1, 3, 5, 9],
  range: [12, 22, 30],
  mount,
});
