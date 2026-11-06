/**
 * Theatre (Anime Sports League): a paper theatre of six cut-out layers standing one behind another on a base, the way
 * the poster was cut from one flat picture into layers that move on their own: a sky with its sun, far hills, a stand of
 * pennants, near hills, a row of chequered flags, and the ground in front. The pointer's x opens the space between the
 * layers; the layer nearest it takes the bright edge. At rest they stand close, the flags lit. The read-out names the
 * layer; the slider is the widest the layers can part.
 */
const { Cam, circ, clamp, fillet, fit, lerp, poly, prism, proj, rings, facing, spring, stepS, mk, pointer, put, register, disposer, solid } = HL;

const W = 104, TK = 1.4, REST = 8, LIT = 4;
const wave = (n, amp, base, ph) => Array.from({ length: n + 1 }, (_, i) => [W - (i / n) * W, base + Math.sin((i / n) * Math.PI * 2 * 1.2 + ph) * amp]);
const flags = (h) => { const p = []; for (let i = 0; i <= 8; i++) p.push([W - i * 13, h + (i % 2 ? 10 : 0)]); return p; };
const pennants = (h) => { const p = []; for (let i = 0; i <= 6; i++) p.push([W - i * (W / 6), h + (i % 2 ? 0 : 14)]); return p; };
/** A layer's outline: its top, then down to the base at both ends. */
const cut = (top) => [[0, 0], [W, 0], ...top];

const LAYERS = [
  { name: "sky", top: [[W, 86], [0, 86]] },
  { name: "far hills", top: wave(12, 7, 58, 0.4) },
  { name: "pennants", top: pennants(46) },
  { name: "near hills", top: wave(12, 6, 34, 2.2) },
  { name: "flags", top: flags(22) },
  { name: "ground", top: wave(10, 2, 12, 1.1) },
].map((l) => ({ ...l, shape: fillet(cut(l.top), cut(l.top).map(() => 1)) }));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gmax = value;
  const C = Cam(45, 0.5, 1.62);
  const Y1 = (LAYERS.length - 1) * gmax + 10;
  fit(C, [[-8, -8, -5], [W + 8, Y1, -5], [W + 8, -8, -5], [-8, Y1, -5], [0, 0, 86], [W, 0, 86]], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const base = solid(g);
  const layers = LAYERS.map((l, k) => ({ ...l, k, back: mk("path", { class: "lo" }, g), face: mk("path", { class: "sil" }, g), marks: mk("path", { class: "nf lo" }, g) }));
  const gap = spring(REST, { eps: 0.02 });
  let drawn = NaN;

  function draw() {
    if (gap.x === drawn) return;
    drawn = gap.x;
    const end = (LAYERS.length - 1) * gap.x;
    const [br, bi] = rings(-8, -8, W + 8, end + 8, 3, 1.4);
    put(base, prism(P, front, br, bi, -5, 0));
    layers.forEach((l) => {
      const y = l.k * gap.x, w = (u, v, t = 0) => P(u, y + t, v);
      l.back.setAttribute("d", poly(l.shape.map(([u, v]) => w(u, v, -TK))));
      l.face.setAttribute("d", poly(l.shape.map(([u, v]) => w(u, v))));
      // The sky's sun.
      if (l.k === 0) l.marks.setAttribute("d", poly(circ(9, 16).map((q) => w(72 + q.u, 66 + q.v))));
    });
  }

  const B = register(stage, (dt) => {
    const m = stepS(gap, dt);
    draw();
    return m;
  });
  bag.add(B.unregister);

  function light(k) {
    layers.forEach((l) => l.face.classList.toggle("hi", l.k === k));
    read.textContent = layers[k].name;
  }

  bag.add(pointer(stage, {
    move: ([x, y]) => {
      gap.t = lerp(REST * 0.6, gmax, clamp((x - 60) / 280, 0, 1));
      // The layer is picked against the gap's target (rule 01): the one whose top centre is nearest the pointer.
      let best = LIT, bd = Infinity;
      layers.forEach((l) => { const top = l.top.reduce((s, p) => s + p[1], 0) / l.top.length; const c = P(W / 2, l.k * gap.t, top); const d = Math.hypot(c[0] - x, c[1] - y); if (d < bd) { bd = d; best = l.k; } });
      light(best);
      B.wake();
    },
    leave: () => { gap.t = REST; layers.forEach((l) => l.face.classList.toggle("hi", l.k === LIT)); read.textContent = "rest"; B.wake(); },
  }));
  bag.add(() => svg.replaceChildren());
  draw();
  layers.forEach((l) => l.face.classList.toggle("hi", l.k === LIT));
  read.textContent = "rest";
  return { set: (v) => { gmax = clamp(v, 12, 30); }, destroy: bag.dispose };
}

hairline({
  name: "theatre",
  means: "A paper theatre of six cut-out layers: the pointer's x opens the space between them, and the nearest one lights.",
  rules: [3, 5, 6, 9],
  range: [14, 22, 28],
  mount,
});
